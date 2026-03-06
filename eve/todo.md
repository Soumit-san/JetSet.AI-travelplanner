# JetSet.AI - Development To-Do List

*A consolidated development checklist integrating requirements from the PRD, Liquid Glass UI Design Document, and Tech Stack specifications.*

## 1. Project Initialization & Base Architecture
- [ ] **PRD**: Phase 0 Setup. Remove existing Botpress scripts. Set up routing, API proxy scaffold, and `.env` structure for secure keys.
- [ ] **Design Doc**: Implement CSS variables/tokens for Liquid Glass UI (Ink 900-500, Sky Vivid). Configure fonts (Syne, DM Sans, JetBrains Mono) and responsive breakpoints.
- [ ] **Tech Stack**: Initialize framework (Next.js or Vite + React) with TypeScript, Tailwind CSS, shadcn/ui. Set up NestJS backend (or Next API routes) and PostgreSQL + Redis for caching.

## 2. Feature: Trip Planning Wizard
- [ ] **PRD**: Build a 3-step interactive form (Destination, Dates/Budget, Preferences). Trigger parallel API calls on submission.
- [ ] **Design Doc**: Style inputs with Liquid Glass effects (translucent background, blur, focus glow). Add Framer Motion for smooth step transitions.
- [ ] **Tech Stack**: Use React Hook Form with validation. Integrate Google Places / Mapbox Geocoding API for city autocomplete.

## 3. Feature: Results Dashboard Structure
- [ ] **PRD**: Create a tabbed interface organizing the five core modules (Flights, Hotels, Season, Itinerary, Summary). Handle loading & error states per module.
- [ ] **Design Doc**: Implement staggered fade-in animations for results. Build skeleton loaders matching the exact shape of Glass cards.
- [ ] **Tech Stack**: Use React Query (TanStack) for robust async state management across tabs.

## 4. Feature: Flight Search Module
- [ ] **PRD**: Render outbound and return flight results. Include sorting (Cheapest, Fastest, Best) and filtering (stops, airlines), with booking deep-links.
- [ ] **Design Doc**: Use deep Glass cards. Present numerical data (prices, times, airport codes) using JetBrains Mono. Include primary Sky gradient CTA buttons.
- [ ] **Tech Stack**: App server to integrate Amadeus Flight Offers Search API (handling OAuth). Cache results in Redis (5 min TTL).

## 5. Feature: Emergency Flight Panel
- [ ] **PRD**: Build an always-accessible header panel surfacing the top 3 cheapest same-day/next-day flights from the user's current city. Target <10s response.
- [ ] **Design Doc**: Render as a modal or slide-in drawer. Triggered by a specialized Action button in the header.
- [ ] **Tech Stack**: Utilize browser Geolocation API. Query Amadeus API (Today/Tomorrow). Optionally use BullMQ for background monitoring.

## 6. Feature: Hotel & Accommodation Finder
- [ ] **PRD**: Display hotels near destination landmarks, filtered by budget tier. Show availability badges and amenities with deep links context.
- [ ] **Design Doc**: Implement hotel cards with image thumbnails, star ratings, and prices. Embed an interactive map next to the grid.
- [ ] **Tech Stack**: Integrate Booking.com Affiliate API. Use Google Maps JavaScript API (`@googlemaps/react-wrapper`). Use PostGIS if radius/proximity queries are managed server-side.

## 7. Feature: Best Season Advisor
- [ ] **PRD**: Calculate a month-by-month travel score based on weather, crowds, and flight prices. Suggest the optimal travel window compared to user's selected dates.
- [ ] **Design Doc**: Build a 12-month calendar heat map layout (Green/Yellow/Red color coding) with interactive hover tooltips for deeper stats.
- [ ] **Tech Stack**: Fetch climate data from Open-Meteo or Visual Crossing API. Cross-reference with Amadeus Flight Inspiration API.

## 8. Feature: Itinerary Generator
- [ ] **PRD**: Create a day-by-day schedule with morning/afternoon/evening segments. Include real attraction hours, estimated durations, and meal mapping.
- [ ] **Design Doc**: Layout using a vertical timeline system. Use Activity Tags (Open, Closed, Popular) inside Glass day cards with Hover Lift animations.
- [ ] **Tech Stack**: Query Google Places API (open/close timings, ratings) and Foursquare API. Send multi-API parameters to an LLM (Google Gemini or OpenAI) to systematically structure the days.

## 9. Feature: AI Trip Summary
- [ ] **PRD**: Generate a narrative summary combining all modules. Allow follow-up chat refinements and implement a PDF export / Link sharing flow.
- [ ] **Design Doc**: Display in a dedicated panel featuring streaming text animations. Use Violet UI theme accents for AI-specific elements.
- [ ] **Tech Stack**: Integrate Anthropic Claude API (streaming responses) or Gemini. Implement URL state encoding or PostgreSQL persistence for sharable links. Install a PDF generation library.
