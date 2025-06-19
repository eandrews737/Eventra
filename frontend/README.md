# Eventra Frontend

A modern React application for managing events and participants, built with React Router, Axios, and Tailwind CSS.

## Features

### Authentication

- User registration and login
- JWT token-based authentication
- Protected routes
- Automatic token validation and refresh

### Event Management

- Create, read, update, and delete events
- Comprehensive event details including:
  - Name and description
  - Start and end dates/times
  - Location and location details
  - Minimum and maximum attendees
  - Preparation information
- Event filtering (all, upcoming, past)
- Search functionality
- Responsive event cards and detailed views

### Participant Management

- Add registered users and guest users to events
- Update participant status (pending, confirmed, declined)
- Remove participants
- View participant details and types

### User Interface

- Modern, responsive design with Tailwind CSS
- Loading states and error handling
- Form validation
- Modal dialogs for confirmations
- Clean navigation and user experience

## API Integration

The application integrates with the Eventra API using the following endpoints:

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/validate` - Validate token
- `POST /api/auth/logout` - User logout

### Events

- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Participants

- `GET /api/participants/event/:id` - Get event participants
- `POST /api/participants/event/:id/user` - Add registered user
- `POST /api/participants/event/:id/guest` - Add guest user
- `PATCH /api/participants/:id` - Update participant status
- `DELETE /api/participants/:id` - Remove participant

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.js          # Route protection component
├── contexts/
│   └── AuthContext.js             # Authentication context
├── pages/
│   ├── Login.js                   # Login page
│   ├── Register.js                # Registration page
│   ├── Dashboard.js               # Main dashboard
│   ├── EventsList.js              # Events listing page
│   ├── CreateEvent.js             # Event creation form
│   ├── EventDetail.js             # Event details view
│   ├── EditEvent.js               # Event editing form
│   └── EventParticipants.js       # Participant management
├── services/
│   └── api.js                     # API service layer
├── App.js                         # Main application component
├── App.css                        # Application styles
└── index.js                       # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment variables:
   Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Environment Variables

- `REACT_APP_API_URL`: The base URL for the Eventra API (default: http://localhost:3001)
- `REACT_APP_API_KEY`: Your API key for authentication

## Usage

### Authentication

1. Navigate to `/register` to create a new account
2. Use `/login` to sign in with existing credentials
3. The application will automatically redirect to the dashboard after successful authentication

### Managing Events

1. **Dashboard**: View event statistics and recent events
2. **Events List**: Browse all events with search and filtering
3. **Create Event**: Use the comprehensive form to create new events
4. **Event Details**: View complete event information and manage participants
5. **Edit Event**: Update event details with pre-filled forms

### Managing Participants

1. Navigate to an event's detail page
2. Click "Manage Participants" to access the participants page
3. Add new participants (registered users or guests)
4. Update participant status or remove participants as needed

## Styling

The application uses Tailwind CSS for styling with custom CSS utilities for:

- Custom scrollbars
- Loading animations
- Form validation styles
- Responsive design utilities
- Modal and backdrop effects

## Error Handling

The application includes comprehensive error handling:

- API error responses
- Network connectivity issues
- Form validation errors
- Authentication failures
- User-friendly error messages

## Security Features

- JWT token storage in localStorage
- Automatic token validation
- Protected routes for authenticated users
- API key authentication
- Automatic logout on authentication failures

## Browser Support

The application supports modern browsers including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

The project follows React best practices:

- Functional components with hooks
- Context API for state management
- Proper error boundaries
- Responsive design principles
- Accessibility considerations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
