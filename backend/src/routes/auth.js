const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const {
  register,
  login,
  refresh,
  getCurrentUser,
  validateToken,
  logout,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.get("/me", isLoggedIn, getCurrentUser);
router.post("/validate", isLoggedIn, validateToken);
router.post("/logout", isLoggedIn, logout);

module.exports = router; 