const express = require("express");
const router = express.Router();
const { checkGlobalLocks, authenticateToken, trackLoginAttempt, bruteForceProtection, logActivity } = require('../middleware/authMiddleware.js');
const rateLimiter = require("../middleware/rateLimiter.js");

const {
    loginRequest, verifyOtp,
    signup, logout, verifyRegistrationOtp
} = require('../controller/authController.js');

router.post('/signup', rateLimiter({ windowMs: 10 * 60 * 1000, max: 5 }), logActivity("Signup Attempt"), signup);
router.post('/login', rateLimiter({ windowMs: 10 * 60 * 1000, max: 5 }), bruteForceProtection, logActivity("Login Attempt"), loginRequest);
router.post('/verify-otp', rateLimiter({ windowMs: 10 * 60 * 1000, max: 5 }), bruteForceProtection, checkGlobalLocks, logActivity("OTP Verification"), verifyOtp);
router.post('/logout', logActivity("Logout"), logout);
router.post("/verify-registration-otp", rateLimiter({ windowMs: 10 * 60 * 1000, max: 5 }), bruteForceProtection, logActivity("Registration OTP Verify"), verifyRegistrationOtp);
router.get('/me', authenticateToken, checkGlobalLocks, (req, res) => {
    res.status(200).json(req.user);
});

module.exports = router;