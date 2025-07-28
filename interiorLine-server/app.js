const express = require('express');
const dotenv = require("dotenv");
const https = require('https');
const fs = require('fs');
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const cors = require("cors");
const path = require("path");

dotenv.config({ path: "./config/config.env" });
const connectDB = require('./config/db');

const projectRouter = require("./route/projectRoute");
const authRouter = require("./route/authRoute");
const chatRouter = require("./route/chatRoomroute");
const userRouter = require("./route/userRoute");
const quizRouter = require("./route/matchRoute");
const paymentRouter = require("./route/paymentRoute");
const portfolioRouter = require("./route/portfolioROute");
const notificationRoutes = require("./route/notificationRoute");
const passwordChangeRoutes = require("./route/passwordchangeroute");
const reviewRoute = require("./route/reviewRoute");

const app = express();
const PORT = 2005;

// ✅ Setup HTTPS
const options = {
  key: fs.readFileSync('certs/localhost-key.pem'),
  cert: fs.readFileSync('certs/localhost.pem'),
};

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS Configuration
app.use(cors({
  origin: "https://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

// ✅ Webhook route first
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// ✅ Basic Middleware
app.use(express.json());
app.use(cookieParser());

// additionla security headers
// ✅ Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self';");

  next();
});


// ✅ Static Files
app.use("/profile_pics", express.static(path.join(__dirname, "profile_pics")));
app.use("/portfolio_uploads", express.static(path.join(__dirname, "portfolio_uploads")));
app.use("/chatUploads", express.static("chatUploads"));

// ✅ CSRF Middleware
app.use(csrf({ cookie: true }));

// ✅ CSRF Token Route
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Application Routes
app.use("/api/portfolio", portfolioRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/password-change", passwordChangeRoutes);
app.use("/api/review", reviewRoute);
app.use("/api/payment", paymentRouter); // after webhook
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/project", projectRouter);
app.use("/api/chat", chatRouter);
app.use("/api/quiz", quizRouter);

// ✅ CSRF Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ errors: ["CSRF validation failed."] });
  }
  next(err);
});

// ✅ Start HTTPS Server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
