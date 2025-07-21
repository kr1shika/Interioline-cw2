// models/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip: String,
  userAgent: String,
  valid: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, expires: "15d" } // auto-expire
});

module.exports = mongoose.model("Session", sessionSchema);
