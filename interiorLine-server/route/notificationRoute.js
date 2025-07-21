const express = require("express");
const router = express.Router();
const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require("../controller/notificationController");

const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getUserNotifications);
router.patch("/:notificationId/read", authenticateToken, markNotificationAsRead);
router.patch("/read-all", authenticateToken, markAllNotificationsAsRead);

module.exports = router;