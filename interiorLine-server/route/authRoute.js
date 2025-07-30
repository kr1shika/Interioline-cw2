const express = require("express");
const router = express.Router();
const { checkGlobalLocks,authenticateToken, bruteForceProtection ,logActivity } = require('../middleware/authMiddleware');

const {
    loginRequest, verifyOtp,
    signup, logout,verifyRegistrationOtp
} = require('../controller/authController.js');

router.post('/signup', signup);

router.post('/login', bruteForceProtection, loginRequest);
router.post('/verify-otp', bruteForceProtection, verifyOtp);

router.get('/me', authenticateToken,checkGlobalLocks, (req, res) => {
    res.status(200).json(req.user);
});
router.post('/logout', logout);
router.post("/verify-registration-otp", bruteForceProtection,verifyRegistrationOtp);

module.exports = router;