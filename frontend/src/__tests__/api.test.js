// import { authAPI, eventsAPI, participantsAPI } from '../services/api';

// Mock fetch globally
global.fetch = jest.fn();

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

// describe('API Service', () => {
//   beforeEach(() => {
//     localStorageMock.clear();
//     jest.clearAllMocks();
//     fetch.mockClear();
//   });

//   describe('authAPI', () => {
//     it('login makes correct request', async () => {
//       const mockResponse = { user: { id: 1, email: 'test@example.com' }, accessToken: 'token' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const credentials = { email: 'test@example.com', password: 'password' };
//       const result = await authAPI.login(credentials);

//       expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('login handles error response', async () => {
//       const errorResponse = { error: 'Invalid credentials' };
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 401,
//         json: async () => errorResponse,
//       });

//       const credentials = { email: 'test@example.com', password: 'wrong' };
//       
//       await expect(authAPI.login(credentials)).rejects.toThrow();
//     });

//     it('register makes correct request', async () => {
//       const mockResponse = { user: { id: 1, email: 'test@example.com' }, accessToken: 'token' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
//       const result = await authAPI.register(userData);

//       expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('getProfile makes authenticated request', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const mockResponse = { id: 1, email: 'test@example.com', fullName: 'Test User' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const result = await authAPI.getProfile();

//       expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('getProfile handles missing token', async () => {
//       localStorageMock.getItem.mockReturnValue(null);
//       
//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('logout makes authenticated request', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ message: 'Logged out successfully' }),
//       });

//       await authAPI.logout();

//       expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('handles auth register with validation errors', async () => {
//       const validationError = {
//         response: {
//           status: 400,
//           data: {
//             errors: [
//               { field: 'email', message: 'Email is required' },
//               { field: 'password', message: 'Password must be at least 6 characters' }
//             ]
//           }
//         }
//       };

//       fetch.mockRejectedValueOnce(validationError);

//       await expect(authAPI.register({
//         name: '',
//         email: '',
//         password: '123'
//       })).rejects.toEqual(validationError);
//     });

//     it('handles network errors in auth requests', async () => {
//       const networkError = new Error('Network error');
//       fetch.mockRejectedValueOnce(networkError);

//       await expect(authAPI.login({
//         email: 'test@example.com',
//         password: 'password123'
//       })).rejects.toEqual(networkError);
//     });

//     it('handles timeout errors in auth requests', async () => {
//       const timeoutError = new Error('Request timeout');
//       timeoutError.name = 'TimeoutError';
//       fetch.mockRejectedValueOnce(timeoutError);

//       await expect(authAPI.register({
//         name: 'Test User',
//         email: 'test@example.com',
//         password: 'password123'
//       })).rejects.toEqual(timeoutError);
//     });

//     it('handles malformed JSON responses', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.reject(new Error('Invalid JSON'))
//       });

//       await expect(authAPI.login({
//         email: 'test@example.com',
//         password: 'password123'
//       })).rejects.toThrow('Invalid JSON');
//     });

//     it('handles empty response body', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve(null)
//       });

//       const result = await authAPI.login({
//         email: 'test@example.com',
//         password: 'password123'
//       });

//       expect(result).toBeNull();
//     });

//     it('handles response with no data property', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ message: 'Success' })
//       });

//       const result = await authAPI.login({
//         email: 'test@example.com',
//         password: 'password123'
//       });

//       expect(result).toEqual({ message: 'Success' });
//     });
//   });

//   describe('eventsAPI', () => {
//     beforeEach(() => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//     });

//     it('getDashboardEvents makes authenticated request', async () => {
//       const mockResponse = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const result = await eventsAPI.getDashboardEvents();

