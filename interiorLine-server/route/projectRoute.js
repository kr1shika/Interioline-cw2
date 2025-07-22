// route/projectRoute.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticateToken } = require("../middleware/authMiddleware");

const {
    createProject,
    getMyProjects,
    updateProjectStatus,
    updateProjectRoomDetails,
    getDesignerStats,
    getDesignerPerformance,
    getProjectRevenue
} = require("../controller/projectController");

// Ensure uploads directory exists
const roomImagesDir = "room_images";
if (!fs.existsSync(roomImagesDir)) fs.mkdirSync(roomImagesDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, roomImagesDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Project routes
router.post("/createProject", authenticateToken, createProject);
router.get("/my", authenticateToken, getMyProjects);
router.patch("/:projectId/status", authenticateToken, updateProjectStatus);
router.patch(
    "/:projectId/room-details",
    authenticateToken,
    upload.array("room_images", 10),
    updateProjectRoomDetails
);

// Designer stats
router.get("/designer/stats", authenticateToken, getDesignerStats);
router.get("/designer/performance", authenticateToken, getDesignerPerformance);
router.get("/designer/revenue", authenticateToken, getProjectRevenue);

module.exports = router;
