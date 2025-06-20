const prisma = require("../config/prisma");

const getEventParticipants = async (req, res) => {
  try {
    const participants = await prisma.eventParticipant.findMany({
      where: {
        eventId: parseInt(req.params.eventId),
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        guest: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to return normal field names
    const formattedParticipants = participants.map((p) => ({
      id: p.id,
      status: p.status,
      created_at: p.createdAt,
      fullName: p.user?.fullName || p.guest?.fullName,
      email: p.user?.email || p.guest?.email,
      type: p.user ? "registered" : "guest",
    }));

    res.json(formattedParticipants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addRegisteredParticipant = async (req, res) => {
  const { userId, status = "pending" } = req.body;

  try {
    // Check if event exists and get creator info
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.eventId) },
      select: { id: true, createdBy: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if current user is the event creator
    if (event.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Only event creators can manage participants" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already a participant
    const existingParticipant = await prisma.eventParticipant.findFirst({
      where: {
        eventId: parseInt(req.params.eventId),
        userId: userId,
      },
    });

    if (existingParticipant) {
      return res.status(400).json({ error: "User is already a participant" });
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        eventId: parseInt(req.params.eventId),
        userId: userId,
        status: status,
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addGuestParticipant = async (req, res) => {
  const { email, fullName, status = "pending" } = req.body;

  try {
    // Check if event exists and get creator info
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.eventId) },
      select: { id: true, createdBy: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if current user is the event creator
    if (event.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Only event creators can manage participants" });
    }

    // Create guest user and add as participant in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const guest = await prisma.guestUser.create({
        data: {
          email,
          fullName,
        },
      });

      const participant = await prisma.eventParticipant.create({
        data: {
          eventId: parseInt(req.params.eventId),
          guestId: guest.id,
          status: status,
        },
      });

      return participant;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding guest participant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateParticipantStatus = async (req, res) => {
  const { status } = req.body;

  if (!["pending", "confirmed", "declined"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    // Get participant with event info to check permissions
    const participant = await prisma.eventParticipant.findUnique({
      where: { id: parseInt(req.params.participantId) },
      include: {
        event: {
          select: { createdBy: true },
        },
      },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    // Check if current user is the event creator or the participant themselves
    if (participant.event.createdBy !== req.user.id && participant.userId !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own participation status or manage participants as an event creator" });
    }

    const updatedParticipant = await prisma.eventParticipant.update({
      where: { id: parseInt(req.params.participantId) },
      data: {
        status: status,
      },
    });

    res.json(updatedParticipant);
  } catch (error) {
    console.error("Error updating participant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeParticipant = async (req, res) => {
  try {
    // Get participant with event info to check permissions
    const participant = await prisma.eventParticipant.findUnique({
      where: { id: parseInt(req.params.participantId) },
      include: {
        event: {
          select: { createdBy: true },
        },
      },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    // Check if current user is the event creator or the participant themselves
    if (participant.event.createdBy !== req.user.id && participant.userId !== req.user.id) {
      return res.status(403).json({ error: "You can only remove yourself from an event or manage participants as an event creator" });
    }

    await prisma.eventParticipant.delete({
      where: { id: parseInt(req.params.participantId) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getEventParticipants,
  addRegisteredParticipant,
  addGuestParticipant,
  updateParticipantStatus,
  removeParticipant,
};