//       expect(fetch).toHaveBeenCalledWith('/api/events/dashboard', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('getAll makes authenticated request', async () => {
//       const mockResponse = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const result = await eventsAPI.getAll();

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('getById makes authenticated request', async () => {
//       const mockResponse = { id: 1, name: 'Event 1', description: 'Test event' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const result = await eventsAPI.getById(1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('create makes authenticated request', async () => {
//       const mockResponse = { id: 1, name: 'New Event', description: 'New event description' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const eventData = { name: 'New Event', description: 'New event description' };
//       const result = await eventsAPI.create(eventData);

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(eventData),
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('update makes authenticated request', async () => {
//       const mockResponse = { id: 1, name: 'Updated Event', description: 'Updated description' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const eventData = { name: 'Updated Event', description: 'Updated description' };
//       const result = await eventsAPI.update(1, eventData);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1', {
//         method: 'PUT',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(eventData),
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('delete makes authenticated request', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ message: 'Event deleted successfully' }),
//       });

//       await eventsAPI.delete(1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1', {
//         method: 'DELETE',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('join makes authenticated request', async () => {
//       const mockResponse = { message: 'Joined event successfully' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const result = await eventsAPI.join(1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/join', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('handles events API with different HTTP methods', async () => {
//       // Test GET request
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ data: [] })
//       });

//       await eventsAPI.getAll();

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'GET',
//         headers: expect.any(Object)
//       });

//       // Test POST request
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 201,
//         json: () => Promise.resolve({ data: { id: 1, name: 'Test Event' } })
//       });

//       await eventsAPI.create({
//         name: 'Test Event',
//         description: 'Test Description',
//         date: '2024-12-25',
//         time: '14:00',
//         location: 'Test Location'
//       });

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'POST',
//         headers: expect.any(Object),
//         body: expect.any(String)
//       });

//       // Test PUT request
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ data: { id: 1, name: 'Updated Event' } })
//       });

//       await eventsAPI.update(1, {
//         name: 'Updated Event',
//         description: 'Updated Description'
//       });

//       expect(fetch).toHaveBeenCalledWith('/api/events/1', {
//         method: 'PUT',
//         headers: expect.any(Object),
//         body: expect.any(String)
//       });

//       // Test DELETE request
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 204,
//         json: () => Promise.resolve(null)
//       });

//       await eventsAPI.delete(1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1', {
//         method: 'DELETE',
//         headers: expect.any(Object)
//       });
//     });
//   });

//   describe('participantsAPI', () => {
//     beforeEach(() => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//     });

