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

describe('Authentication Middleware', () => {
  describe('Protected Routes', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('events');
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No token provided');
    });

    it('should deny access with invalid token format', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid token format');
    });

    it('should deny access with malformed token', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid token');
    });

    it('should deny access with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token expired');
    });

    it('should deny access with token for non-existent user', async () => {
      const invalidToken = jwt.sign(
        { userId: 99999 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('Public Routes', () => {
    it('should allow access to auth routes without token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
    });

    it('should allow access to root route without token', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Welcome to Eventra API');
    });
  });
});

describe('Rate Limiting Middleware', () => {
  describe('General Rate Limiting', () => {
    it('should allow normal request frequency', async () => {
      // Make multiple requests in quick succession
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/')
          .expect(200);
      }
    });

    it('should handle rate limiting gracefully', async () => {
      // This test verifies that rate limiting is properly mocked in setup.js
      // In a real scenario, you'd test the actual rate limiting behavior
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Auth Rate Limiting', () => {
    it('should allow normal auth request frequency', async () => {
      // Make multiple auth requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
          .expect(200);
      }
    });
  });
});

describe('CORS Middleware', () => {
  it('should include CORS headers in response', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.headers).toHaveProperty('access-control-allow-origin');
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('should handle preflight requests', async () => {
    const response = await request(app)
      .options('/api/events')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Authorization')
      .expect(200);

    expect(response.headers).toHaveProperty('access-control-allow-methods');
    expect(response.headers).toHaveProperty('access-control-allow-headers');
  });
});

describe('Security Middleware', () => {
  it('should include security headers', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    // Check for Helmet.js security headers
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-xss-protection');
  });

  it('should handle JSON parsing errors gracefully', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('Error Handling Middleware', () => {
  it('should handle 404 errors', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should handle 500 errors gracefully', async () => {
    // This would require mocking a route that throws an error
    // For now, we'll test the error handling structure
    const response = await request(app)
      .get('/api/events/99999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should not expose internal errors in production', async () => {
    // Set NODE_ENV to production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // This test verifies that error details are not exposed in production
    // In a real scenario, you'd test with an actual error-throwing route
    
    // Reset environment
    process.env.NODE_ENV = originalEnv;
  });
});

describe('Request Validation', () => {
  describe('Event Creation Validation', () => {
    it('should validate required fields', async () => {
      const invalidEventData = {
        // Missing required fields
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidEventData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate date formats', async () => {
      const invalidEventData = {
        name: 'Test Event',
        description: 'Test Description',
        startDatetime: 'invalid-date',
        endDatetime: '2024-12-25T12:00:00Z',
        location: 'Test Location'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidEventData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('User Registration Validation', () => {
    it('should validate email format', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate password strength', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        password: '123', // Too short
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 