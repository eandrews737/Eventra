const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const {
  getAllEvents,
  getDashboardEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  getCurrentUserParticipantId,
} = require("../controllers/eventController");

// Routes that require a specific string should come before routes with dynamic parameters

// Special route for the user's dashboard
router.get("/dashboard", isLoggedIn, getDashboardEvents);

// Event routes
router.get("/", isLoggedIn, getAllEvents);
router.post("/", isLoggedIn, createEvent);
router.get("/:id", isLoggedIn, getEventById);
router.post("/:id/join", isLoggedIn, joinEvent);
router.get("/:id/participant", isLoggedIn, getCurrentUserParticipantId);
router.put("/:id", isLoggedIn, updateEvent);
router.delete("/:id", isLoggedIn, deleteEvent);

module.exports = router;
