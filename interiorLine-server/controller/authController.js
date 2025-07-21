const bcrypt = require("bcrypt");
const { generateToken } = require("../config/util.js");
const User = require("../model/user");
const { trackLoginAttempt, checkAccountLock } = require("../middleware/authMiddleware");

const signup = async (req, res) => {
    const { full_name, email, password, role } = req.body;
    try {
        const errors = [];
        if (!full_name) errors.push("Full name is required");
        if (!email) errors.push("Email is required");
        if (!password) errors.push("Password is required");
        if (!role) errors.push("Role is required");

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push("Please enter a valid email address");
        }

        // Role validation
        if (!["client", "designer"].includes(role)) {
            errors.push("Invalid role specified");
        }
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ errors: ["Email already registered"] });
        }

        // Hash password with higher cost for better security
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with additional security fields
        const newUser = new User({
            full_name: full_name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginAttempts: 0,
            accountLocked: false,
            passwordHistory: [hashedPassword], // Store for password reuse prevention
            passwordChangedAt: new Date()
        });

        await newUser.save();

        // Generate token and set secure cookie
        const token = generateToken(newUser._id, res);

        // Log activity (implement activity logging)
        console.log(`User registered: ${email} at ${new Date().toISOString()}`);

        // Return user data (excluding sensitive information)
        res.status(201).json({
            _id: newUser._id,
            full_name: newUser.full_name,
            email: newUser.email,
            role: newUser.role,
            profile_picture: newUser.profile_picture,
            token: token // Include token for client-side storage if needed
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ errors: ["Internal server error"] });
    }
};

// add at top
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// const User = require("../model/user");
// const { generateToken } = require("../config/util");

const loginRequest = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid 10 mins
    user.otpVerified = false;
    await user.save();

    // send OTP to email
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"InterioLine" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`,
    });

    res.json({ message: "OTP sent to your email" });
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.otp !== hashedOtp || user.otpExpiry < Date.now()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // After successful OTP validation
    generateToken(user._id, res);  // set secure HTTP-only cookie

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

const logout = (req, res) => {
    res.clearCookie("interio_token", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    });
    return res.status(200).json({ message: "Logged out" });
};


module.exports = {
    signup,
    loginRequest,
    verifyOtp,
    changePassword,
    logout
};
