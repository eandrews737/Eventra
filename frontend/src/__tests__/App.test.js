import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the API module
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
  },
  eventsAPI: {
    getDashboardEvents: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    join: jest.fn(),
  },
  participantsAPI: {
    getEventParticipants: jest.fn(),
    addRegisteredUser: jest.fn(),
    addGuestUser: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  },
}));

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

// Mock matchMedia for theme testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderApp = () => render(<App />);

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  // Reset route
  window.history.pushState({}, '', '/');
});

describe('App Component', () => {
  it('renders Eventra app with header', () => {
    localStorageMock.getItem.mockReturnValue(null);
    require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
    renderApp();
    expect(screen.getByText(/Eventra/i)).toBeInTheDocument();
    expect(screen.getByText(/Event Management/i)).toBeInTheDocument();
  });

  it('shows loading spinner when checking authentication', () => {
    localStorageMock.getItem.mockReturnValue(null);
    // Delay the API response so the spinner is visible
    require('../services/api').authAPI.getProfile.mockImplementation(() => new Promise(() => {}));
    renderApp();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});

describe('Authentication Flow', () => {
  it('should redirect to login when not authenticated', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
    renderApp();
    
    // Wait for the redirect to happen
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('should redirect to dashboard when authenticated', async () => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: []
    });
    renderApp();
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});

describe('Login Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
    // Navigate to login page
    window.history.pushState({}, '', '/login');
  });

  it('should render login form', async () => {
    renderApp();
    expect(await screen.findByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const mockLogin = require('../services/api').authAPI.login;
    mockLogin.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com' }, accessToken: 'token123' }
    });
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: []
    });
    
    renderApp();
    
    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('should show error message on login failure', async () => {
    const mockLogin = require('../services/api').authAPI.login;
    mockLogin.mockRejectedValue({ 
      response: { data: { error: 'Invalid credentials' } }
    });
    
    renderApp();
    
    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('should have link to register page', async () => {
    renderApp();
    const registerLink = await screen.findByText(/create a new account/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});

describe('Register Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
    // Navigate to register page
    window.history.pushState({}, '', '/register');
  });

  it('should render registration form', async () => {
    renderApp();
    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should handle registration form submission', async () => {
    const mockRegister = require('../services/api').authAPI.register;
    mockRegister.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', fullName: 'Test User' }, accessToken: 'token123' }
    });
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: []
    });
    
    renderApp();
    
    const nameInput = await screen.findByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('should have link to login page', async () => {
    renderApp();
    const loginLink = await screen.findByText(/sign in to your existing account/i);
    expect(loginLink).toBeInTheDocument();
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  it('should render dashboard with user events', async () => {
    const mockGetEvents = require('../services/api').eventsAPI.getDashboardEvents;
    mockGetEvents.mockResolvedValue({
      data: [
        { id: 1, name: 'My Event', description: 'Test Description' },
        { id: 2, name: 'Joined Event', description: 'Another Description' }
      ]
    });
    renderApp();
    expect(await screen.findByText('My Event')).toBeInTheDocument();
    expect(screen.getByText('Joined Event')).toBeInTheDocument();
  });

  it('should show empty state when no events', async () => {
    const mockGetEvents = require('../services/api').eventsAPI.getDashboardEvents;
    mockGetEvents.mockResolvedValue({
      data: []
    });
    renderApp();
    expect(await screen.findByText(/no events yet/i)).toBeInTheDocument();
  });

  it('should show user information in header', async () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({ data: [] });
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('U')).toBeInTheDocument(); // User avatar
    });
  });
});

describe('Theme Context', () => {
  it('should toggle theme', async () => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({ data: [] });
    renderApp();
    
    // Wait for dashboard to load first
    await screen.findByText(/dashboard/i);
    
    // Find theme toggle button
    const themeToggle = screen.getByRole('button', { name: /switch to/i });
    expect(themeToggle).toBeInTheDocument();
    
    // Test theme toggle
    fireEvent.click(themeToggle);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
});

describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    const mockGetEvents = require('../services/api').eventsAPI.getDashboardEvents;
    mockGetEvents.mockRejectedValue(new Error('Network error'));
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    renderApp();
    expect(await screen.findByText(/failed to fetch dashboard events/i)).toBeInTheDocument();
  });
});

describe('Loading States', () => {
  it('should show loading spinner during API calls', async () => {
    const mockGetEvents = require('../services/api').eventsAPI.getDashboardEvents;
    mockGetEvents.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
    );
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    renderApp();
    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
  });
});

describe('Navigation', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({ data: [] });
  });

  it('should navigate to events page', async () => {
    renderApp();
    await screen.findByText(/dashboard/i);
    
    const eventsLink = screen.getByText(/events/i);
    fireEvent.click(eventsLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/events');
    });
  });

  it('should handle logout', async () => {
    const mockLogout = require('../services/api').authAPI.logout;
    mockLogout.mockResolvedValue({});
    
    renderApp();
    await screen.findByText(/dashboard/i);
    
    const logoutButton = screen.getByTitle(/logout/i);
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });
}); 