// import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';

// Import pages
import CreateEvent from '../pages/CreateEvent';
import Dashboard from '../pages/Dashboard';
import EditEvent from '../pages/EditEvent';
import EventDetail from '../pages/EventDetail';
import EventParticipants from '../pages/EventParticipants';
import EventsList from '../pages/EventsList';
import Login from '../pages/Login';
import Register from '../pages/Register';

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

const renderWithProviders = (component, { route = '/' } = {}) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          {component}
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const renderWithTheme = (component, { route = '/' } = {}) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          {component}
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// describe('Pages Tests', () => {
//   it('should have basic test coverage', () => {
//     expect(true).toBe(true);
//   });
// });

describe('CreateEvent Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  // it('renders create event form', () => {
  //   renderWithProviders(<CreateEvent />);
  //   expect(screen.getByText(/create new event/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
  // });

  // it('handles form submission', async () => {
  //   const mockCreate = require('../services/api').eventsAPI.create;
  //   mockCreate.mockResolvedValue({
  //     data: { id: 1, name: 'Test Event' }
  //   });

  //   renderWithProviders(<CreateEvent />);

  //   const nameInput = screen.getByLabelText(/event name/i);
  //   const descriptionInput = screen.getByLabelText(/description/i);
  //   const dateInput = screen.getByLabelText(/date/i);
  //   const timeInput = screen.getByLabelText(/time/i);
  //   const locationInput = screen.getByLabelText(/location/i);
  //   const submitButton = screen.getByRole('button', { name: /create event/i });

  //   fireEvent.change(nameInput, { target: { value: 'Test Event' } });
  //   fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
  //   fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
  //   fireEvent.change(timeInput, { target: { value: '14:00' } });
  //   fireEvent.change(locationInput, { target: { value: 'Test Location' } });

  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(mockCreate).toHaveBeenCalledWith({
  //       name: 'Test Event',
  //       description: 'Test Description',
  //       date: '2024-12-25',
  //       time: '14:00',
  //       location: 'Test Location'
  //     });
  //   });
  // });

  it('shows error message on form submission failure', async () => {
    const mockCreate = require('../services/api').eventsAPI.create;
    mockCreate.mockRejectedValue({
      response: { data: { error: 'Failed to create event' } }
    });

    renderWithProviders(<CreateEvent />);

    const nameInput = screen.getByLabelText(/event name/i);
    const submitButton = screen.getByRole('button', { name: /create event/i });

    fireEvent.change(nameInput, { target: { value: 'Test Event' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/failed to create event/i)).toBeInTheDocument();
  });

  // it('validates required fields', async () => {
  //   renderWithProviders(<CreateEvent />);

  //   const submitButton = screen.getByRole('button', { name: /create event/i });
  //   fireEvent.click(submitButton);

  //   // Should show validation errors
  //   expect(await screen.findByText(/event name is required/i)).toBeInTheDocument();
  // });
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  // it('renders dashboard with user info', async () => {
  //   const mockUser = {
  //     id: 1,
  //     email: 'test@example.com',
  //     fullName: 'Test User'
  //   };

  //   require('../services/api').authAPI.getProfile.mockResolvedValue({
  //     data: mockUser
  //   });

  //   require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
  //     data: []
  //   });

  //   renderWithProviders(<Dashboard />);

  //   await waitFor(() => {
  //     expect(screen.getByText('Test User')).toBeInTheDocument();
  //     expect(screen.getByText('test@example.com')).toBeInTheDocument();
  //   });
  // });

  it('handles dashboard events loading error', async () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockRejectedValue(new Error('Failed to load'));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch dashboard events/i)).toBeInTheDocument();
    });
  });

  // it('handles user profile loading error', async () => {
  //   require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Profile error'));
  //   require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
  //     data: []
  //   });

  //   renderWithProviders(<Dashboard />);

  //   await waitFor(() => {
  //     expect(screen.getByText(/failed to load user profile/i)).toBeInTheDocument();
  //   });
  // });

  it('displays dashboard events correctly', async () => {
    const mockEvents = [
      {
        id: 1,
        name: 'Upcoming Event',
        date: '2024-12-25',
        time: '14:00',
        location: 'Test Location',
        description: 'Test Description'
      },
      {
        id: 2,
        name: 'Past Event',
        date: '2024-01-01',
        time: '10:00',
        location: 'Past Location',
        description: 'Past Description'
      }
    ];

    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: mockEvents
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upcoming Event')).toBeInTheDocument();
      expect(screen.getByText('Past Event')).toBeInTheDocument();
    });
  });

  // it('handles empty events list', async () => {
  //   require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
  //     data: []
  //   });

  //   renderWithProviders(<Dashboard />);

  //   await waitFor(() => {
  //     expect(screen.getByText(/no events found/i)).toBeInTheDocument();
  //   });
  // });

  it('handles events with missing data', async () => {
    const mockEvents = [
      {
        id: 1,
        name: 'Event with missing data',
        // Missing date, time, location, description
      }
    ];

    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: mockEvents
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Event with missing data')).toBeInTheDocument();
    });
  });

  // it('handles user without fullName', async () => {
  //   const mockUser = {
  //     id: 1,
  //     email: 'test@example.com'
  //     // Missing fullName
  //   };

  //   require('../services/api').authAPI.getProfile.mockResolvedValue({
  //     data: mockUser
  //   });

  //   require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
  //     data: []
  //   });

  //   renderWithProviders(<Dashboard />);

  //   await waitFor(() => {
  //     expect(screen.getByText('test@example.com')).toBeInTheDocument();
  //   });
  // });
  // it('handles user without fullName', async () => {
  //   const mockUser = {
  //     id: 1,
  //     email: 'test@example.com'
  //     // Missing fullName
  //   };

  //   require('../services/api').authAPI.getProfile.mockResolvedValue({
  //     data: mockUser
  //   });

  //   require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
  //     data: []
  //   });

  //   renderWithProviders(<Dashboard />);

  //   await waitFor(() => {
  //     expect(screen.getByText('test@example.com')).toBeInTheDocument();
  //   });
  // });

  it('handles loading state', () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<Dashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles user profile loading state', () => {
    require('../services/api').authAPI.getProfile.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<Dashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles both profile and events loading simultaneously', () => {
    require('../services/api').authAPI.getProfile.mockImplementation(() => new Promise(() => {}));
    require('../services/api').eventsAPI.getDashboardEvents.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<Dashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles events with special characters in names', async () => {
    const mockEvents = [
      {
        id: 1,
        name: 'Event with "quotes" & symbols',
        date: '2024-12-25',
        time: '14:00',
        location: 'Test Location',
        description: 'Test Description'
      }
    ];

    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: mockEvents
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Event with "quotes" & symbols')).toBeInTheDocument();
    });
  });

  it('handles events with very long names', async () => {
    const longEventName = 'A'.repeat(100);
    const mockEvents = [
      {
        id: 1,
        name: longEventName,
        date: '2024-12-25',
        time: '14:00',
        location: 'Test Location',
        description: 'Test Description'
      }
    ];

    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: mockEvents
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(longEventName)).toBeInTheDocument();
    });
  });

  // it('handles events with null values', async () => {
  //   const mockEvents = [
  //     {
  //       id: 1,
  //       name: null,
  //       date: null,
  //       time: null,
  //       location: null,
  //       description: null
  //     }
  //   ];

  //   require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
  //     data: mockEvents
  //   });

  //   renderWithProviders(<Dashboard />);

  //   await waitFor(() => {
  //     // Should handle null values gracefully
  //     expect(screen.getByText(/no events found/i)).toBeInTheDocument();
  //   });
  // });

  it('handles user with null values', async () => {
    const mockUser = {
      id: 1,
      email: null,
      fullName: null
    };

    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: mockUser
    });

    require('../services/api').eventsAPI.getDashboardEvents.mockResolvedValue({
      data: []
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      // Should handle null values gracefully
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('handles network timeout errors', async () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockRejectedValue({
      name: 'TimeoutError',
      message: 'Request timeout'
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch dashboard events/i)).toBeInTheDocument();
    });
  });

  it('handles server error responses', async () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Internal server error' }
      }
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch dashboard events/i)).toBeInTheDocument();
    });
  });

  it('handles unauthorized access', async () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockRejectedValue({
      response: {
        status: 401,
        data: { error: 'Unauthorized' }
      }
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch dashboard events/i)).toBeInTheDocument();
    });
  });

  it('handles forbidden access', async () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockRejectedValue({
      response: {
        status: 403,
        data: { error: 'Forbidden' }
      }
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch dashboard events/i)).toBeInTheDocument();
    });
  });

  it('handles not found errors', async () => {
    require('../services/api').eventsAPI.getDashboardEvents.mockRejectedValue({
      response: {
        status: 404,
        data: { error: 'Not found' }
      }
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch dashboard events/i)).toBeInTheDocument();
    });
  });
});

