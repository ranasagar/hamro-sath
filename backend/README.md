# Hamro Saath Backend API

Backend API server for Hamro Saath - Safa Nepal civic engagement platform.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod
- **File Upload**: Multer + Sharp
- **Testing**: Jest + Supertest
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   ├── database/         # Database connection
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── migrations/           # Database migrations
├── tests/                # Test files
└── logs/                 # Log files
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+
- Redis 7+

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Create PostgreSQL database:
```bash
createdb hamro_saath
```

4. Run database migrations:
```bash
npm run migrate up
```

5. Start development server:
```bash
npm run dev
```

The server will run on http://localhost:3001

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting errors
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run database migrations

## API Endpoints

See [API_SPECIFICATION.md](../docs/API_SPECIFICATION.md) for complete API documentation.

### Base URL
```
http://localhost:3001/api/v1
```

### Health Check
```
GET /health
```

## Environment Variables

See `.env.example` for all available configuration options.

## Database Schema

See [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) for complete database schema.

## Architecture

See [BACKEND_ARCHITECTURE.md](../docs/BACKEND_ARCHITECTURE.md) for system architecture details.

## Development

### Code Quality

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks

### Testing

- Unit tests with Jest
- Integration tests with Supertest
- Coverage threshold: 70%

### Logging

Winston logger configured with:
- Console output (development)
- File rotation (production)
- Error tracking
- Request logging

## Deployment

See [BACKEND_ARCHITECTURE.md](../docs/BACKEND_ARCHITECTURE.md) for deployment instructions.

## License

MIT
