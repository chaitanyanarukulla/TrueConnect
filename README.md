# TrueConnect Dating App

TrueConnect is a modern dating application that focuses on authentic connections through shared interests, values, and communities. The platform combines traditional dating features with community-based interactions to create meaningful relationships.

## Features

- **User Authentication**: Secure registration and login with JWT-based authentication
- **Profile Management**: Create and customize detailed user profiles
- **Matching System**: Preference-based algorithm to find compatible matches
- **Real-time Messaging**: Instant communication with matches through WebSockets
- **Community Features**: Join and participate in interest-based communities
- **Events**: Create, manage, and RSVP to community events
- **Content Moderation**: Comprehensive reporting and moderation system
- **Real-time Notifications**: WebSocket-based notification system

## Technology Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Authentication**: JWT with refresh tokens
- **Real-time Communication**: Socket.io
- **ORM**: TypeORM

### Frontend
- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API and React Query
- **Client-Side Validation**: React Hook Form with Zod

## Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL (for production)

## Getting Started

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/TrueConnect.git
   cd TrueConnect
   ```

2. Install dependencies
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and JWT secret.

4. Start the development server
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Install dependencies
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

## Running with Docker

The application includes Docker configurations for both frontend and backend services.

1. Build and run using Docker Compose
   ```bash
   docker-compose up --build
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Project Structure

### Backend
- `/src/modules` - Feature modules (users, auth, messages, etc.)
- `/src/types` - Type definitions
- `/src/health` - Health check endpoints

### Frontend
- `/src/app` - Next.js pages and routes
- `/src/components` - Reusable UI components
- `/src/features` - Feature-specific components and logic
- `/src/services` - API services
- `/src/hooks` - Custom React hooks
- `/src/context` - React context providers
- `/src/types` - TypeScript type definitions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The TrueConnect team
- All open-source libraries and frameworks used in this project
