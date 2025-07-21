const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

const {
    loginRequest, verifyOtp,
    signup, logout
} = require('../controller/authController.js');

router.post('/signup', signup);

router.post('/login', loginRequest);
router.post('/verify-otp', verifyOtp);

router.get('/me', authenticateToken, (req, res) => {
    res.status(200).json(req.user);
});
router.post('/logout', logout);

module.exports = router;