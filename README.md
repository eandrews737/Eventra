# Eventra - Event Management System

## System Architecture Overview

Eventra is a full-stack web application for managing events and participant registrations. The system follows a modern client-server architecture with a React frontend, Node.js/Express backend, and PostgreSQL database, designed with scalability, security, and maintainability in mind.

## High-Level Components

### Frontend (React)

- **Technology**: React 18 with functional components and hooks
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Context API for authentication and theme management
- **Styling**: Tailwind CSS with dark/light theme support
- **Performance**: Lazy loading and virtualization for large lists
- **PWA Support**: Service worker for offline capabilities
- **Testing**: Comprehensive test suite with React Testing Library and Jest
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML and ARIA attributes
- **Responsive Design**: Mobile-first approach with breakpoint optimization

### Backend (Node.js/Express)

- **Technology**: Node.js with Express.js framework
- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: Prisma ORM with PostgreSQL
- **Security**: Helmet.js, CORS, rate limiting, input validation
- **Validation**: Request validation middleware with comprehensive error handling
- **Testing**: Full test coverage with Jest and Supertest
- **Logging**: Structured logging with Morgan and custom error tracking
- **Performance**: Database query optimization and response caching

### Database (PostgreSQL)

- **ORM**: Prisma for type-safe database operations
- **Relations**: User, Event, and EventParticipant models with proper relationships
- **Migrations**: Automated schema management with version control
- **Indexing**: Strategic database indexing for performance optimization
- **Constraints**: Data integrity constraints and foreign key relationships

## Technologies Used

### Frontend Stack

- **React 18** - UI framework with concurrent features
- **React Router v6** - Client-side routing with code splitting
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Axios** - HTTP client for API communication with interceptors
- **React Context API** - State management for global application state
- **React Testing Library** - Component testing with user-centric approach
- **Jest** - Testing framework with comprehensive coverage reporting

### Backend Stack

- **Node.js** - JavaScript runtime with latest LTS features
- **Express.js** - Web framework with middleware architecture
- **Prisma** - Database ORM with type safety and migrations
- **PostgreSQL** - Relational database with ACID compliance
- **JWT** - Authentication tokens with refresh mechanism
- **bcrypt** - Password hashing with salt rounds
- **Helmet.js** - Security middleware for HTTP headers
- **CORS** - Cross-origin resource sharing with configurable policies
- **Morgan** - HTTP request logger with custom formats
- **Jest** - Testing framework with API testing capabilities
- **Supertest** - API testing with request/response validation

### Development Tools

- **ESLint** - Code linting with custom rules and configurations
- **Prettier** - Code formatting with consistent style enforcement
- **Nodemon** - Development server with hot reloading
- **Create React App** - Frontend build tool with PWA support
- **Docker** - Containerization for consistent development environments

## Accessibility & Responsiveness

### Accessibility Features (WCAG 2.1 AA Compliant)

- **Semantic HTML**: Proper use of heading hierarchy, landmarks, and form labels
- **ARIA Attributes**: Screen reader support with aria-labels, roles, and states
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text elements
- **Alternative Text**: Descriptive alt text for images and icons
- **Form Validation**: Accessible error messages and validation feedback
- **Skip Links**: Navigation shortcuts for keyboard users

### Responsive Design

- **Mobile-First Approach**: Design starts with mobile and scales up
- **Breakpoint Strategy**: 
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+
- **Flexible Grid System**: CSS Grid and Flexbox for adaptive layouts
- **Touch-Friendly Interface**: Minimum 44px touch targets
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance Optimization**: Optimized images and lazy loading

## Testing Strategy

#### Running Backend Tests
```bash
cd backend
npm test                    # Run all tests with coverage
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate detailed coverage report
npm run test:ci           # Run tests for CI/CD
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
```

### Frontend Testing

The frontend includes comprehensive component and integration tests:

#### Test Coverage Areas
- **Component Tests** (`App.test.js`)
  - Authentication flow
  - Navigation and routing
  - Form handling and validation
  - API integration
  - Error handling
  - Loading states
  - Theme management

#### Running Frontend Tests
```bash
cd frontend
npm test                    # Run all tests with coverage
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate detailed coverage report
npm run test:ci           # Run tests for CI/CD
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
```

## Data Models and Relations

### User Model

- **id**: Primary key (auto-increment)
- **email**: Unique email address
- **password**: Hashed password
- **fullName**: User's full name
- **createdAt**: Account creation timestamp
- **updatedAt**: Last update timestamp

### Event Model

- **id**: Primary key (auto-increment)
- **title**: Event title
- **description**: Event description
- **location**: Event location
- **startDatetime**: Event start date and time
- **endDatetime**: Event end date and time
- **maxParticipants**: Maximum number of participants
- **createdBy**: Foreign key to User (event creator)
- **createdAt**: Event creation timestamp
- **updatedAt**: Last update timestamp

