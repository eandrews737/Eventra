const prisma = require("../config/prisma");

const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDatetime: "asc" },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Add participation status to each event for the current user
    const eventsWithStatus = await Promise.all(
      events.map(async (event) => {
        // Get participant data directly for this event and user
        const participant = await prisma.eventParticipant.findFirst({
          where: {
            eventId: event.id,
            userId: req.user?.id,
          },
          select: { id: true, status: true },
        });

        const isParticipant = !!participant;
        const participationStatus = participant?.status || null;
        const participantId = participant?.id || null;

        // Get total participant count for this event
        const totalParticipantCount = await prisma.eventParticipant.count({
          where: { eventId: event.id },
        });

        // Remove the participants array from the final object to keep the payload clean
        const { participants, ...eventData } = event;
        return {
          ...eventData,
          createdBy: event.createdBy, // Explicitly include createdBy field
          isParticipant,
          participationStatus,
          participantId,
          participantCount: totalParticipantCount,
        };
      })
    );

    res.json(eventsWithStatus);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
};

const getDashboardEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    // Get events that the user has either created OR joined
    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            OR: [
              // Events created by the user
              { createdBy: userId },
              // Events the user is participating in (as registered user)
              { participants: { some: { userId: userId } } },
            ],
          },
          // Only future events
          { startDatetime: { gt: currentDate } },
        ],
      },
      orderBy: { startDatetime: "asc" },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Add createdBy field and participation status to each event
    const eventsWithStatus = await Promise.all(
      events.map(async (event) => {
        // Get participant data directly for this event and user
        const participant = await prisma.eventParticipant.findFirst({
          where: {
            eventId: event.id,
            userId: userId,
          },
          select: { id: true, status: true },
        });

        const isParticipant = !!participant;
        const participationStatus = participant?.status || null;
        const participantId = participant?.id || null;

        // Get total participant count for this event
        const totalParticipantCount = await prisma.eventParticipant.count({
          where: { eventId: event.id },
        });

        // Remove the participants array from the final object to keep the payload clean
        const { participants, ...eventData } = event;

        const eventWithStatus = {
          ...eventData,
          createdBy: event.createdBy, // Explicitly include createdBy field
          isParticipant,
          participationStatus,
          participantId,
          participantCount: totalParticipantCount,
        };

        return eventWithStatus;
      })
    );

    res.json(eventsWithStatus);
  } catch (error) {
    console.error("Error fetching dashboard events:", error);
    res.status(500).json({ error: "Error fetching dashboard events" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Get total participant count
    const totalParticipantCount = await prisma.eventParticipant.count({
      where: { eventId: parseInt(req.params.id) },
    });

    // Get participant data directly for this event and user
    const participant = await prisma.eventParticipant.findFirst({
      where: {
        eventId: parseInt(req.params.id),
        userId: req.user?.id,
      },
      select: { id: true, status: true },
    });

    // Add participant count and participation status to the event
    const isParticipant = !!participant;
    const participationStatus = participant?.status || null;
    const participantId = participant?.id || null;

    // Remove the participants array from the final object to keep the payload clean
    const { participants, ...eventData } = event;

    const eventWithParticipantInfo = {
      ...eventData,
      createdBy: event.createdBy, // Explicitly include createdBy field
      participantCount: totalParticipantCount,
      isParticipant,
      participationStatus,
      participantId,
    };

    res.json(eventWithParticipantInfo);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Error fetching event" });
  }
};

const createEvent = async (req, res) => {
  const {
    name,
    description,
    start_datetime,
    end_datetime,
    location,
    min_attendees,
    max_attendees,
    location_details,
    preparation_info,
  } = req.body;

  // Validate required fields
  if (!name || !description || !start_datetime || !end_datetime || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate that end date is after start date
  const startDate = new Date(start_datetime);
  const endDate = new Date(end_datetime);

  if (endDate <= startDate) {
    return res.status(400).json({ error: "End date must be after start date" });
  }

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        startDatetime: startDate,
        endDatetime: endDate,
        location,
        minAttendees: min_attendees,
        maxAttendees: max_attendees,
        locationDetails: location_details,
        preparationInfo: preparation_info,
        createdBy: req.user.id,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateEvent = async (req, res) => {
  const {
    name,
    description,
    start_datetime,
    end_datetime,
    location,
    min_attendees,
    max_attendees,
    location_details,
    preparation_info,
  } = req.body;

  try {
    // Check if user is the creator of the event
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { createdBy: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.createdBy !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this event" });
    }

    // Validate that end date is after start date if both are provided
    if (start_datetime && end_datetime) {
      const startDate = new Date(start_datetime);
      const endDate = new Date(end_datetime);

      if (endDate <= startDate) {
        return res
          .status(400)
          .json({ error: "End date must be after start date" });
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        startDatetime: start_datetime ? new Date(start_datetime) : undefined,
        endDatetime: end_datetime ? new Date(end_datetime) : undefined,
        location,
        minAttendees: min_attendees,
        maxAttendees: max_attendees,
        locationDetails: location_details,
        preparationInfo: preparation_info,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    // Check if user is the creator of the event
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { createdBy: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.createdBy !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this event" });
    }

    await prisma.event.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Error deleting event" });
  }
};

const joinEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    // Check if the user is already a participant
    const existingParticipant = await prisma.eventParticipant.findFirst({
      where: { eventId, userId },
    });

    if (existingParticipant) {
      return res
        .status(409)
        .json({ message: "You are already participating in this event." });
    }

    // Add the user as a participant
    const newParticipant = await prisma.eventParticipant.create({
      data: {
        eventId,
        userId,
        status: "confirmed", // Changed from "attending" to "confirmed" to match the schema
      },
    });

    res.status(201).json(newParticipant);
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ error: "Error joining event" });
  }
};

const getCurrentUserParticipantId = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    // Find the current user's participation in this event
    const participant = await prisma.eventParticipant.findFirst({
      where: { eventId, userId },
      select: { id: true, status: true },
    });

    if (!participant) {
      return res
        .status(404)
        .json({ error: "You are not participating in this event." });
    }

    res.json({ participantId: participant.id, status: participant.status });
  } catch (error) {
    console.error("Error getting participant ID:", error);
    res.status(500).json({ error: "Error getting participant ID" });
  }
};

module.exports = {
  getAllEvents,
  getDashboardEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  getCurrentUserParticipantId,
};
