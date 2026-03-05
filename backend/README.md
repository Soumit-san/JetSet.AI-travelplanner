# JetSet.AI Backend Service

## Overview
This is the NestJS backend service for **JetSet.AI**, your smart travel companion. It acts as an orchestrator that processes heavy business logic, aggregates travel data (flights, hotels, locations, weather), and coordinates AI-driven itinerary generation.

## Getting Started

First, make sure you have installed the required dependencies.

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Configuration
Before running the application, make sure to configure your environment variables for integrations (e.g., Amadeus API, Google Places, Open-Meteo, Anthropic/Claude). Refer to internal documentation for required API keys.

## Architecture & Integration
The backend serves as a critical layer separating the frontend from direct third-party API usage. It relies on:
- **NestJS** for robust application architecture.
- **PostgreSQL** & **Redis** for database and caching.
- **Third-Party APIs** (Amadeus, Google Places) for actual travel data.

## Contributing
Contributors should follow the established branch naming conventions and submit Pull Requests for review. Make sure all formatting and linter checks pass before submitting code.

## License
UNLICENSED