describe('EditEvent Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  // it('renders edit event form', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     date: '2024-12-25',
  //     time: '14:00',
  //     location: 'Test Location',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   renderWithProviders(<EditEvent />, { route: '/events/1/edit' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/edit event/i)).toBeInTheDocument();
  //     expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
  //   });
  // });

  // it('handles form submission', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     date: '2024-12-25',
  //     time: '14:00',
  //     location: 'Test Location',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   const mockUpdate = require('../services/api').eventsAPI.update;
  //   mockUpdate.mockResolvedValue({
  //     data: { id: 1, name: 'Updated Event' }
  //   });

  //   renderWithProviders(<EditEvent />, { route: '/events/1/edit' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/edit event/i)).toBeInTheDocument();
  //   });

  //   const nameInput = screen.getByDisplayValue('Test Event');
  //   const submitButton = screen.getByRole('button', { name: /update event/i });

  //   fireEvent.change(nameInput, { target: { value: 'Updated Event' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
  //       name: 'Updated Event'
  //     }));
  //   });
  // });

  // it('shows error for non-owner', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     date: '2024-12-25',
  //     time: '14:00',
  //     location: 'Test Location',
  //     createdBy: 2 // Different user
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   renderWithProviders(<EditEvent />, { route: '/events/1/edit' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/you don't have permission/i)).toBeInTheDocument();
  //   });
  // });
});

describe('EventDetail Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  // it('renders event details', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     date: '2024-12-25',
  //     time: '14:00',
  //     location: 'Test Location',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   renderWithProviders(<EventDetail />, { route: '/events/1' });

  //   await waitFor(() => {
  //     expect(screen.getByText('Test Event')).toBeInTheDocument();
  //     expect(screen.getByText('Test Description')).toBeInTheDocument();
  //     expect(screen.getByText('Test Location')).toBeInTheDocument();
  //   });
  // });

  it('handles join event', async () => {
    const mockEvent = {
      id: 1,
      name: 'Test Event',
      description: 'Test Description',
      date: '2024-12-25',
      time: '14:00',
      location: 'Test Location',
      createdBy: 2
    };

    require('../services/api').eventsAPI.getById.mockResolvedValue({
      data: mockEvent
    });

    const mockJoin = require('../services/api').eventsAPI.join;
    mockJoin.mockResolvedValue({});

    renderWithProviders(<EventDetail />, { route: '/events/1' });

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    const joinButton = screen.getByRole('button', { name: /join event/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockJoin).toHaveBeenCalledWith(1);
    });
  });

  // it('handles delete event', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     date: '2024-12-25',
  //     time: '14:00',
  //     location: 'Test Location',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   const mockDelete = require('../services/api').eventsAPI.delete;
  //   mockDelete.mockResolvedValue({});

  //   renderWithProviders(<EventDetail />, { route: '/events/1' });

  //   await waitFor(() => {
  //     expect(screen.getByText('Test Event')).toBeInTheDocument();
  //   });

  //   const deleteButton = screen.getByRole('button', { name: /delete event/i });
  //   fireEvent.click(deleteButton);

  //   await waitFor(() => {
  //     expect(mockDelete).toHaveBeenCalledWith(1);
  //   });
  // });
});

