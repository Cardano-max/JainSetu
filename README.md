# JainSetu - Connecting Jain Community

An all-in-one community application for the Jain community featuring Panchang, Events, Directory, Matrimony, Business Directory, Tirth Booking, E-Store, and more.

## Features

- **Panchang**: Daily Jain calendar with Tithi, Choghadia, sunrise/sunset times
- **Events**: Community events with RSVP, registration, and feedback
- **Directory**: Community member directory with privacy controls
- **Donations**: Secure donation platform for causes and temples
- **Business Directory**: Jain business listings with categories
- **Matrimony**: Privacy-first matrimony service
- **Tirth & Dharamshala**: Temple and accommodation booking
- **E-Store**: Jain products marketplace
- **Jobs**: Community job board
- **Posts & Blog**: Community content sharing

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, Prisma ORM
- **Mobile**: React Native with Expo
- **Admin Panel**: React, Tailwind CSS
- **Authentication**: JWT with OTP verification
- **Payments**: Razorpay integration

## Project Structure

```
jainsetu/
├── backend/          # Express API server
├── mobile/           # React Native mobile app
├── admin/            # React admin panel
└── shared/           # Shared types and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your database and API credentials
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   npm run backend

   # Terminal 2 - Admin Panel
   npm run admin
   ```

## API Documentation

API documentation is available at `/api/docs` when running the backend server.

## License

MIT License - See LICENSE file for details.
