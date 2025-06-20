require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const {
  generalLimiter,
  authLimiter,
} = require("./middleware/rateLimit");

const eventsRouter = require("./routes/events");
const participantsRouter = require("./routes/participants");
const authRouter = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};

// Security middleware
app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Public routes (no authentication required) - with stricter auth rate limiting
app.use("/api/auth", authLimiter, authRouter);

// Routes that require JWT authentication
app.use("/api/events", eventsRouter);
app.use("/api/participants", participantsRouter);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Eventra API",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something bad happened!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