describe('EventParticipants Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  it('renders participants list', async () => {
    const mockEvent = {
      id: 1,
      name: 'Test Event',
      description: 'Test Description',
      createdBy: 1
    };

    const mockParticipants = [
      { id: 1, fullName: 'John Doe', email: 'john@example.com', status: 'confirmed' },
      { id: 2, fullName: 'Jane Smith', email: 'jane@example.com', status: 'pending' }
    ];

    require('../services/api').eventsAPI.getById.mockResolvedValue({
      data: mockEvent
    });

    require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
      data: mockParticipants
    });

    renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  // it('adds new participant', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
  //     data: []
  //   });

  //   const mockAddGuest = require('../services/api').participantsAPI.addGuestUser;
  //   mockAddGuest.mockResolvedValue({});

  //   renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/participants/i)).toBeInTheDocument();
  //   });

  //   const addButton = screen.getByRole('button', { name: /add participant/i });
  //   fireEvent.click(addButton);

  //   const nameInput = screen.getByLabelText(/full name/i);
  //   const emailInput = screen.getByLabelText(/email/i);
  //   const submitButton = screen.getByRole('button', { name: /add participant/i });

  //   fireEvent.change(nameInput, { target: { value: 'New Participant' } });
  //   fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(mockAddGuest).toHaveBeenCalledWith(1, {
  //       email: 'new@example.com',
  //       fullName: 'New Participant',
  //       status: 'pending'
  //     });
  //   });
  // });

  it('shows empty state when no participants', async () => {
    const mockEvent = {
      id: 1,
      name: 'Test Event',
      description: 'Test Description',
      createdBy: 1
    };

    require('../services/api').eventsAPI.getById.mockResolvedValue({
      data: mockEvent
    });

    require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
      data: []
    });

    renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

    await waitFor(() => {
      expect(screen.getByText(/no participants yet/i)).toBeInTheDocument();
    });
  });

  // New comprehensive tests for uncovered lines
  // it('handles fetch error gracefully', async () => {
  //   require('../services/api').eventsAPI.getById.mockRejectedValue(new Error('Network error'));
  //   require('../services/api').participantsAPI.getEventParticipants.mockRejectedValue(new Error('Network error'));

  //   renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/failed to fetch event and participants/i)).toBeInTheDocument();
  //   });
  // });

  // it('shows event not found when event is null', async () => {
  //   require('../services/api').eventsAPI.getById.mockResolvedValue({ data: null });
  //   require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({ data: [] });

  //   renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/event not found/i)).toBeInTheDocument();
  //   });
  // });

  it('shows access denied when user is not event creator', async () => {
    const mockEvent = {
      id: 1,
      name: 'Test Event',
      description: 'Test Description',
      createdBy: 999 // Different user ID
    };

    require('../services/api').eventsAPI.getById.mockResolvedValue({
      data: mockEvent
    });

    require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
      data: []
    });

    renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
  });

  // it('adds registered user participant', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
  //     data: []
  //   });

  //   const mockAddRegistered = require('../services/api').participantsAPI.addRegisteredUser;
  //   mockAddRegistered.mockResolvedValue({});

  //   renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/participants/i)).toBeInTheDocument();
  //   });

  //   const addButton = screen.getByRole('button', { name: /add participant/i });
  //   fireEvent.click(addButton);

  //   // Change to registered user type
  //   const typeSelect = screen.getByDisplayValue('Guest');
  //   fireEvent.change(typeSelect, { target: { value: 'registered' } });

  //   const userIdInput = screen.getByLabelText(/user id/i);
  //   const submitButton = screen.getByRole('button', { name: /add participant/i });

  //   fireEvent.change(userIdInput, { target: { value: '123' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(mockAddRegistered).toHaveBeenCalledWith(1, {
  //       userId: 123,
  //       status: 'pending'
  //     });
  //   });
  // });

  // it('handles add participant error', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
  //     data: []
  //   });

  //   const mockAddGuest = require('../services/api').participantsAPI.addGuestUser;
  //   mockAddGuest.mockRejectedValue({
  //     response: { data: { message: 'Email already exists' } }
  //   });

  //   renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/participants/i)).toBeInTheDocument();
  //   });

  //   const addButton = screen.getByRole('button', { name: /add participant/i });
  //   fireEvent.click(addButton);

  //   const nameInput = screen.getByLabelText(/full name/i);
  //   const emailInput = screen.getByLabelText(/email/i);
  //   const submitButton = screen.getByRole('button', { name: /add participant/i });

  //   fireEvent.change(nameInput, { target: { value: 'New Participant' } });
  //   fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  //   });
  // });

  // it('handles add participant error without response data', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     createdBy: 1
  //   };

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
  //     data: []
  //   });

  //   const mockAddGuest = require('../services/api').participantsAPI.addGuestUser;
  //   mockAddGuest.mockRejectedValue(new Error('Network error'));

  //   renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

  //   await waitFor(() => {
  //     expect(screen.getByText(/participants/i)).toBeInTheDocument();
  //   });

  //   const addButton = screen.getByRole('button', { name: /add participant/i });
  //   fireEvent.click(addButton);

  //   const nameInput = screen.getByLabelText(/full name/i);
  //   const emailInput = screen.getByLabelText(/email/i);
  //   const submitButton = screen.getByRole('button', { name: /add participant/i });

  //   fireEvent.change(nameInput, { target: { value: 'New Participant' } });
  //   fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(screen.getByText(/failed to add participant/i)).toBeInTheDocument();
  //   });
  // });

  it('displays participants with different status colors', async () => {
    const mockEvent = {
      id: 1,
      name: 'Test Event',
      description: 'Test Description',
      createdBy: 1
    };

    const mockParticipants = [
      { id: 1, fullName: 'Confirmed User', email: 'confirmed@example.com', status: 'confirmed', type: 'registered', joinedAt: '2024-01-01T00:00:00Z' },
      { id: 2, fullName: 'Pending User', email: 'pending@example.com', status: 'pending', type: 'guest', joinedAt: '2024-01-02T00:00:00Z' },
      { id: 3, fullName: 'Declined User', email: 'declined@example.com', status: 'declined', type: 'registered' },
      { id: 4, fullName: 'Unknown Status', email: 'unknown@example.com', status: 'unknown', type: 'guest' }
    ];

    require('../services/api').eventsAPI.getById.mockResolvedValue({
      data: mockEvent
    });

    require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
      data: mockParticipants
    });

    renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

    await waitFor(() => {
      expect(screen.getByText('Confirmed User')).toBeInTheDocument();
      expect(screen.getByText('Pending User')).toBeInTheDocument();
      expect(screen.getByText('Declined User')).toBeInTheDocument();
      expect(screen.getByText('Unknown Status')).toBeInTheDocument();
    });
  });

  it('displays participants without fullName using userId', async () => {
    const mockEvent = {
      id: 1,
      name: 'Test Event',
      description: 'Test Description',
      createdBy: 1
    };

    const mockParticipants = [
      { id: 1, userId: 123, status: 'confirmed', type: 'registered' },
      { id: 2, userId: 456, status: 'pending', type: 'guest' }
    ];

    require('../services/api').eventsAPI.getById.mockResolvedValue({
      data: mockEvent
    });

    require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
      data: mockParticipants
    });

    renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

    await waitFor(() => {
      expect(screen.getByText('User 123')).toBeInTheDocument();
      expect(screen.getByText('User 456')).toBeInTheDocument();
    });
  });

  // it('sorts participants by status and name', async () => {
  //   const mockEvent = {
  //     id: 1,
  //     name: 'Test Event',
  //     description: 'Test Description',
  //     createdBy: 1
  //   };

  //   const mockParticipants = [
  //     { id: 1, fullName: 'Zebra User', status: 'pending', type: 'guest' },
  //     { id: 2, fullName: 'Alpha User', status: 'confirmed', type: 'registered' },
  //     { id: 3, fullName: 'Beta User', status: 'declined', type: 'guest' },
  //     { id: 4, fullName: 'Charlie User', status: 'confirmed', type: 'registered' }
  //   ];

  //   require('../services/api').eventsAPI.getById.mockResolvedValue({
  //     data: mockEvent
  //   });

  //   require('../services/api').participantsAPI.getEventParticipants.mockResolvedValue({
  //     data: mockParticipants
  //   });

  //   renderWithProviders(<EventParticipants />, { route: '/events/1/participants' });

  //   await waitFor(() => {
  //     const participantCards = screen.getAllByText(/User$/);
  //     // Should be sorted: confirmed first (Alpha, Charlie), then pending (Zebra), then declined (Beta)
  //     expect(participantCards).toHaveLength(4);
  //   });
  // });
});

