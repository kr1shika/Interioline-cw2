

const express = require("express");
const router = express.Router();
const {
    createReview,
    getProjectReview,
    getDesignerRatingAnalytics,
    getReviewableProjects,
    updateReview,
    getMyReviews
} = require("../controller/reviewController.js");
const { authenticateToken } = require("../middleware/authMiddleware.js");


router.get("/me", authenticateToken, getMyReviews);

// Basic review operations
router.post("/", createReview);                                    // POST /api/review - Create a new review
router.get("/project/:projectId", getProjectReview);               // GET /api/review/project/:projectId - Get review for a specific project
router.put("/:reviewId", updateReview);                           // PUT /api/review/:reviewId - Update an existing review

// Designer-related review endpoints
router.get("/designer/:designerId/analytics", getDesignerRatingAnalytics); // GET /api/review/designer/:designerId/analytics - Get detailed rating analytics

// Client-related review endpoints
router.get("/client/:clientId/reviewable", getReviewableProjects); // GET /api/review/client/:clientId/reviewable - Get projects that can be reviewed

module.exports = router;