//     it('getEventParticipants makes authenticated request', async () => {
//       const mockResponse = [
//         { id: 1, userId: 1, fullName: 'User 1', status: 'confirmed' },
//         { id: 2, userId: 2, fullName: 'User 2', status: 'pending' }
//       ];
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const result = await participantsAPI.getEventParticipants(1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('addRegisteredUser makes authenticated request', async () => {
//       const mockResponse = { id: 1, userId: 1, status: 'confirmed' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const participantData = { userId: 1, status: 'confirmed' };
//       const result = await participantsAPI.addRegisteredUser(1, participantData);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/registered', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(participantData),
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('addGuestUser makes authenticated request', async () => {
//       const mockResponse = { id: 1, email: 'guest@example.com', fullName: 'Guest User', status: 'pending' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const participantData = { email: 'guest@example.com', fullName: 'Guest User', status: 'pending' };
//       const result = await participantsAPI.addGuestUser(1, participantData);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/guest', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(participantData),
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('updateStatus makes authenticated request', async () => {
//       const mockResponse = { id: 1, status: 'confirmed' };
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => mockResponse,
//       });

//       const result = await participantsAPI.updateStatus(1, 1, 'confirmed');

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/1/status', {
//         method: 'PUT',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status: 'confirmed' }),
//       });
//       expect(result).toEqual({ data: mockResponse });
//     });

//     it('remove makes authenticated request', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ message: 'Participant removed successfully' }),
//       });

//       await participantsAPI.remove(1, 1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/1', {
//         method: 'DELETE',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('handles participants API with different scenarios', async () => {
//       // Test adding guest user
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 201,
//         json: () => Promise.resolve({ data: { id: 1, fullName: 'Guest User' } })
//       });

//       await participantsAPI.addGuestUser(1, {
//         email: 'guest@example.com',
//         fullName: 'Guest User',
//         status: 'pending'
//       });

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/guest', {
//         method: 'POST',
//         headers: expect.any(Object),
//         body: expect.any(String)
//       });

//       // Test adding registered user
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 201,
//         json: () => Promise.resolve({ data: { id: 2, userId: 123 } })
//       });

//       await participantsAPI.addRegisteredUser(1, {
//         userId: 123,
//         status: 'confirmed'
//       });

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/registered', {
//         method: 'POST',
//         headers: expect.any(Object),
//         body: expect.any(String)
//       });

//       // Test updating participant status
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ data: { id: 1, status: 'confirmed' } })
//       });

//       await participantsAPI.updateStatus(1, 1, 'confirmed');

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/1/status', {
//         method: 'PATCH',
//         headers: expect.any(Object),
//         body: expect.any(String)
//       });

//       // Test removing participant
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 204,
//         json: () => Promise.resolve(null)
//       });

//       await participantsAPI.remove(1, 1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/1/participants/1', {
//         method: 'DELETE',
//         headers: expect.any(Object)
//       });
//     });
//   });

//   describe('Error Handling', () => {
//     it('handles network errors', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockRejectedValueOnce(new Error('Network error'));

//       await expect(authAPI.getProfile()).rejects.toThrow('Network error');
//     });

//     it('handles non-ok responses', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 500,
//         statusText: 'Internal Server Error',
//         json: async () => ({ error: 'Server error' }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles JSON parsing errors', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => {
//           throw new Error('Invalid JSON');
//         },
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow('Invalid JSON');
//     });
//   });

//   describe('Token Management', () => {
//     it('includes token in headers when available', async () => {
//       localStorageMock.getItem.mockReturnValue('test-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'test' }),
//       });

//       await authAPI.getProfile();

//       expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer test-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('handles missing token gracefully', async () => {
//       localStorageMock.getItem.mockReturnValue(null);

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });
//   });

//   describe('Additional API Edge Cases', () => {
//     it('handles empty response body', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => null,
//       });

//       const result = await authAPI.getProfile();
//       expect(result).toEqual({ data: null });
//     });

//     it('handles response with no data property', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ message: 'Success' }),
//       });

//       const result = await authAPI.getProfile();
//       expect(result).toEqual({ data: { message: 'Success' } });
//     });

//     it('handles 401 unauthorized response', async () => {
//       localStorageMock.getItem.mockReturnValue('invalid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 401,
//         statusText: 'Unauthorized',
//         json: async () => ({ error: 'Invalid token' }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles 403 forbidden response', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 403,
//         statusText: 'Forbidden',
//         json: async () => ({ error: 'Access denied' }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles 404 not found response', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 404,
//         statusText: 'Not Found',
//         json: async () => ({ error: 'Resource not found' }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles 422 validation error response', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 422,
//         statusText: 'Unprocessable Entity',
//         json: async () => ({ 
//           error: 'Validation failed',
//           details: { field: 'email', message: 'Invalid email format' }
//         }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles 500 server error response', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 500,
//         statusText: 'Internal Server Error',
//         json: async () => ({ error: 'Server error' }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles malformed JSON response', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => {
//           throw new SyntaxError('Unexpected token');
//         },
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow('Unexpected token');
//     });

//     it('handles timeout scenarios', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockImplementationOnce(() => new Promise((_, reject) => {
//         setTimeout(() => reject(new Error('Request timeout')), 100);
//       }));

//       await expect(authAPI.getProfile()).rejects.toThrow('Request timeout');
//     });

//     it('handles aborted requests', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const abortError = new Error('Request aborted');
//       abortError.name = 'AbortError';
//       fetch.mockRejectedValueOnce(abortError);

//       await expect(authAPI.getProfile()).rejects.toThrow('Request aborted');
//     });
//   });

//   describe('Request Body Handling', () => {
//     it('handles null request body', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'success' }),
//       });

//       await authAPI.getProfile();

//       expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('handles empty object request body', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'success' }),
//       });

//       await authAPI.login({});

//       expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({}),
//       });
//     });

//     it('handles complex nested objects in request body', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'success' }),
//       });

//       const complexData = {
//         user: {
//           profile: {
//             preferences: {
//               theme: 'dark',
//               notifications: true
//             }
//           }
//         },
//         metadata: {
//           timestamp: new Date().toISOString(),
//           version: '1.0.0'
//         }
//       };

//       await authAPI.register(complexData);

//       expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(complexData),
//       });
//     });

//     it('handles arrays in request body', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'success' }),
//       });

//       const arrayData = {
//         items: [1, 2, 3, 4, 5],
//         tags: ['tag1', 'tag2'],
//         metadata: {
//           numbers: [10, 20, 30]
//         }
//       };

//       await authAPI.register(arrayData);

//       expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(arrayData),
//       });
//     });
//   });

//   describe('Response Data Handling', () => {
//     it('handles response with nested data structure', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const nestedResponse = {
//         data: {
//           user: {
//             id: 1,
//             profile: {
//               name: 'John Doe',
//               email: 'john@example.com'
//             }
//           },
//           metadata: {
//             created: '2024-01-01T00:00:00Z',
//             updated: '2024-01-02T00:00:00Z'
//           }
//         }
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => nestedResponse,
//       });

//       const result = await authAPI.getProfile();
//       expect(result).toEqual({ data: nestedResponse });
//     });

//     it('handles response with array data', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const arrayResponse = [
//         { id: 1, name: 'Event 1' },
//         { id: 2, name: 'Event 2' },
//         { id: 3, name: 'Event 3' }
//       ];

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => arrayResponse,
//       });

//       const result = await eventsAPI.getAll();
//       expect(result).toEqual({ data: arrayResponse });
//     });

//     it('handles response with boolean data', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => true,
//       });

//       const result = await authAPI.logout();
//       expect(result).toEqual({ data: true });
//     });

//     it('handles response with number data', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => 42,
//       });

//       const result = await authAPI.getProfile();
//       expect(result).toEqual({ data: 42 });
//     });

//     it('handles response with string data', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => 'Success message',
//       });

//       const result = await authAPI.getProfile();
//       expect(result).toEqual({ data: 'Success message' });
//     });
//   });

//   describe('Additional API Methods', () => {
//     it('handles auth login with different response formats', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const loginResponse = {
//         user: { id: 1, email: 'test@example.com' },
//         accessToken: 'token123',
//         refreshToken: 'refresh123'
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => loginResponse,
//       });

//       const result = await authAPI.login({ email: 'test@example.com', password: 'password' });
//       expect(result).toEqual({ data: loginResponse });
//     });

//     it('handles auth register with validation errors', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 422,
//         statusText: 'Unprocessable Entity',
//         json: async () => ({
//           error: 'Validation failed',
//           details: [
//             { field: 'email', message: 'Invalid email format' },
//             { field: 'password', message: 'Password too short' }
//           ]
//         }),
//       });

//       await expect(authAPI.register({
//         fullName: 'Test User',
//         email: 'invalid-email',
//         password: '123'
//       })).rejects.toThrow();
//     });

//     it('handles events API with pagination', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const paginatedResponse = {
//         data: [
//           { id: 1, name: 'Event 1' },
//           { id: 2, name: 'Event 2' }
//         ],
//         pagination: {
//           page: 1,
//           limit: 10,
//           total: 25,
//           pages: 3
//         }
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => paginatedResponse,
//       });

//       const result = await eventsAPI.getAll({ page: 1, limit: 10 });
//       expect(result).toEqual({ data: paginatedResponse });
//     });

//     it('handles participants API with bulk operations', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const bulkResponse = {
//         success: true,
//         added: 3,
//         failed: 0,
//         participants: [
//           { id: 1, email: 'user1@example.com', status: 'pending' },
//           { id: 2, email: 'user2@example.com', status: 'pending' },
//           { id: 3, email: 'user3@example.com', status: 'pending' }
//         ]
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => bulkResponse,
//       });

//       const result = await participantsAPI.addGuestUser(1, {
//         email: 'user1@example.com',
//         fullName: 'User 1',
//         status: 'pending'
//       });
//       expect(result).toEqual({ data: bulkResponse });
//     });

//     it('handles API with custom headers', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'success' }),
//       });

//       await authAPI.getProfile();

//       expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('handles API with query parameters', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'success' }),
//       });

//       await eventsAPI.getAll({ search: 'test', filter: 'upcoming' });

//       expect(fetch).toHaveBeenCalledWith('/api/events?search=test&filter=upcoming', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('handles API with file uploads', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const formData = new FormData();
//       formData.append('file', new Blob(['test']), 'test.txt');

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: 'uploaded' }),
//       });

//       // Mock the API call that would handle file uploads
//       await authAPI.getProfile();

//       expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer valid-token',
//           'Content-Type': 'application/json',
//         },
//       });
//     });

//     it('handles API rate limiting', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 429,
//         statusText: 'Too Many Requests',
//         json: async () => ({
//           error: 'Rate limit exceeded',
//           retryAfter: 60
//         }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles API maintenance mode', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 503,
//         statusText: 'Service Unavailable',
//         json: async () => ({
//           error: 'Service temporarily unavailable',
//           maintenance: true,
//           estimatedRestore: '2024-01-01T12:00:00Z'
//         }),
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles API with different content types', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         headers: new Headers({
//           'content-type': 'application/xml'
//         }),
//         text: async () => '<response><data>success</data></response>',
//       });

//       await expect(authAPI.getProfile()).rejects.toThrow();
//     });

//     it('handles API with streaming responses', async () => {
//       localStorageMock.getItem.mockReturnValue('valid-token');
//       const mockStream = new ReadableStream({
//         start(controller) {
//           controller.enqueue(new TextEncoder().encode('{"data":"chunk1"}'));
//           controller.enqueue(new TextEncoder().encode('{"data":"chunk2"}'));
//           controller.close();
//         }
//       });

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         body: mockStream,
//         json: async () => ({ data: 'streamed' }),
//       });

//       const result = await authAPI.getProfile();
//       expect(result).toEqual({ data: { data: 'streamed' } });
//     });

//     it('handles API responses without error property', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 400,
//         json: () => Promise.resolve({ message: 'Validation failed' })
//       });

//       await expect(eventsAPI.create({})).rejects.toEqual({
//         response: { status: 400, data: { message: 'Validation failed' } }
//       });
//     });

//     it('handles API responses with empty error object', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 400,
//         json: () => Promise.resolve({})
//       });

//       await expect(eventsAPI.create({})).rejects.toEqual({
//         response: { status: 400, data: {} }
//       });
//     });

//     it('handles malformed error responses', async () => {
//       fetch.mockResolvedValueOnce({
//         ok: false,
//         status: 500,
//         json: () => Promise.reject(new Error('Invalid error JSON'))
//       });

//       await expect(eventsAPI.getAll()).rejects.toThrow('Invalid error JSON');
//     });

//     it('handles requests with complex data structures', async () => {
//       const complexEvent = {
//         name: 'Complex Event',
//         description: 'A very complex event description with special characters: éñtèrnâtiònâl',
//         date: '2024-12-25T14:00:00.000Z',
//         time: '14:00',
//         location: '123 Main St, City, State 12345',
//         metadata: {
//           tags: ['tag1', 'tag2'],
//           categories: ['category1'],
//           settings: {
//             allowGuests: true,
//             maxParticipants: 100,
//             requireApproval: false
//           }
//         }
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 201,
//         json: () => Promise.resolve({ data: { id: 1, ...complexEvent } })
//       });

//       await eventsAPI.create(complexEvent);

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'POST',
//         headers: expect.any(Object),
//         body: JSON.stringify(complexEvent)
//       });
//     });

//     it('handles requests with null and undefined values', async () => {
//       const eventWithNulls = {
//         name: 'Event with nulls',
//         description: null,
//         date: '2024-12-25',
//         time: undefined,
//         location: null
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 201,
//         json: () => Promise.resolve({ data: { id: 1, ...eventWithNulls } })
//       });

//       await eventsAPI.create(eventWithNulls);

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'POST',
//         headers: expect.any(Object),
//         body: JSON.stringify(eventWithNulls)
//       });
//     });

//     it('handles requests with empty strings and whitespace', async () => {
//       const eventWithEmptyStrings = {
//         name: '   Event with spaces   ',
//         description: '',
//         date: '2024-12-25',
//         time: '  14:00  ',
//         location: '   '
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 201,
//         json: () => Promise.resolve({ data: { id: 1, ...eventWithEmptyStrings } })
//       });

//       await eventsAPI.create(eventWithEmptyStrings);

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'POST',
//         headers: expect.any(Object),
//         body: JSON.stringify(eventWithEmptyStrings)
//       });
//     });

//     it('handles requests with very large data', async () => {
//       const largeDescription = 'A'.repeat(10000);
//       const largeEvent = {
//         name: 'Large Event',
//         description: largeDescription,
//         date: '2024-12-25',
//         time: '14:00',
//         location: 'Test Location'
//       };

//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 201,
//         json: () => Promise.resolve({ data: { id: 1, ...largeEvent } })
//       });

//       await eventsAPI.create(largeEvent);

//       expect(fetch).toHaveBeenCalledWith('/api/events', {
//         method: 'POST',
//         headers: expect.any(Object),
//         body: JSON.stringify(largeEvent)
//       });
//     });

//     it('handles requests with special characters in URLs', async () => {
//       const eventId = 'event-123-with-special-chars_&?=';
//       
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ data: { id: eventId, name: 'Special Event' } })
//       });

//       await eventsAPI.getById(eventId);

//       expect(fetch).toHaveBeenCalledWith(`/api/events/${eventId}`, {
//         method: 'GET',
//         headers: expect.any(Object)
//       });
//     });

//     it('handles requests with numeric IDs', async () => {
//       const numericId = 123;
//       
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ data: { id: numericId, name: 'Numeric Event' } })
//       });

//       await eventsAPI.getById(numericId);

//       expect(fetch).toHaveBeenCalledWith(`/api/events/${numericId}`, {
//         method: 'GET',
//         headers: expect.any(Object)
//       });
//     });

//     it('handles requests with zero and negative IDs', async () => {
//       // Test with zero ID
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ data: { id: 0, name: 'Zero Event' } })
//       });

//       await eventsAPI.getById(0);

//       expect(fetch).toHaveBeenCalledWith('/api/events/0', {
//         method: 'GET',
//         headers: expect.any(Object)
//       });

//       // Test with negative ID
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ data: { id: -1, name: 'Negative Event' } })
//       });

//       await eventsAPI.getById(-1);

//       expect(fetch).toHaveBeenCalledWith('/api/events/-1', {
//         method: 'GET',
//         headers: expect.any(Object)
//       });
//     });
//   });
// }); 