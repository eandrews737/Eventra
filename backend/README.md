# Eventra Backend

A Node.js backend service for managing events, built with Express and Prisma.

## Tech Stack

- Node.js
- Express.js
- Prisma (PostgreSQL)
- JWT Authentication
- API Key Authentication

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm (No yarn!!)

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the PostgreSQL server using Docker:

   ```bash
   docker compose up -d
   ```

4. Create a `.env` file in the root directory with the following variables:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventra_db?schema=public"
   JWT_SECRET="your-secret-key"
   API_KEY="your-api-key"
   FRONTEND_URL="http://localhost:3000"
   ```

5. Initialize the database:

   ```bash
   npx prisma migrate dev --name init
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/validate` - Validate authentication token
- `POST /api/auth/logout` - Logout user

### Events

- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Participants

- `GET /api/participants/event/:eventId` - Get event participants
- `POST /api/participants/event/:eventId/user` - Add registered user as participant
- `POST /api/participants/event/:eventId/guest` - Add guest user as participant
- `PATCH /api/participants/:participantId` - Update participant status
- `DELETE /api/participants/:participantId` - Remove participant

## Authentication

The API uses two layers of authentication:

### 1. API Key Authentication (Required for all requests)

Include the API key in the request headers:

```
x-api-key: your-api-key
```

### 2. JWT Authentication (Required for protected routes)

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

**Note:** All requests require a valid API key, even for public routes like registration and login.

## Error Handling

The API returns appropriate HTTP status codes and error messages in the following format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Development

To run the development server with hot reload:

```bash
npm run dev
```

To run tests:

```bash
npm test
```

## License

MIT
