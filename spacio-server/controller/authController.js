const bcrypt = require("bcrypt");
const { generateToken } = require("../config/util.js");
const User = require("../model/user.js");
const jwt = require("jsonwebtoken");
const { trackLoginAttempt, checkAccountLock } = require("../middleware/authMiddleware.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

let pendingSignups = {};

const signup = async (req, res) => {
    const { full_name, email, password, role } = req.body;

    try {
        const errors = [];
        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ errors: ["All fields are required"] });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ errors: ["Email already registered"] });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        // Save signup data temporarily (in production, use Redis or DB)
        pendingSignups[email.toLowerCase()] = {
            full_name,
            email: email.toLowerCase(),
            password: await bcrypt.hash(password, 12),
            role,
            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        };

        await transporter.sendMail({
            from: `"InterioLine" <${process.env.EMAIL_USER}>`,
            to: email,

            subject: "Verify your InterioLine account",
            text: `Your signup OTP is: ${otp}`
        });
        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
        if (!strongPassword.test(password)) {
            return res.status(400).json({ errors: ["Password must include upper, lower, number, and special character. Min 8 chars."] });
        }


        res.status(200).json({ message: "OTP sent. Please verify." });

    } catch (err) {
        console.error("Signup OTP error:", err);
        res.status(500).json({ errors: ["Internal error during signup."] });
    }
};


const loginRequest = async (req, res) => {
    console.log("🚀 LOGIN endpoint hit:", req.body);

    const { email, password } = req.body;

    const lockMessage = checkAccountLock(email);
    if (lockMessage) {
        return res.status(429).json({ errors: [lockMessage] });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        trackLoginAttempt(email, false);
        return res.status(401).json({ errors: ["Invalid credentials"] });
    }

    trackLoginAttempt(email, true);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpVerified = false;
    await user.save();

    try {
        await transporter.sendMail({
            from: `"InterioLine" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}`,
        });
    } catch (mailErr) {
        console.error("❌ Failed to send OTP email:", mailErr);
        return res.status(500).json({ errors: ["Failed to send OTP. Try again later."] });
    }

    console.log("✅ OTP email sent and user updated:", email);
    res.json({ message: "OTP sent to your email" });
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });

    // 🔐 Init lock if missing
    if (!user.lock || !user.lock.otp) {
        user.lock = {
            ...(user.lock || {}),
            otp: {
                attempts: 0,
                lockedUntil: null
            }
        };
    }

    // 🔐 Check OTP lock
    if (user.lock.otp.lockedUntil && Date.now() < new Date(user.lock.otp.lockedUntil)) {
        const mins = Math.ceil((new Date(user.lock.otp.lockedUntil) - Date.now()) / 60000);
        return res.status(429).json({ error: `Too many OTP attempts. Try again in ${mins} minutes.` });
    }

    // 🔐 Verify OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (user.otp !== hashedOtp || user.otpExpiry < Date.now()) {
        user.lock.otp.attempts += 1;
        if (user.lock.otp.attempts >= 5) {
            user.lock.otp.lockedUntil = new Date(Date.now() + 60 * 60 * 1000); // lock for 1 hr
        }
        await user.save();
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // ✅ Check password expiry (2 months = 60 days)
    const expiryDays = 60;
    const changedAt = user.passwordChangedAt || user.lastPasswordChange;
    if (changedAt) {
        const expiryDate = new Date(changedAt);
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        if (Date.now() > expiryDate) {
            return res.status(403).json({ error: "Your password has expired. Please change your password to continue." });
        }
    }

    // ✅ Reset OTP and lock
    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.lock.otp.attempts = 0;
    user.lock.otp.lockedUntil = null;
    await user.save();

    await generateToken(user._id, res, req);

    res.status(200).json({
        message: "OTP verified successfully",
        user: {
            full_name: user.full_name,
            email: user.email,
            role: user.role,
        },
    });
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                errors: ["Current password and new password are required"]
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ errors: ["User not found"] });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ errors: ["Current password is incorrect"] });
        }



        // Check password history to prevent reuse
        const isReused = await Promise.all(
            user.passwordHistory.map(oldHash => bcrypt.compare(newPassword, oldHash))
        );

        if (isReused.some(match => match)) {
            return res.status(400).json({
                errors: ["Cannot reuse recent passwords"]
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password and history
        user.password = hashedNewPassword;
        user.passwordHistory.push(hashedNewPassword);

        // Keep only last 5 passwords
        if (user.passwordHistory.length > 5) {
            user.passwordHistory = user.passwordHistory.slice(-5);
        }

        user.passwordChangedAt = new Date();
        await user.save();

        // Log activity
        console.log(`Password changed: ${user.email} at ${new Date().toISOString()}`);

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ errors: ["Internal server error"] });
    }
};

const Session = require("../model/Session.js");

const logout = async (req, res) => {
    try {
        const token = req.cookies?.interio_token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded?.sessionId) {
                await Session.updateOne(
                    { sessionId: decoded.sessionId },
                    { valid: false }
                );
            }
        }

        res.clearCookie("interio_token", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        });

        res.status(200).json({ message: "Logged out" });

    } catch (err) {
        console.error("Logout error:", err.message);
        res.clearCookie("interio_token");
        res.status(200).json({ message: "Logged out (fallback)" });
    }
};

const verifyRegistrationOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const signupData = pendingSignups[email.toLowerCase()];
        if (!signupData) {
            return res.status(400).json({ error: "Signup session expired or not found" });
        }

        const hashedInputOtp = crypto.createHash("sha256").update(otp).digest("hex");

        if (
            signupData.otp !== hashedInputOtp ||
            Date.now() > signupData.otpExpiry
        ) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // ✅ Create the user now
        const newUser = new User({
            full_name: signupData.full_name,
            email: signupData.email,
            password: signupData.password,
            role: signupData.role,
            otpVerified: true,
            createdAt: new Date(),
            lastLogin: null,
            loginAttempts: 0,
            accountLocked: false,
            passwordHistory: [signupData.password],
            passwordChangedAt: new Date(),
        });

        await newUser.save();

        // 🧹 Clear temporary data
        delete pendingSignups[email.toLowerCase()];

        res.status(200).json({ message: "OTP verified and account created!" });

    } catch (err) {
        console.error("OTP verify error:", err);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
};

module.exports = {
    signup,
    verifyRegistrationOtp,
    loginRequest,
    verifyOtp,
    changePassword,
    logout
};
