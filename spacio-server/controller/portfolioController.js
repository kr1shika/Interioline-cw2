const PortfolioPost = require("../model/portforlio-posts");
const fs = require("fs");
const path = require("path");

const createPortfolioPost = async (req, res) => {
    try {
        const { title, tags, captions = [], primaryIndex = 0 } = req.body;
        const designerId = req.user?._id;

        if (!designerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded." });
        }

        const images = req.files.map((file, index) => ({
            url: `/portfolio_uploads/${file.filename}`,
            caption: captions[index] || "",
            is_primary: index === Number(primaryIndex),
        }));

        const post = new PortfolioPost({
            designer: designerId,
            title,
            tags: Array.isArray(tags) ? tags : [tags],
            images,
        });

        await post.save();
        res.status(201).json({ message: "Portfolio post created" });
    } catch (error) {
        console.error("Error creating portfolio post:", error);
        res.status(500).json({ message: "Failed to create portfolio post", error: error.message });
    }
};

const getUserPortfolioPosts = async (req, res) => {
    try {
        const designerId = req.userId || req.params.designerId;

        if (!designerId) {
            return res.status(400).json({ message: "Designer ID is required." });
        }

        const posts = await PortfolioPost.find({ designer: designerId }).sort({ createdAt: -1 });

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error fetching portfolio posts:", error);
        res.status(500).json({ message: "Failed to fetch portfolio posts." });
    }
};

const deletePortfolioPost = async (req, res) => {
    try {
        const post = await PortfolioPost.findOneAndDelete({
            _id: req.params.postId, // must match route param name
            designer: req.user._id,
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found or unauthorized" });
        }

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("Error deleting portfolio post:", err);
        res.status(500).json({ message: "Failed to delete post" });
    }
};

const getMyPortfolioPosts = async (req, res) => {
    try {
        const posts = await PortfolioPost.find({ designer: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        console.error("Error fetching portfolio posts:", err);
        res.status(500).json({ message: "Failed to fetch portfolio posts" });
    }
};


module.exports = { createPortfolioPost, getUserPortfolioPosts, deletePortfolioPost, getMyPortfolioPosts };