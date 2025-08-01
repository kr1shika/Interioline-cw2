const mongoose = require("mongoose");

const portfolioPostSchema = new mongoose.Schema({
    designer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            required: false
        },
        is_primary: {
            type: Boolean,
            default: false
        }
    }],
    tags: [{
        type: String,
        required: false
    }],
    view_count: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const PortfolioPost = mongoose.model("PortfolioPost", portfolioPostSchema);
module.exports = PortfolioPost;