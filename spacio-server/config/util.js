

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../model/Session.js");
const generateToken = async (userId, res, req) => {
  const sessionId = crypto.randomUUID();

  await Session.create({
    sessionId,
    userId,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const token = jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("interio_token", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });

  return token;
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
