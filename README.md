# Meta Glasses Reviews Project

This repository contains the complete codebase for the Meta Glasses Reviews project, organized as a monorepo containing a frontend and a backend workspace.

## Repository Structure

- [backend/](./backend/) - A Node.js / Express backend with MongoDB and Mongoose. Includes APIs for reviews CRUD, advanced query filters, stats aggregations, user JWT auth, RBAC admin tools, and rate limiting.
- [frontend/](./frontend/) - Frontend application workspace.

## Getting Started

### Backend Setup

To set up and run the backend, follow these steps:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
4. Run the seeder to populate the MongoDB database with reviews:
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

For detailed information about backend routing parameters, metadata listings, auth endpoints, search features, and admin dashboards, refer to the [backend/README.md](./backend/README.md).
