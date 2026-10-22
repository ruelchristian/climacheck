-- ClimaCheck Database Schema (MySQL)
-- Run this file to create the database, tables, and seed data.

CREATE DATABASE IF NOT EXISTS climacheck;
USE climacheck;

-- ============================
-- USERS
-- ============================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'content_manager') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- ACTIVITY CATEGORIES
-- ============================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- ACTIVITIES
-- Each activity carries the weather "rule" it fits under.
-- The recommendation engine pulls every activity that matches the
-- current weather, then picks a random subset -- so results are
-- re-shuffled every time the same city/weather is checked again.
-- ============================
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  min_temp_c DECIMAL(5,2) NOT NULL DEFAULT -50,
  max_temp_c DECIMAL(5,2) NOT NULL DEFAULT 60,
  weather_conditions VARCHAR(255) NOT NULL DEFAULT 'Any', -- comma-separated: Clear,Clouds,Rain,Drizzle,Thunderstorm,Snow,Mist,Any
  max_precip_probability INT NOT NULL DEFAULT 100, -- 0-100 (%)
  setting ENUM('indoor', 'outdoor', 'both') NOT NULL DEFAULT 'both',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ============================
-- SAVED LOCATIONS
-- ============================
CREATE TABLE IF NOT EXISTS saved_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  city_name VARCHAR(150) NOT NULL,
  country VARCHAR(10),
  lat DECIMAL(9,6),
  lon DECIMAL(9,6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_city (user_id, city_name)
);

-- ============================
-- FAVORITE ACTIVITIES
-- ============================
CREATE TABLE IF NOT EXISTS favorite_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_activity (user_id, activity_id)
);

-- ============================
-- ALERT SETTINGS (per user, configurable thresholds)
-- ============================
CREATE TABLE IF NOT EXISTS alert_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  high_temp_threshold_c DECIMAL(5,2) NOT NULL DEFAULT 35,
  low_temp_threshold_c DECIMAL(5,2) NOT NULL DEFAULT 10,
  precip_probability_threshold INT NOT NULL DEFAULT 70,
  wind_speed_threshold_kph DECIMAL(5,2) NOT NULL DEFAULT 40,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================
-- SEED DATA: Categories
-- ============================
INSERT INTO categories (name, description) VALUES
('Outdoor Recreation', 'Physical activities enjoyed outside'),
('Indoor Leisure', 'Relaxed activities suited for indoors'),
('Fitness', 'Exercise-focused activities'),
('Social', 'Activities best done with other people'),
('Creative', 'Hobbies centered on making or creating things'),
('Errands & Chores', 'Practical tasks best timed around the weather')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================
-- SEED DATA: Activities
-- A wide pool per weather "bucket" so random selection has variety.
-- ============================
INSERT INTO activities (category_id, name, description, min_temp_c, max_temp_c, weather_conditions, max_precip_probability, setting) VALUES
-- Warm & Clear (outdoor-friendly)
(1, 'Beach Walk', 'Stroll along the shore and enjoy the sun.', 24, 40, 'Clear,Clouds', 30, 'outdoor'),
(1, 'Cycling', 'Ride around the neighborhood or a bike trail.', 18, 34, 'Clear,Clouds', 30, 'outdoor'),
(1, 'Picnic in the Park', 'Pack a lunch and relax outdoors.', 20, 32, 'Clear,Clouds', 20, 'outdoor'),
(1, 'Hiking', 'Explore a nearby trail.', 15, 30, 'Clear,Clouds', 20, 'outdoor'),
(3, 'Outdoor Jogging', 'Go for a run outside.', 15, 30, 'Clear,Clouds', 20, 'outdoor'),
(3, 'Basketball at the Court', 'Shoot hoops at an open-air court.', 18, 33, 'Clear,Clouds', 20, 'outdoor'),
(4, 'Outdoor Café Hangout', 'Meet friends at an al fresco café.', 20, 34, 'Clear,Clouds', 30, 'outdoor'),
(4, 'Street Photography Walk', 'Walk around and take photos of the city.', 18, 34, 'Clear,Clouds', 20, 'outdoor'),

