# Meta Glasses Reviews Backend API

This repository implements a clean, robust, production-grade Node.js, Express, and MongoDB (Mongoose) REST API for the Ray-Ban Meta Glasses reviews dataset. The application features a comprehensive suite of endpoints for full CRUD operations, route filtering, advanced query features (sorting, pagination, selection), aggregation stats pipelines, comparisons, user authentication/authorization, and RBAC admin controls.

---

## Technical Stack & Architecture

- **Runtime Environment**: Node.js (v24.12.0)
- **Web Application Framework**: Express.js
- **Database Engine**: MongoDB (configured via Mongoose Object-Document Mapper)
- **Authentication System**: JSON Web Tokens (JWT) & `bcryptjs`
- **Security Tools**: Request Rate-Limiting (`express-rate-limit`)
- **Aesthetic standard & Standards Compliance**: Clean MVC architecture, consistent response payload formatting, global centralized error handler middleware, and automatic support for `HEAD` and `OPTIONS` pre-flight requests.

---

## Directory Structure

```text
├── config/             # Database connection & env variables configurations
├── controllers/        # Express handlers (Business Logic)
├── middlewares/        # Custom middlewares (auth, logger, error, rateLimiter)
├── models/             # Mongoose schemas (User, Country, Review)
├── routes/             # REST routing setups mapping to controllers
├── scripts/            # Database seeding and migration tools
├── utils/              # Resuable response and query formatting helpers
├── app.js              # Express app definitions
├── server.js           # Server runner and listener
└── README.md           # API Reference Guide
```

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```ini
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/meta-reviews
   JWT_SECRET=supersecretjwtkey123!@#
   JWT_EXPIRE=30d
   ```

3. **Seed Database**:
   Runs the seeder script that processes `dataset.json` (deduplicating users, parsing dates, setting defaults, and associating mock data for testing filters):
   ```bash
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## API Documentation & Routes

### 1. Welcome & Health Check
- `GET /` - API welcome page.
- `GET /health` - Real-time system and MongoDB connection health status.

### 2. User Authentication
- `POST /auth/register` - Create user account (returns JWT).
- `POST /auth/login` - Authenticate credentials (returns JWT and sets HTTP-Only Cookie).
- `GET /auth/logout` - Clear cookies and terminate session.
- `GET /auth/me` - Fetch details of the current logged-in user (`protect` middleware).
- `POST /auth/forgotpassword` - Generate reset token for password recovery.
- `PUT /auth/resetpassword/:resettoken` - Commit password update.

### 3. JWT Profile Protection
- `GET /jwt/profile` - Protected profile route (`protect` middleware).

### 4. Metadata Listings
- `GET /users` - Retrieve all users (paginated).
- `GET /countries` - Retrieve seeded countries (paginated).
- `GET /ratings` - Retrieve rating levels distribution metadata.
- `GET /verified` - Retrieve verified purchase counts metadata.

### 5. Reviews CRUD Operations
- `GET /reviews` - List all active (non-soft-deleted) reviews. Supports query features:
  - **Pagination**: `?page=2&limit=10`
  - **Sorting**: `?sort=rating:desc,date:asc`
  - **Selection**: `?select=title,rating,deviceName`
  - **Filters**: `?verifiedPurchase=true&rating=5`
- `GET /reviews/:reviewID` - Retrieve review details by review ID.
- `POST /reviews` - Submit a new review.
- `PUT /reviews/:reviewID` - Update/Replace full review content.
- `PATCH /reviews/:reviewID/rating` - Partially update only the rating of a review.
- `DELETE /reviews/:reviewID` - Soft-delete a review (sets `isDeleted = true`).

### 6. Filter & Search Routes
- `GET /reviews/title/:title` - Search reviews by title matching the string.
- `GET /reviews/date/:date` - Get reviews on an exact date (`YYYY-MM-DD`).
- `GET /reviews/helpful/:count` - Get reviews with a helpful count of at least `:count`.
- `GET /reviews/positive` - Fetch positive reviews (rating >= 4).
- `GET /reviews/negative` - Fetch negative reviews (rating < 4).
- `GET /search?q=keyword` - Global keyword search across reviews text, titles, users, and countries.

### 7. Extra Filter Parameters
- `GET /reviews/year/:year` - Reviews from a specific year.
- `GET /reviews/month/:month` - Reviews matching a month (1-12).
- `GET /reviews/day/:day` - Reviews matching a specific day of the month (1-31).
- `GET /reviews/date/:year/:month/:day` - Specific date part matching.
- `GET /reviews/helpful-score/:score` - Filter reviews by minimum `helpfulness_score`.
- `GET /reviews/profile/:profile` - Get reviews matching an Amazon profile URL or ID.
- `GET /reviews/device/:deviceName` - Search reviews by Ray-Ban Meta device models (Wayfarer or Headliner).

### 8. Analytics & Aggregations
- `GET /reviews/stats/ratings` - Rating counts, averages, and percentage distributions.
- `GET /reviews/stats/devices` - Performance and volume breakdown per Ray-Ban Meta model.
- `GET /reviews/stats/verified` - Comparison metrics between verified vs unverified reviews.
- `GET /reviews/stats/countries` - Geographical review volume and rating averages.
- `GET /reviews/stats/reviewers` - Active and helpful reviewer leaderboard.

### 9. Advanced Comparisons & Specialized Fetching
- `GET /reviews/compare/users?user1=name1&user2=name2` - Compare statistics of two users side-by-side.
- `GET /reviews/compare/ratings?rating1=5&rating2=1` - Contrast helpfulness and volume metrics of two ratings.
- `GET /reviews/fetch/random?limit=3` - Fetch N randomly sampled reviews.
- `GET /reviews/fetch/trending?limit=5` - Fetch highly active or helpful trending reviews.

### 10. Admin Operations (RBAC Protect)
All routes below require JWT validation (`protect`) and an admin role (`authorize('admin')`):
- `GET /admin/dashboard` - Global metrics (Active/Deleted Reviews, total users, etc.).
- `GET /admin/reviews` - Review audit log including soft-deleted reviews.
- `PUT /admin/reviews/:reviewID/restore` - Restore a soft-deleted review back to active status.
- `DELETE /admin/reviews/:reviewID/hard` - Permanently delete a review from the database.

---

