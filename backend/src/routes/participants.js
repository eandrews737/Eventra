const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const {
  getEventParticipants,
  addRegisteredParticipant,
  addGuestParticipant,
  updateParticipantStatus,
  removeParticipant,
} = require("../controllers/participantController");

// All routes require authentication
router.use(isLoggedIn);

// Participant routes
router.get("/event/:eventId", getEventParticipants);
router.post("/event/:eventId/user", addRegisteredParticipant);
router.post("/event/:eventId/guest", addGuestParticipant);
router.patch("/:participantId", updateParticipantStatus);
router.delete("/:participantId", removeParticipant);

module.exports = router; 