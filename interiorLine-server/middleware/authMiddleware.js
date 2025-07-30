// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const loginAttempts = new Map();
const requestLimits = new Map();
const blacklistedTokens = new Set();
const Session = require("../model/Session");

const authenticateToken = async (req, res, next) => {
    try {
        let token = req.cookies?.interio_token;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ errors: ["Access denied. No token provided."] });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const session = await Session.findOne({ sessionId: decoded.sessionId, valid: true });
        if (!session) {
            return res.status(401).json({ errors: ["Session invalid or expired."] });
        }
        const user = await User.findById(decoded.userId).select("-password -passwordHistory");
        req.user = user;
        req.userId = user._id.toString();
        req.token = token;
        req.sessionId = decoded.sessionId;
        // console.log("🔍 Session validated:", session);
        next();
    } catch (err) {
        return res.status(401).json({ errors: ["Invalid or expired token"] });
    }
};

// 🔐 Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                errors: ["Access denied. Please login."]
            });
        }
        const userRole = req.user.role?.toLowerCase();
        const normalizedRoles = allowedRoles.map(role => role.toLowerCase());
        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                errors: ["Access denied. Insufficient permissions."],
                required: allowedRoles,
                current: req.user.role
            });
        }
        next();
    };
};

const verifyOwnership = (req, res, next) => {
    const resourceUserId = req.params.userId || req.params.id;
    const requestingUserId = req.userId;

    if (resourceUserId !== requestingUserId) {
        return res.status(403).json({
            errors: ["Access denied. You can only access your own resources."]
        });
    }

    next();
};

const checkGlobalLocks = async (req, res, next) => {
    const user = await User.findById(req.userId);

    const floodLock = user?.lock?.activityFlood?.lockedUntil;
    if (floodLock && Date.now() < new Date(floodLock)) {
        const mins = Math.ceil((new Date(floodLock) - Date.now()) / 60000);
        return res.status(403).json({ error: `Your account is locked due to abnormal activity. Try again in ${mins} minutes.` });
    }

    next();
};


const bruteForceProtection = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const key = `${clientIP}_${req.route?.path || req.path}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 10; // Adjust based on endpoint sensitivity

    // Clean old entries
    for (let [k, v] of requestLimits.entries()) {
        if (now - v.firstAttempt > windowMs) {
            requestLimits.delete(k);
        }
    }

    const attempts = requestLimits.get(key);

    if (attempts && attempts.count >= maxAttempts) {
        const timeLeft = windowMs - (now - attempts.firstAttempt);
        return res.status(429).json({
            errors: [`Too many requests. Try again in ${Math.ceil(timeLeft / 60000)} minutes`]
        });
    }

    // Track attempt
    if (attempts) {
        attempts.count++;
    } else {
        requestLimits.set(key, { count: 1, firstAttempt: now });
    }

    next();
};

// 🔐 Login attempt tracking for specific users
const trackLoginAttempt = (email, success = false) => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    if (!loginAttempts.has(email)) {
        loginAttempts.set(email, { count: 0, firstAttempt: now, lockedUntil: null });
    }

    const attempts = loginAttempts.get(email);

    // Reset if window expired
    if (now - attempts.firstAttempt > windowMs) {
        attempts.count = 0;
        attempts.firstAttempt = now;
        attempts.lockedUntil = null;
    }

    if (success) {
        // Reset on successful login
        loginAttempts.delete(email);
    } else {
        attempts.count++;
        if (attempts.count >= maxAttempts) {
            attempts.lockedUntil = now + windowMs;
        }
    }
};

const checkAccountLock = (email) => {
    const attempts = loginAttempts.get(email);
    if (attempts && attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const timeLeft = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
        return `Account locked. Try again in ${timeLeft} minutes`;
    }
    return null;
};

const ActivityLog = require("../model/activityLog"); // add this
const MAX_ACTIVITY_LOGS = 80;

const logActivity = (action) => {
    return async (req, res, next) => {
        try {
            const logEntry = new ActivityLog({
                userId: req.userId,
                action,
                endpoint: req.originalUrl,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });

            await logEntry.save();

            // Count recent logs (past 1 hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const count = await ActivityLog.countDocuments({
                userId: req.userId,
                createdAt: { $gte: oneHourAgo }
            });

            if (count >= MAX_ACTIVITY_LOGS) {
                await User.findByIdAndUpdate(req.userId, {
                    $set: {
                        "lock.activityFlood.lockedUntil": new Date(Date.now() + 60 * 60 * 1000) // 1 hour lock
                    }
                });
                return res.status(429).json({ error: "Account temporarily locked due to excessive activity. Try again later." });
            }

            next();
        } catch (err) {
            console.error("Activity log error:", err);
            next(); // Don’t block on logging error
        }
    };
};

const checkPasswordExpiry = (req, res, next) => {
    const passwordChangedAt = req.user?.passwordChangedAt || req.user?.lastPasswordChange;
    const expiryPeriod = 60 * 24 * 60 * 60 * 1000; // 60 days

    if (passwordChangedAt && (Date.now() - new Date(passwordChangedAt)) > expiryPeriod) {
        return res.status(403).json({
            errors: ["Password expired. Please update your password."]
        });
    }
    next();
};


module.exports = {
    logActivity,
    authenticateToken,
    authorizeRole,
    verifyOwnership,
    bruteForceProtection,
    trackLoginAttempt,
    checkAccountLock,
    checkPasswordExpiry, checkGlobalLocks

};