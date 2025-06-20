const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

let app;
let user;
let accessToken;

beforeAll(async () => {
  app = require('../server');
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database
  await prisma.refreshToken.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.guestUser.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      fullName: 'Test User'
    }
  });

  accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

describe('Events Endpoints', () => {
  describe('GET /api/events', () => {
    beforeEach(async () => {
      // Create test events
      await prisma.event.createMany({
        data: [
          {
            name: 'Test Event 1',
            description: 'Test Description 1',
            startDatetime: new Date('2024-12-25T10:00:00Z'),
            endDatetime: new Date('2024-12-25T12:00:00Z'),
            location: 'Test Location 1',
            maxAttendees: 50,
            createdBy: user.id
          },
          {
            name: 'Test Event 2',
            description: 'Test Description 2',
            startDatetime: new Date('2024-12-26T14:00:00Z'),
            endDatetime: new Date('2024-12-26T16:00:00Z'),
            location: 'Test Location 2',
            maxAttendees: 30,
            createdBy: user.id
          }
        ]
      });
    });

    it('should get all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(response.body.events).toHaveLength(2);
      expect(response.body.events[0]).toHaveProperty('name');
      expect(response.body.events[0]).toHaveProperty('description');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/events/dashboard', () => {
    let event1, event2;

    beforeEach(async () => {
      // Create test events
      event1 = await prisma.event.create({
        data: {
          name: 'My Event',
          description: 'My Description',
          startDatetime: new Date('2024-12-25T10:00:00Z'),
          endDatetime: new Date('2024-12-25T12:00:00Z'),
          location: 'My Location',
          maxAttendees: 50,
          createdBy: user.id
        }
      });

      event2 = await prisma.event.create({
        data: {
          name: 'Another Event',
          description: 'Another Description',
          startDatetime: new Date('2024-12-26T14:00:00Z'),
          endDatetime: new Date('2024-12-26T16:00:00Z'),
          location: 'Another Location',
          maxAttendees: 30,
          createdBy: user.id
        }
      });

      // Add user as participant to event2
      await prisma.eventParticipant.create({
        data: {
          eventId: event2.id,
          userId: user.id,
          status: 'confirmed'
        }
      });
    });

    it('should get user dashboard events', async () => {
      const response = await request(app)
        .get('/api/events/dashboard')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('createdEvents');
      expect(response.body).toHaveProperty('participatingEvents');
      expect(response.body.createdEvents).toHaveLength(2);
      expect(response.body.participatingEvents).toHaveLength(1);
    });
  });

  describe('GET /api/events/:id', () => {
    let event;

    beforeEach(async () => {
      event = await prisma.event.create({
        data: {
          name: 'Test Event',
          description: 'Test Description',
          startDatetime: new Date('2024-12-25T10:00:00Z'),
          endDatetime: new Date('2024-12-25T12:00:00Z'),
          location: 'Test Location',
          maxAttendees: 50,
          createdBy: user.id
        }
      });
    });

    it('should get event by ID', async () => {
      const response = await request(app)
        .get(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('event');
      expect(response.body.event.id).toBe(event.id);
      expect(response.body.event.name).toBe('Test Event');
    });

    it('should return error for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get(`/api/events/${event.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/events', () => {
    it('should create new event', async () => {
      const eventData = {
        name: 'New Event',
        description: 'New Description',
        startDatetime: '2024-12-25T10:00:00Z',
        endDatetime: '2024-12-25T12:00:00Z',
        location: 'New Location',
        maxAttendees: 50
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('event');
      expect(response.body.event.name).toBe(eventData.name);
      expect(response.body.event.createdBy).toBe(user.id);
    });

    it('should return error for invalid event data', async () => {
      const eventData = {
        name: '', // Invalid empty name
        description: 'Test Description',
        startDatetime: '2024-12-25T10:00:00Z',
        endDatetime: '2024-12-25T12:00:00Z',
        location: 'Test Location'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for past start date', async () => {
      const eventData = {
        name: 'Past Event',
        description: 'Test Description',
        startDatetime: '2020-12-25T10:00:00Z', // Past date
        endDatetime: '2020-12-25T12:00:00Z',
        location: 'Test Location'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for end date before start date', async () => {
      const eventData = {
        name: 'Invalid Event',
        description: 'Test Description',
        startDatetime: '2024-12-25T12:00:00Z',
        endDatetime: '2024-12-25T10:00:00Z', // Before start date
        location: 'Test Location'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/events/:id', () => {
    let event;

    beforeEach(async () => {
      event = await prisma.event.create({
        data: {
          name: 'Original Event',
          description: 'Original Description',
          startDatetime: new Date('2024-12-25T10:00:00Z'),
          endDatetime: new Date('2024-12-25T12:00:00Z'),
          location: 'Original Location',
          maxAttendees: 50,
          createdBy: user.id
        }
      });
    });

    it('should update event successfully', async () => {
      const updateData = {
        name: 'Updated Event',
        description: 'Updated Description',
        startDatetime: '2024-12-26T10:00:00Z',
        endDatetime: '2024-12-26T12:00:00Z',
        location: 'Updated Location',
        maxAttendees: 75
      };

      const response = await request(app)
        .put(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('event');
      expect(response.body.event.name).toBe(updateData.name);
      expect(response.body.event.description).toBe(updateData.description);
    });

    it('should return error for non-existent event', async () => {
      const updateData = {
        name: 'Updated Event',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put('/api/events/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for unauthorized user', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          fullName: 'Other User'
        }
      });

      const otherUserToken = jwt.sign(
        { userId: otherUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const updateData = {
        name: 'Updated Event',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/events/:id', () => {
    let event;

    beforeEach(async () => {
      event = await prisma.event.create({
        data: {
          name: 'Event to Delete',
          description: 'Test Description',
          startDatetime: new Date('2024-12-25T10:00:00Z'),
          endDatetime: new Date('2024-12-25T12:00:00Z'),
          location: 'Test Location',
          maxAttendees: 50,
          createdBy: user.id
        }
      });
    });

    it('should delete event successfully', async () => {
      const response = await request(app)
        .delete(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify event was deleted
      const deletedEvent = await prisma.event.findUnique({
        where: { id: event.id }
      });
      expect(deletedEvent).toBeNull();
    });

    it('should return error for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/events/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for unauthorized user', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          fullName: 'Other User'
        }
      });

      const otherUserToken = jwt.sign(
        { userId: otherUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .delete(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/events/:id/join', () => {
    let event;

    beforeEach(async () => {
      event = await prisma.event.create({
        data: {
          name: 'Joinable Event',
          description: 'Test Description',
          startDatetime: new Date('2024-12-25T10:00:00Z'),
          endDatetime: new Date('2024-12-25T12:00:00Z'),
          location: 'Test Location',
          maxAttendees: 50,
          createdBy: user.id
        }
      });
    });

    it('should join event successfully', async () => {
      const response = await request(app)
        .post(`/api/events/${event.id}/join`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('joined successfully');

      // Verify participant was created
      const participant = await prisma.eventParticipant.findFirst({
        where: {
          eventId: event.id,
          userId: user.id
        }
      });
      expect(participant).toBeTruthy();
      expect(participant.status).toBe('pending');
    });

    it('should return error for already joined event', async () => {
      // Join event first
      await request(app)
        .post(`/api/events/${event.id}/join`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Try to join again
      const response = await request(app)
        .post(`/api/events/${event.id}/join`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already joined');
    });

    it('should return error for non-existent event', async () => {
      const response = await request(app)
        .post('/api/events/99999/join')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/events/:id/participant', () => {
    let event;

    beforeEach(async () => {
      event = await prisma.event.create({
        data: {
          name: 'Test Event',
          description: 'Test Description',
          startDatetime: new Date('2024-12-25T10:00:00Z'),
          endDatetime: new Date('2024-12-25T12:00:00Z'),
          location: 'Test Location',
          maxAttendees: 50,
          createdBy: user.id
        }
      });
    });

    it('should return participant info when user has joined', async () => {
      // Join event first
      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: user.id,
          status: 'confirmed'
        }
      });

      const response = await request(app)
        .get(`/api/events/${event.id}/participant`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participant');
      expect(response.body.participant.userId).toBe(user.id);
      expect(response.body.participant.status).toBe('confirmed');
    });

    it('should return null when user has not joined', async () => {
      const response = await request(app)
        .get(`/api/events/${event.id}/participant`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participant');
      expect(response.body.participant).toBeNull();
    });

    it('should return error for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/99999/participant')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 