### EventParticipant Model

- **id**: Primary key (auto-increment)
- **eventId**: Foreign key to Event
- **userId**: Foreign key to User (nullable for guest participants)
- **guestName**: Guest participant name (nullable for registered users)
- **guestEmail**: Guest participant email (nullable for registered users)
- **status**: Participation status (confirmed, pending, cancelled)
- **createdAt**: Participation timestamp
- **updatedAt**: Last update timestamp

### Relationships

- **User → Event**: One-to-Many (User can create multiple events)
- **User → EventParticipant**: One-to-Many (User can participate in multiple events)
- **Event → EventParticipant**: One-to-Many (Event can have multiple participants)

## API Endpoints

### Authentication Routes (`/api/auth`)

- **POST /register** - Register new user
- **POST /login** - User login
- **POST /refresh** - Refresh JWT token
- **POST /logout** - User logout
- **GET /me** - Get current user profile
- **POST /validate** - Validate JWT token

### Event Routes (`/api/events`)

- **GET /** - Get all events
- **GET /dashboard** - Get user's dashboard events (created or joined)
- **GET /:id** - Get specific event by ID
- **POST /** - Create new event
- **PUT /:id** - Update existing event
- **DELETE /:id** - Delete event
- **POST /:id/join** - Join an event
- **GET /:id/participant** - Get current user's participant ID for an event

### Participant Routes (`/api/participants`)

- **GET /event/:eventId** - Get all participants for an event
- **POST /event/:eventId/user** - Add registered user as participant
- **POST /event/:eventId/guest** - Add guest user as participant
- **PATCH /:participantId** - Update participant status
- **DELETE /:participantId** - Remove participant from event

### Request/Response Format

All API endpoints return JSON responses with the following structure:

- **Success**: `{ data: {...} }` or direct data object
- **Error**: `{ error: "Error message" }`

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Eventra
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file with database and JWT secrets
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Run Tests**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/eventra"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

#### Frontend (.env)
```
REACT_APP_API_URL="http://localhost:3001/api"
```

## Code Quality & Best Practices

### Pre-commit Hooks
- Run tests before committing
- Check linting rules
- Ensure code coverage thresholds are met
- Format code automatically

### Code Review Guidelines
- Pull request templates with checklists
- Automated testing on all PRs
- Code coverage requirements
- Security review for sensitive changes

## Security Features

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcrypt with salt rounds for password security
- **Session Management**: Secure cookie-based sessions with httpOnly flags
- **Role-Based Access**: Granular permissions for different user roles

### API Security
- **Rate Limiting**: Protection against brute force attacks and DDoS
- **CORS**: Cross-origin resource sharing with configurable policies
- **Helmet.js**: Security headers including CSP, HSTS, and XSS protection
- **Input Validation**: Comprehensive request validation and sanitization
- **SQL Injection Protection**: Prisma ORM with parameterized queries

### Data Protection
- **Encryption**: Sensitive data encryption at rest and in transit
- **Audit Logging**: Comprehensive audit trails for security events
- **Data Privacy**: GDPR compliance with data retention policies

## Performance & Scalability

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for route-based code splitting
- **Lazy Loading**: Component and image lazy loading
- **Virtualization**: Efficient rendering of large lists
- **Caching**: Service worker for offline capabilities
- **Bundle Optimization**: Tree shaking and minification

### Backend Optimizations
- **Database Indexing**: Strategic indexes for query performance
- **Query Optimization**: Efficient database queries with Prisma
- **Response Caching**: Redis-based caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Connection Pooling**: Database connection optimization

### Scalability Considerations
- **Horizontal Scaling**: Stateless application design for easy scaling
- **Load Balancing**: Ready for load balancer integration
- **Microservices**: Modular architecture for future microservices migration
- **Database Scaling**: Read replicas and sharding strategies
- **CDN Integration**: Static asset delivery optimization

## Monitoring and Observability

### Application Monitoring
- **Morgan**: HTTP request logging with custom formats
- **Error Tracking**: Centralized error handling and reporting

### Database Monitoring
- **Query Performance**: Slow query identification and optimization
- **Connection Pooling**: Database connection monitoring
- **Migration Tracking**: Database schema change monitoring

### Production Monitoring
- **Uptime Monitoring**: Application availability tracking
- **Resource Usage**: CPU, memory, and disk usage monitoring
- **Alerting**: Automated alerts for critical issues
- **Log Aggregation**: Centralized logging with search capabilities

### Pull Request Process
1. Create a feature branch from the main branch
2. Implement changes with appropriate tests
3. Ensure all tests pass and coverage requirements are met
4. Update documentation as needed
5. Submit a pull request with detailed description
6. Address review feedback and make necessary changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.
