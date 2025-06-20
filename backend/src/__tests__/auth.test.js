const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Import the app
let app;
beforeAll(async () => {
  app = require('../server');
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.refreshToken.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.guestUser.deleteMany();
  await prisma.user.deleteMany();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.fullName).toBe(userData.fullName);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email already exists');
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: hashedPassword,
          fullName: 'Test User'
        }
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return error for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;
    let user;

    beforeEach(async () => {
      // Create a test user and refresh token
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: hashedPassword,
          fullName: 'Test User'
        }
      });

      refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(refreshToken);
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for expired refresh token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let refreshToken;
    let user;

    beforeEach(async () => {
      // Create a test user and refresh token
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: hashedPassword,
          fullName: 'Test User'
        }
      });

      refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Logged out successfully');

      // Verify token was deleted
      const tokenInDb = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
      });
      expect(tokenInDb).toBeNull();
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken;
    let user;

    beforeEach(async () => {
      // Create a test user
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

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.fullName).toBe(user.fullName);
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for non-existent user', async () => {
      // Create token for non-existent user
      const invalidToken = jwt.sign(
        { userId: 99999 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/validate', () => {
    let accessToken;
    let user;

    beforeEach(async () => {
      // Create a test user
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

    it('should validate token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token: accessToken })
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user.id);
    });

    it('should return invalid for expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token: expiredToken })
        .expect(200);

      expect(response.body).toHaveProperty('valid', false);
    });

    it('should return invalid for malformed token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token: 'malformed-token' })
        .expect(200);

      expect(response.body).toHaveProperty('valid', false);
    });
  });
}); 