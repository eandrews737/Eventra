// Jest setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-jwt-tokens';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/eventra_test';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock rate limiting for tests
jest.mock('../middleware/rateLimit', () => ({
  generalLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
})); 