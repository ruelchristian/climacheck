const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/db');

const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const activitiesRoutes = require('./routes/activities');
const categoriesRoutes = require('./routes/categories');
const favoritesRoutes = require('./routes/favorites');
const alertsRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---- Serve the built React frontend from the SAME port ----
// This keeps the app to a single port, which matters on Replit and
// other setups (like a tablet-only workflow) where running a separate
// frontend dev server alongside the API is awkward.
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// Any route that isn't handled above falls through to the React app
// (this covers client-side routes like /dashboard, /favorites, etc.)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`ClimaCheck server running on port ${PORT}`);
  await initDatabase();
});