-- Mild / Cloudy (both indoor & outdoor)
(1, 'Nature Photography', 'Capture scenery while conditions are mild.', 10, 26, 'Clouds,Clear', 40, 'outdoor'),
(3, 'Outdoor Yoga', 'Practice yoga in a park or garden.', 15, 28, 'Clear,Clouds', 20, 'outdoor'),
(6, 'Car Wash', 'Good weather for washing the car.', 15, 35, 'Clear,Clouds', 10, 'outdoor'),
(6, 'Grocery Run', 'Head out for errands while it is dry.', -10, 40, 'Clear,Clouds,Mist', 40, 'outdoor'),

-- Rainy / Drizzle / Thunderstorm (indoor-friendly)
(2, 'Movie Marathon', 'Stay in and watch a few films.', -10, 40, 'Rain,Drizzle,Thunderstorm,Snow,Mist,Any', 100, 'indoor'),
(2, 'Reading a Book', 'Curl up with a good book.', -10, 40, 'Rain,Drizzle,Thunderstorm,Any', 100, 'indoor'),
(2, 'Board Games', 'Play a board or card game at home.', -10, 40, 'Rain,Drizzle,Thunderstorm,Any', 100, 'indoor'),
(5, 'Cooking or Baking', 'Try a new recipe indoors.', -10, 40, 'Rain,Drizzle,Thunderstorm,Any', 100, 'indoor'),
(5, 'Painting or Sketching', 'Work on a creative art project.', -10, 40, 'Rain,Drizzle,Thunderstorm,Any', 100, 'indoor'),
(3, 'Home Workout', 'Follow an indoor workout routine.', -10, 40, 'Rain,Drizzle,Thunderstorm,Snow,Any', 100, 'indoor'),
(4, 'Video Game Session with Friends', 'Play online or local co-op games.', -10, 40, 'Rain,Drizzle,Thunderstorm,Snow,Any', 100, 'indoor'),
(6, 'Organize Closet', 'A good rainy-day chore.', -10, 40, 'Rain,Drizzle,Thunderstorm,Any', 100, 'indoor'),
(6, 'Deep-Clean the Kitchen', 'Tidy up while staying indoors.', -10, 40, 'Rain,Drizzle,Thunderstorm,Any', 100, 'indoor'),

-- Cold weather
(2, 'Hot Drink & Journaling', 'Relax indoors with tea or coffee.', -20, 15, 'Any', 100, 'indoor'),
(5, 'Knitting or Crafting', 'Work on a craft project while it is cold.', -20, 16, 'Any', 100, 'indoor'),
(3, 'Indoor Gym Session', 'Head to the gym instead of exercising outside.', -20, 18, 'Any', 100, 'indoor'),

-- Hot weather
(1, 'Swimming', 'Cool off at a pool or beach.', 28, 42, 'Clear,Clouds', 30, 'outdoor'),
(2, 'Ice Cream / Cold Dessert Run', 'Beat the heat with a cold treat.', 28, 42, 'Clear,Clouds,Any', 40, 'both'),
(4, 'Mall Hangout (Air-Conditioned)', 'Stay cool indoors with friends.', 28, 42, 'Any', 100, 'indoor'),

-- Windy
(6, 'Fly a Kite', 'Take advantage of a breezy, clear day.', 15, 33, 'Clear,Clouds', 20, 'outdoor')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================
-- SEED DATA: Sample content manager account
-- Password for both sample accounts is: Password123
-- (bcrypt hash generated at seed time; replace by registering your own accounts)
-- ============================
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Manager', 'admin@climacheck.local', '$2b$10$O9x1c8m3G8m1u1e1G0S1lOeQb2b1KxwYV1zqzq8p8p8p8p8p8p8pO', 'content_manager')
ON DUPLICATE KEY UPDATE name = VALUES(name);
-- NOTE: the hash above is a placeholder. Use backend/database/hash_password.js
-- to generate a real bcrypt hash for this account, or just register normally
-- through POST /api/auth/register and promote the role manually in MySQL:
--   UPDATE users SET role='content_manager' WHERE email='youremail@example.com';
