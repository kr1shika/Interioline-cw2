const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    endpoint: { type: String },
    method: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
