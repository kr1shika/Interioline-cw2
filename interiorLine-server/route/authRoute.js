const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

const {
    login,
    signup, logout
} = require('../controller/authController.js');

router.post('/signup', signup);

router.post('/login', login);

router.get('/me', authenticateToken, (req, res) => {
    res.status(200).json(req.user);
});
router.post('/logout', logout);

module.exports = router;