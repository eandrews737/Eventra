const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

let app;
let user;
let event;
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

  // Create test event
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

  accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

describe('Participants Endpoints', () => {
  describe('GET /api/participants/event/:eventId', () => {
    beforeEach(async () => {
      // Create test participants
      await prisma.eventParticipant.createMany({
        data: [
          {
            eventId: event.id,
            userId: user.id,
            status: 'confirmed'
          },
          {
            eventId: event.id,
            guestId: (await prisma.guestUser.create({
              data: {
                email: 'guest@example.com',
                fullName: 'Guest User'
              }
            })).id,
            status: 'pending'
          }
        ]
      });
    });

    it('should get all participants for an event', async () => {
      const response = await request(app)
        .get(`/api/participants/event/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participants');
      expect(response.body.participants).toHaveLength(2);
      expect(response.body.participants[0]).toHaveProperty('status');
    });

    it('should return error for non-existent event', async () => {
      const response = await request(app)
        .get('/api/participants/event/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get(`/api/participants/event/${event.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for event with no participants', async () => {
      // Create another event without participants
      const emptyEvent = await prisma.event.create({
        data: {
          name: 'Empty Event',
          description: 'Empty Description',
          startDatetime: new Date('2024-12-26T10:00:00Z'),
          endDatetime: new Date('2024-12-26T12:00:00Z'),
          location: 'Empty Location',
          maxAttendees: 30,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .get(`/api/participants/event/${emptyEvent.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participants');
      expect(response.body.participants).toHaveLength(0);
    });
  });

  describe('POST /api/participants/event/:eventId/user', () => {
    let otherUser;

    beforeEach(async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('password123', 10);
      otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: hashedPassword,
          fullName: 'Other User'
        }
      });
    });

    it('should add registered user as participant', async () => {
      const participantData = {
        userId: otherUser.id,
        status: 'confirmed'
      };

      const response = await request(app)
        .post(`/api/participants/event/${event.id}/user`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(participantData)
        .expect(201);

      expect(response.body).toHaveProperty('participant');
      expect(response.body.participant.userId).toBe(otherUser.id);
      expect(response.body.participant.status).toBe('confirmed');
    });

    it('should return error for non-existent user', async () => {
      const participantData = {
        userId: 99999,
        status: 'confirmed'
      };

      const response = await request(app)
        .post(`/api/participants/event/${event.id}/user`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(participantData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for non-existent event', async () => {
      const participantData = {
        userId: otherUser.id,
        status: 'confirmed'
      };

      const response = await request(app)
        .post('/api/participants/event/99999/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(participantData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for duplicate participant', async () => {
      const participantData = {
        userId: otherUser.id,
        status: 'confirmed'
      };

      // Add participant first
      await request(app)
        .post(`/api/participants/event/${event.id}/user`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(participantData);

      // Try to add same participant again
      const response = await request(app)
        .post(`/api/participants/event/${event.id}/user`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(participantData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already a participant');
    });

    it('should return error for invalid status', async () => {
      const participantData = {
        userId: otherUser.id,
        status: 'invalid-status'
      };

      const response = await request(app)
        .post(`/api/participants/event/${event.id}/user`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(participantData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/participants/event/:eventId/guest', () => {
    it('should add guest user as participant', async () => {
      const guestData = {
        fullName: 'Guest User',
        email: 'guest@example.com',
        status: 'pending'
      };

      const response = await request(app)
        .post(`/api/participants/event/${event.id}/guest`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(guestData)
        .expect(201);

      expect(response.body).toHaveProperty('participant');
      expect(response.body.participant.guest.fullName).toBe(guestData.fullName);
      expect(response.body.participant.guest.email).toBe(guestData.email);
      expect(response.body.participant.status).toBe('pending');
    });

    it('should return error for non-existent event', async () => {
      const guestData = {
        fullName: 'Guest User',
        email: 'guest@example.com',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/participants/event/99999/guest')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(guestData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for invalid email format', async () => {
      const guestData = {
        fullName: 'Guest User',
        email: 'invalid-email',
        status: 'pending'
      };

      const response = await request(app)
        .post(`/api/participants/event/${event.id}/guest`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(guestData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for missing required fields', async () => {
      const guestData = {
        email: 'guest@example.com'
        // Missing fullName
      };

      const response = await request(app)
        .post(`/api/participants/event/${event.id}/guest`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(guestData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for duplicate guest email', async () => {
      const guestData = {
        fullName: 'Guest User',
        email: 'guest@example.com',
        status: 'pending'
      };

      // Add guest first
      await request(app)
        .post(`/api/participants/event/${event.id}/guest`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(guestData);

      // Try to add same guest again
      const response = await request(app)
        .post(`/api/participants/event/${event.id}/guest`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(guestData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already a participant');
    });
  });

  describe('PATCH /api/participants/:participantId', () => {
    let participant;

    beforeEach(async () => {
      // Create a participant
      participant = await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: user.id,
          status: 'pending'
        }
      });
    });

    it('should update participant status', async () => {
      const updateData = {
        status: 'confirmed'
      };

      const response = await request(app)
        .patch(`/api/participants/${participant.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('participant');
      expect(response.body.participant.status).toBe('confirmed');
    });

    it('should return error for non-existent participant', async () => {
      const updateData = {
        status: 'confirmed'
      };

      const response = await request(app)
        .patch('/api/participants/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for invalid status', async () => {
      const updateData = {
        status: 'invalid-status'
      };

      const response = await request(app)
        .patch(`/api/participants/${participant.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(400);

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
        status: 'confirmed'
      };

      const response = await request(app)
        .patch(`/api/participants/${participant.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/participants/:participantId', () => {
    let participant;

    beforeEach(async () => {
      // Create a participant
      participant = await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: user.id,
          status: 'confirmed'
        }
      });
    });

    it('should remove participant from event', async () => {
      const response = await request(app)
        .delete(`/api/participants/${participant.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('removed successfully');

      // Verify participant was deleted
      const deletedParticipant = await prisma.eventParticipant.findUnique({
        where: { id: participant.id }
      });
      expect(deletedParticipant).toBeNull();
    });

    it('should return error for non-existent participant', async () => {
      const response = await request(app)
        .delete('/api/participants/99999')
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
        .delete(`/api/participants/${participant.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle event with maximum participants', async () => {
      // Create event with maxAttendees = 1
      const limitedEvent = await prisma.event.create({
        data: {
          name: 'Limited Event',
          description: 'Limited Description',
          startDatetime: new Date('2024-12-25T10:00:00Z'),
          endDatetime: new Date('2024-12-25T12:00:00Z'),
          location: 'Limited Location',
          maxAttendees: 1,
          createdBy: user.id
        }
      });

      // Add one participant
      await prisma.eventParticipant.create({
        data: {
          eventId: limitedEvent.id,
          userId: user.id,
          status: 'confirmed'
        }
      });

      // Try to add another participant
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          fullName: 'Other User'
        }
      });

      const participantData = {
        userId: otherUser.id,
        status: 'confirmed'
      };

      const response = await request(app)
        .post(`/api/participants/event/${limitedEvent.id}/user`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(participantData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('maximum participants');
    });

    it('should handle mixed user and guest participants', async () => {
      // Add registered user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          fullName: 'Other User'
        }
      });

      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: otherUser.id,
          status: 'confirmed'
        }
      });

      // Add guest user
      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          guestId: (await prisma.guestUser.create({
            data: {
              email: 'guest@example.com',
              fullName: 'Guest User'
            }
          })).id,
          status: 'pending'
        }
      });

      // Get all participants
      const response = await request(app)
        .get(`/api/participants/event/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.participants).toHaveLength(2);
      expect(response.body.participants[0]).toHaveProperty('user');
      expect(response.body.participants[1]).toHaveProperty('guest');
    });
  });
}); 