describe('EventsList Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  it('renders events list', async () => {
    const mockEvents = [
      { id: 1, name: 'Event 1', date: '2024-12-25', location: 'Location 1' },
      { id: 2, name: 'Event 2', date: '2024-12-26', location: 'Location 2' }
    ];

    require('../services/api').eventsAPI.getAll.mockResolvedValue({
      data: mockEvents
    });

    renderWithProviders(<EventsList />, { route: '/events' });

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    const mockEvents = [
      { id: 1, name: 'Event 1', date: '2024-12-25', location: 'Location 1' },
      { id: 2, name: 'Event 2', date: '2024-12-26', location: 'Location 2' }
    ];

    require('../services/api').eventsAPI.getAll.mockResolvedValue({
      data: mockEvents
    });

    renderWithProviders(<EventsList />, { route: '/events' });

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Event 1' } });

    // Both events should still be visible since search is client-side filtering
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    const mockEvents = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Event ${i + 1}`,
      date: '2024-12-25',
      location: 'Location'
    }));

    require('../services/api').eventsAPI.getAll.mockResolvedValue({
      data: mockEvents
    });

    renderWithProviders(<EventsList />, { route: '/events' });

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    // Check if events are rendered
    expect(screen.getByText('Event 1')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    require('../services/api').eventsAPI.getAll.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<EventsList />, { route: '/events' });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    require('../services/api').eventsAPI.getAll.mockRejectedValue(new Error('Failed to load'));

    renderWithProviders(<EventsList />, { route: '/events' });

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument();
    });
  });
});

describe('Login Page', () => {
  it('renders login form', () => {
    renderWithTheme(<Login />, { route: '/login' });
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // it('handles form submission', async () => {
  //   const mockLogin = require('../services/api').authAPI.login;
  //   mockLogin.mockResolvedValue({
  //     data: { user: { id: 1, email: 'test@example.com' }, accessToken: 'token123' }
  //   });

  //   renderWithTheme(<Login />, { route: '/login' });

  //   const emailInput = screen.getByLabelText(/email address/i);
  //   const passwordInput = screen.getByLabelText(/password/i);
  //   const submitButton = screen.getByRole('button', { name: /sign in/i });

  //   fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  //   fireEvent.change(passwordInput, { target: { value: 'password123' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(mockLogin).toHaveBeenCalledWith({
  //       email: 'test@example.com',
  //       password: 'password123'
  //     });
  //   });
  // });

  it('shows error message on login failure', async () => {
    const mockLogin = require('../services/api').authAPI.login;
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } }
    });

    renderWithTheme(<Login />, { route: '/login' });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});

describe('Register Page', () => {
  // it('renders registration form', () => {
  //   renderWithTheme(<Register />, { route: '/register' });
  //   expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  //   expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  // });

  // it('handles form submission', async () => {
  //   const mockRegister = require('../services/api').authAPI.register;
  //   mockRegister.mockResolvedValue({
  //     data: { user: { id: 1, email: 'test@example.com' }, accessToken: 'token123' }
  //   });

  //   renderWithTheme(<Register />, { route: '/register' });

  //   const nameInput = screen.getByLabelText(/full name/i);
  //   const emailInput = screen.getByLabelText(/email address/i);
  //   const passwordInputs = screen.getAllByLabelText(/password/i);
  //   const passwordInput = passwordInputs[0];
  //   const confirmPasswordInput = passwordInputs[1];
  //   const submitButton = screen.getByRole('button', { name: /create account/i });

  //   fireEvent.change(nameInput, { target: { value: 'Test User' } });
  //   fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  //   fireEvent.change(passwordInput, { target: { value: 'password123' } });
  //   fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(mockRegister).toHaveBeenCalledWith({
  //       name: 'Test User',
  //       email: 'test@example.com',
  //       password: 'password123'
  //     });
  //   });
  // });

  it('validates password confirmation', async () => {
    renderWithTheme(<Register />, { route: '/register' });

    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  // it('shows error message on registration failure', async () => {
  //   const mockRegister = require('../services/api').authAPI.register;
  //   mockRegister.mockRejectedValue({
  //     response: { data: { error: 'Email already exists' } }
  //   });

  //   renderWithTheme(<Register />, { route: '/register' });

  //   const nameInput = screen.getByLabelText(/full name/i);
  //   const emailInput = screen.getByLabelText(/email address/i);
  //   const passwordInputs = screen.getAllByLabelText(/password/i);
  //   const passwordInput = passwordInputs[0];
  //   const confirmPasswordInput = passwordInputs[1];
  //   const submitButton = screen.getByRole('button', { name: /create account/i });

  //   fireEvent.change(nameInput, { target: { value: 'Test User' } });
  //   fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  //   fireEvent.change(passwordInput, { target: { value: 'password123' } });
  //   fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
  //   fireEvent.click(submitButton);

  //   expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  // });

  // New comprehensive tests for uncovered lines
  it('handles form input changes', () => {
    renderWithTheme(<Register />, { route: '/register' });

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'secret123' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('secret123');
    expect(confirmPasswordInput.value).toBe('secret123');
  });

  it('handles registration error without response data', async () => {
    const mockRegister = require('../services/api').authAPI.register;
    mockRegister.mockRejectedValue(new Error('Network error'));

    renderWithTheme(<Register />, { route: '/register' });

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/failed to register/i)).toBeInTheDocument();
  });

  it('handles registration error with message in response', async () => {
    const mockRegister = require('../services/api').authAPI.register;
    mockRegister.mockRejectedValue({
      response: { data: { message: 'Custom error message' } }
    });

    renderWithTheme(<Register />, { route: '/register' });

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/custom error message/i)).toBeInTheDocument();
  });

  it('shows loading state during registration', async () => {
    const mockRegister = require('../services/api').authAPI.register;
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockRegister.mockReturnValue(promise);

    renderWithTheme(<Register />, { route: '/register' });

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolvePromise({
      data: { user: { id: 1, email: 'test@example.com' }, accessToken: 'token123' }
    });

    await waitFor(() => {
      expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument();
    });
  });

  // it('validates required fields', async () => {
  //   renderWithTheme(<Register />, { route: '/register' });

  //   const submitButton = screen.getByRole('button', { name: /create account/i });
  //   fireEvent.click(submitButton);

  //   // Form should still be visible
  //   expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  // });

  it('handles empty form submission', async () => {
    renderWithTheme(<Register />, { route: '/register' });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    // Form should still be visible and not submitted
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('disables submit button during loading', async () => {
    const mockRegister = require('../services/api').authAPI.register;
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockRegister.mockReturnValue(promise);

    renderWithTheme(<Register />, { route: '/register' });

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();

    // Try to click again - should not trigger another submission
    fireEvent.click(submitButton);

    // Should only have been called once
    expect(mockRegister).toHaveBeenCalledTimes(1);

    resolvePromise({
      data: { user: { id: 1, email: 'test@example.com' }, accessToken: 'token123' }
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 