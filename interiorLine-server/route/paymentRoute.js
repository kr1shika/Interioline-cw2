const express = require('express');
const router = express.Router();
const {
    createPayment,
    getPaymentHistory,

} = require('../controller/paymentController');
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Existing routes
router.post('/create', authenticateToken, authorizeRole(["client"]), createPayment);
router.get('/history', authenticateToken, getPaymentHistory);

module.exports = router;