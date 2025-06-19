const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// All routes require authentication
router.use(isLoggedIn);

// Event routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router; 