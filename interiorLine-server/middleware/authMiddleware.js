// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../model/user");

// Rate limiting storage (use Redis in production)
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

// 🔐 User ownership verification (user can only access their own data)
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

// 🔐 Brute force protection middleware
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

const logActivity = (action) => {
    return (req, res, next) => {
        const logData = {
            userId: req.userId,
            action,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            timestamp: new Date(),
            endpoint: req.originalUrl,
            method: req.method
        };
        next();
    };
};
module.exports = {
    logActivity,
    authenticateToken,
    authorizeRole,
    verifyOwnership,
    bruteForceProtection,
    trackLoginAttempt,
    checkAccountLock,

};