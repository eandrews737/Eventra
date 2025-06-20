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

// Participant routes
router.get("/event/:eventId", isLoggedIn, getEventParticipants);
router.post("/event/:eventId/user", isLoggedIn, addRegisteredParticipant);
router.post("/event/:eventId/guest", isLoggedIn, addGuestParticipant);
router.patch("/:participantId", isLoggedIn, updateParticipantStatus);
router.delete("/:participantId", isLoggedIn, removeParticipant);

module.exports = router; 