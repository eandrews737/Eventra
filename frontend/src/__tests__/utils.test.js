// import { debug } from '../utils/debug';
import { debugAuth } from '../utils/debug';

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

// describe('Debug Utils', () => {
//   beforeEach(() => {
//     localStorageMock.clear();
//     consoleSpy.mockClear();
//   });
//
//   afterAll(() => {
//     consoleSpy.mockRestore();
//   });
//
//   describe('debugAuth', () => {
//     it('logs when no token exists', () => {
//       localStorageMock.getItem.mockReturnValue(null);
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', false);
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('logs token information when token exists', () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', 12);
//       expect(consoleSpy).toHaveBeenCalledWith('Token is not a valid JWT');
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('logs JWT token information when valid JWT exists', () => {
//       // Create a mock JWT token
//       const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
//       const payload = btoa(JSON.stringify({ 
//         sub: '123', 
//         exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
//         iat: Math.floor(Date.now() / 1000)
//       }));
//       const signature = 'mock-signature';
//       const mockJWT = `${header}.${payload}.${signature}`;
//       
//       localStorageMock.getItem.mockReturnValue(mockJWT);
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', mockJWT.length);
//       expect(consoleSpy).toHaveBeenCalledWith('Token payload:', expect.objectContaining({
//         sub: '123',
//         exp: expect.any(Number),
//         iat: expect.any(Number)
//       }));
//       expect(consoleSpy).toHaveBeenCalledWith('Token expires:', expect.any(Date));
//       expect(consoleSpy).toHaveBeenCalledWith('Token is expired:', false);
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('logs expired JWT token information', () => {
//       // Create a mock expired JWT token
//       const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
//       const payload = btoa(JSON.stringify({ 
//         sub: '123', 
//         exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
//         iat: Math.floor(Date.now() / 1000) - 7200
//       }));
//       const signature = 'mock-signature';
//       const mockJWT = `${header}.${payload}.${signature}`;
//       
//       localStorageMock.getItem.mockReturnValue(mockJWT);
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', mockJWT.length);
//       expect(consoleSpy).toHaveBeenCalledWith('Token payload:', expect.objectContaining({
//         sub: '123',
//         exp: expect.any(Number),
//         iat: expect.any(Number)
//       }));
//       expect(consoleSpy).toHaveBeenCalledWith('Token expires:', expect.any(Date));
//       expect(consoleSpy).toHaveBeenCalledWith('Token is expired:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('handles malformed JWT token gracefully', () => {
//       // Create a malformed JWT token (missing parts)
//       const malformedJWT = 'header.payload'; // Missing signature
//       
//       localStorageMock.getItem.mockReturnValue(malformedJWT);
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', malformedJWT.length);
//       expect(consoleSpy).toHaveBeenCalledWith('Token is not a valid JWT');
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('handles JWT with invalid base64 payload', () => {
//       // Create a JWT with invalid base64 in payload
//       const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
//       const invalidPayload = 'invalid-base64-payload';
//       const signature = 'mock-signature';
//       const mockJWT = `${header}.${invalidPayload}.${signature}`;
//       
//       localStorageMock.getItem.mockReturnValue(mockJWT);
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', mockJWT.length);
//       expect(consoleSpy).toHaveBeenCalledWith('Token is not a valid JWT');
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('handles JWT with invalid JSON in payload', () => {
//       // Create a JWT with invalid JSON in payload
//       const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
//       const invalidJsonPayload = btoa('invalid-json');
//       const signature = 'mock-signature';
//       const mockJWT = `${header}.${invalidJsonPayload}.${signature}`;
//       
//       localStorageMock.getItem.mockReturnValue(mockJWT);
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', mockJWT.length);
//       expect(consoleSpy).toHaveBeenCalledWith('Token is not a valid JWT');
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('handles empty token string', () => {
//       localStorageMock.getItem.mockReturnValue('');
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', 0);
//       expect(consoleSpy).toHaveBeenCalledWith('Token is not a valid JWT');
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//
//     it('handles JWT without exp field', () => {
//       // Create a JWT without expiration
//       const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
//       const payload = btoa(JSON.stringify({ 
//         sub: '123', 
//         iat: Math.floor(Date.now() / 1000)
//         // No exp field
//       }));
//       const signature = 'mock-signature';
//       const mockJWT = `${header}.${payload}.${signature}`;
//       
//       localStorageMock.getItem.mockReturnValue(mockJWT);
//       
//       debugAuth();
//       
//       expect(consoleSpy).toHaveBeenCalledWith('=== AUTH DEBUG ===');
//       expect(consoleSpy).toHaveBeenCalledWith('Token exists:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('Token length:', mockJWT.length);
//       expect(consoleSpy).toHaveBeenCalledWith('Token payload:', expect.objectContaining({
//         sub: '123',
//         iat: expect.any(Number)
//       }));
//       expect(consoleSpy).toHaveBeenCalledWith('Token expires:', new Date(undefined));
//       expect(consoleSpy).toHaveBeenCalledWith('Token is expired:', true);
//       expect(consoleSpy).toHaveBeenCalledWith('==================');
//     });
//   });
//
//   it('should log debug messages when debug mode is enabled', () => {
//     // Enable debug mode
//     localStorage.setItem('debug', 'true');
//     
//     debug('Test message', { data: 'test' });
//     
//     expect(console.log).toHaveBeenCalledWith('Test message', { data: 'test' });
//   });
//
//   it('should not log debug messages when debug mode is disabled', () => {
//     // Disable debug mode
//     localStorage.removeItem('debug');
//     
//     debug('Test message', { data: 'test' });
//     
//     expect(console.log).not.toHaveBeenCalled();
//   });
//
//   it('should handle multiple arguments', () => {
//     localStorage.setItem('debug', 'true');
//     
//     debug('Message 1', 'Message 2', { data: 'test' });
//     
//     expect(console.log).toHaveBeenCalledWith('Message 1', 'Message 2', { data: 'test' });
//   });
//
//   it('should handle no arguments', () => {
//     localStorage.setItem('debug', 'true');
//     
//     debug();
//     
//     expect(console.log).toHaveBeenCalledWith();
//   });
//
//   it('should handle null and undefined values', () => {
//     localStorage.setItem('debug', 'true');
//     
//     debug(null, undefined, 'valid message');
//     
//     expect(console.log).toHaveBeenCalledWith(null, undefined, 'valid message');
//   });
//
//   it('should handle empty string debug mode', () => {
//     localStorage.setItem('debug', '');
//     
//     debug('Test message');
//     
//     expect(console.log).not.toHaveBeenCalled();
//   });
//
//   it('should handle false debug mode', () => {
//     localStorage.setItem('debug', 'false');
//     
//     debug('Test message');
//     
//     expect(console.log).not.toHaveBeenCalled();
//   });
//
//   it('should handle case insensitive debug mode', () => {
//     localStorage.setItem('debug', 'TRUE');
//     
//     debug('Test message');
//     
//     expect(console.log).toHaveBeenCalledWith('Test message');
//   });
//
//   it('should handle complex objects', () => {
//     localStorage.setItem('debug', 'true');
//     
//     const complexObj = {
//       user: {
//         id: 1,
//         profile: {
//           name: 'John',
//           preferences: {
//             theme: 'dark',
//             notifications: true
//           }
//         }
//       },
//       metadata: {
//         timestamp: new Date().toISOString(),
//         version: '1.0.0'
//       }
//     };
//     
//     debug('Complex object:', complexObj);
//     
//     expect(console.log).toHaveBeenCalledWith('Complex object:', complexObj);
//   });
//
//   it('should handle arrays', () => {
//     localStorage.setItem('debug', 'true');
//     
//     const array = [1, 2, 3, 'test', { key: 'value' }];
//     
//     debug('Array:', array);
//     
//     expect(console.log).toHaveBeenCalledWith('Array:', array);
//   });
//
//   it('should handle functions', () => {
//     localStorage.setItem('debug', 'true');
//     
//     const testFunction = () => 'test';
//     
//     debug('Function:', testFunction);
//     
//     expect(console.log).toHaveBeenCalledWith('Function:', testFunction);
//   });
//
//   it('should handle multiple debug calls', () => {
//     localStorage.setItem('debug', 'true');
//     
//     debug('First call');
//     debug('Second call');
//     debug('Third call');
//     
//     expect(console.log).toHaveBeenCalledTimes(3);
//     expect(console.log).toHaveBeenNthCalledWith(1, 'First call');
//     expect(console.log).toHaveBeenNthCalledWith(2, 'Second call');
//     expect(console.log).toHaveBeenNthCalledWith(3, 'Third call');
//   });
//
//   it('should handle debug mode changes during runtime', () => {
//     localStorage.setItem('debug', 'true');
//     
//     debug('First message');
//     expect(console.log).toHaveBeenCalledWith('First message');
//     
//     localStorage.removeItem('debug');
//     
//     debug('Second message');
//     expect(console.log).toHaveBeenCalledTimes(1); // Only the first call should be logged
//   });
// }); 