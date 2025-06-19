const prisma = require("../config/prisma");

const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        startDatetime: "desc",
      },
    });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        creator: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
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

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        startDatetime: new Date(start_datetime),
        endDatetime: new Date(end_datetime),
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
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
