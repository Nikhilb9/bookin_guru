# Bookin guru assignment

## About this project

This is an assignment project.

## Backend Recruitment Task

## How to run

### Prerequisites

- Node.js 20+
- npm 10+
- (Optional) Docker 24+ and Docker Compose

### Run locally (npm)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start in watch mode:
   ```bash
   npm run start:dev
   ```
3. App is available at `http://localhost:3000`.

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

### Run with Docker (production)

```bash
docker build -t bookin_guru:prod -f Dockerfile .
docker run --rm -p 3000:3000 bookin_guru:prod
```
