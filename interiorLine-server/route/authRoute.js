const express = require("express");
const router = express.Router();
const { authenticateToken, bruteForceProtection } = require('../middleware/authMiddleware');

const {
    loginRequest, verifyOtp,
    signup, logout
} = require('../controller/authController.js');

router.post('/signup', signup);

router.post('/login', bruteForceProtection, loginRequest);
router.post('/verify-otp', bruteForceProtection, verifyOtp);

router.get('/me', authenticateToken, (req, res) => {
    res.status(200).json(req.user);
});
router.post('/logout', logout);

module.exports = router;