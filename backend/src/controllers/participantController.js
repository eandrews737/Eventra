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

    // Transform the data to match the expected format
    const formattedParticipants = participants.map((p) => ({
      id: p.id,
      status: p.status,
      created_at: p.createdAt,
      participant_name: p.user?.fullName || p.guest?.fullName,
      participant_email: p.user?.email || p.guest?.email,
      participant_type: p.user ? "registered" : "guest",
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
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.eventId) },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
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
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.eventId) },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
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
    const participant = await prisma.eventParticipant.update({
      where: { id: parseInt(req.params.participantId) },
      data: {
        status: status,
      },
    });

    res.json(participant);
  } catch (error) {
    console.error("Error updating participant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeParticipant = async (req, res) => {
  try {
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
