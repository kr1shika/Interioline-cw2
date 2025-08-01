//  chatRoomroute.js — Secured version
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const chatController = require("../controller/chatController");
const Chatroom = require("../model/chat-room");
const uploadDir = "chatUploads";
const fs = require("fs");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📁 File upload config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
    },
});
const upload = multer({ storage });

//  Fetch all messages for a project
router.get("/:projectId", authenticateToken, chatController.getMessagesByProject);

//  Send message to a project room (with attachments)
router.post("/:projectId", authenticateToken, upload.array("attachments"), chatController.sendMessageToRoom);

//  Get all chatrooms the logged-in user is part of
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;

        const rooms = await Chatroom.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$projectId",
                    latestMessage: { $first: "$text" },
                    timestamp: { $first: "$createdAt" },
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "project"
                }
            },
            { $unwind: "$project" }
        ]);

        res.status(200).json(rooms);
    } catch (err) {
        console.error("Error fetching chatrooms:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
