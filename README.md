# ClimaCheck

A web-based weather and activity recommendation system. Search a city,
see current conditions and precipitation chance, and get a **randomly
generated** set of activity suggestions that fit that weather — shuffle
for a fresh set any time.

Stack (matches the proposal): **React (Vite)** frontend, **Node.js /
Express** backend, **MySQL** database, **OpenWeather API** for live
weather data, JWT for authentication.

## How the "random" activities work

Every activity in the database carries a weather rule (temperature
range, matching conditions like Clear/Rain/Snow, a max precipitation
probability). When you search a city, the backend finds **every**
activity whose rule matches the current weather, then randomly picks a
handful of them (`GET /api/weather/current`). Hit **Shuffle again** on
the dashboard to re-roll a new random subset of the same matching pool
without re-calling the weather API (`GET /api/weather/refresh-activities`).
So two searches for the same weather can show different activities.

## Project structure

```
climacheck/
  backend/            Express API
    routes/           auth, weather, activities, categories, favorites, alerts, admin
    middleware/auth.js JWT verification + role checks
    config/db.js       MySQL connection pool
    database/schema.sql  Tables + seed data (categories, activities)
    server.js          Serves the API AND the built frontend on one port
  frontend/           React + Vite app
    src/pages/         Login, Register, Dashboard, Favorites, AlertSettings, Admin
```

## Setup

### 1. Database
Create the database and load the schema + seed data:
```bash
mysql -u root -p < backend/database/schema.sql
```
This creates a `climacheck` database with `categories` and `activities`
already seeded with a wide pool of activities across weather types, so
the random recommendations have real variety from the start.

### 2. Environment variables
```bash
cd backend
cp .env.example .env
```
Fill in:
- `DB_PASSWORD` / other DB fields to match your MySQL setup
- `JWT_SECRET` — any long random string
- `OPENWEATHER_API_KEY` — free key from https://openweathermap.org/api

### 3. Install & run

**Single-port (recommended, Replit/tablet-friendly):**
```bash
npm run install-all   # installs backend + frontend deps
npm start              # builds the React app, then starts Express on one port
```
Then open `http://localhost:3000` — the same server serves the API and
the app, so there's nothing else to configure or forward.

**Two-port dev mode (hot-reload while editing):**
```bash
npm run dev:backend    # http://localhost:3000 (API only)
npm run dev:frontend   # http://localhost:5173 (Vite dev server, proxies /api)
```

### 4. Create a content-manager account
Register a normal account through the app, then promote it in MySQL:
```sql
UPDATE users SET role='content_manager' WHERE email='youremail@example.com';
```
Content managers get access to the **Admin** tab to manage activities,
categories, and other users' roles.

## Key API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/weather/current?city=` | Weather + random activity picks |
| GET | `/api/weather/refresh-activities` | Re-roll random activities |
| GET/POST | `/api/favorites/locations` | Saved locations |
| GET/POST | `/api/favorites/activities` | Favorite activities |
| GET/PUT | `/api/alerts/settings` | Personal alert thresholds |
| POST | `/api/alerts/check` | Check a weather reading against thresholds |
| CRUD | `/api/activities`, `/api/categories` | Content-manager only for write ops |
| GET/PUT | `/api/admin/users` | Content-manager only |

## Out of scope (per proposal)
Long-range forecasting, emergency alerts, real-time sensor hardware,
activity booking, native mobile/desktop apps, offline weather data, and
payment processing.
