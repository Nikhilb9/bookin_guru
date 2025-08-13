# Bookin Guru Assignment

## About this project

This is a NestJS-based backend recruitment task that provides city pollution data with Wikipedia descriptions. The application fetches pollution data from a third-party API, validates cities using Google Maps Geocoding API, and enriches city information with Wikipedia descriptions.

## Features

- **City Pollution Data**: Fetch pollution data for cities in different countries
- **City Validation**: Uses Google Maps Geocoding API to validate city existence
- **Wikipedia Integration**: Fetches city descriptions from Wikipedia
- **In-Memory Caching**: Implements caching with 10-minute TTL for performance
- **Country Support**: Currently supports multiple countries with configurable country codes
- **Pagination**: Handles large datasets with pagination support

## Architecture Decisions

### Why In-Memory Caching Instead of Redis?

This project uses a simple `Map` object for caching instead of Redis for several reasons:

1. **Simplicity**: For a recruitment assignment, demonstrating caching concepts is more important than production infrastructure
2. **No Persistence Needs**: Cache only stores data for 10 minutes and doesn't require persistence across restarts
3. **Single Instance**: Designed as a single-instance application without horizontal scaling requirements
4. **Lightweight**: No additional infrastructure dependencies or complexity
5. **Sufficient Performance**: Map-based caching provides adequate performance for the assignment scope

### Cache Implementation

```typescript
private cache = new Map<string, { data: CitiesResponseDto; timestamp: number }>();
private CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

The cache stores city data with timestamps and automatically expires entries after 10 minutes.

## Prerequisites

- Node.js 20+
- npm 10+
- Google Maps API Key (for city validation)
- (Optional) Docker 24+ and Docker Compose

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google Maps API Configuration
GOOGLE_API_KEY=your_google_maps_api_key_here

# Third-party API Configuration (optional, defaults provided)
API_USER=testuser
API_PASS=testpass

# Server Configuration (optional)
PORT=3000
```

### Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**
4. Go to **Credentials** and create an **API Key**
5. Restrict the API key to only the Geocoding API for security
6. Copy the API key to your `.env` file

## How to run

### Run locally (npm)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file with your Google API key (see Environment Variables section)

3. Start in watch mode:

   ```bash
   npm run start:dev
   ```

4. App is available at `http://localhost:3000`

Build and run production locally:

```bash
npm run build
npm run start:prod
```

### Run with Docker (development)

```bash
docker compose up --build
```

- Live reload enabled via bind mount
- Exposes `http://localhost:3000`
- **Note**: You'll need to set environment variables in docker-compose.yml or pass them as build args

### Run with Docker (production)

```bash
docker build -t bookin_guru:prod -f Dockerfile .
docker run --rm -p 3000:3000 -e GOOGLE_API_KEY=your_key bookin_guru:prod
```

## API Endpoints

### GET /cities

Fetches cities with pollution data and Wikipedia descriptions for a specific country.

**Query Parameters:**

- `country` (required): Country code (e.g., `US`, `GB`, `DE`)

**Example Request:**

```bash
GET /cities?country=US
```

**Response:**

```json
{
  "page": 1,
  "limit": 100,
  "total": 50,
  "cities": [
    {
      "name": "New York",
      "country": "United States",
      "pollution": 75.5,
      "description": "New York City is the most populous city in the United States..."
    }
  ]
}
```

## Project Structure

```
src/
├── modules/
│   └── cities/           # Cities module with controller, service, and DTOs
├── services/
│   ├── third-party/      # Third-party API integration (pollution data)
│   └── wikipedia/        # Wikipedia API integration
├── app.module.ts         # Main application module
└── main.ts              # Application entry point
```

## Dependencies

- **@nestjs/common**: Core NestJS framework
- **@nestjs/axios**: HTTP client for external API calls
- **@nestjs/config**: Environment configuration management
- **@nestjs/swagger**: API documentation (configured but not fully implemented)

## Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run e2e:test

# Test coverage
npm run test:cov
```

## Development Notes

- The application implements a simple in-memory cache with 10-minute TTL
- City validation is performed using Google Maps Geocoding API
- Wikipedia descriptions are fetched for each validated city
- Error handling includes token refresh for the third-party API
- The service handles pagination automatically when fetching pollution data

## Future Improvements

For production use, consider:

- Implementing Redis for distributed caching
- Adding database persistence for city data
- Implementing rate limiting for external APIs
- Adding comprehensive logging and monitoring
- Implementing proper error handling and retry mechanisms
- Adding authentication and authorization
- Implementing API versioning
