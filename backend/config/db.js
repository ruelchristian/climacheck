const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const isPostgres = Boolean(dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')));

let dbAdapter = null;

if (isPostgres) {
  const { Pool } = require('pg');
  const pgPool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });

  dbAdapter = {
    isPostgres: true,
    async query(sql, params = []) {
      // 1. Replace MySQL-style ? placeholders with PostgreSQL $1, $2, ...
      let paramIndex = 1;
      let convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      // 2. If it's an INSERT without RETURNING, append RETURNING id
      const trimmed = convertedSql.trim();
      const isInsert = /^insert\s+into/i.test(trimmed);
      if (isInsert && !/returning/i.test(trimmed)) {
        convertedSql = `${trimmed} RETURNING id`;
      }

      try {
        const res = await pgPool.query(convertedSql, params);
        const insertId = isInsert && res.rows.length > 0 ? res.rows[0].id : 0;
        const meta = {
          insertId,
          affectedRows: res.rowCount || 0,
          rowCount: res.rowCount || 0,
        };
        return [res.rows, meta];
      } catch (err) {
        // Normalize PostgreSQL unique constraint violation to MySQL ER_DUP_ENTRY
        if (err.code === '23505') {
          err.code = 'ER_DUP_ENTRY';
        }
        throw err;
      }
    },
    async end() {
      await pgPool.end();
    },
  };
} else {
  const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'climacheck',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  dbAdapter = {
    isPostgres: false,
    query(sql, params) {
      return mysqlPool.query(sql, params);
    },
    end() {
      return mysqlPool.end();
    },
  };
}

async function initDatabase() {
  if (isPostgres) {
    try {
      console.log('🔄 Checking PostgreSQL schema and seed data...');
      // 1. FIND_IN_SET compatibility function
      await dbAdapter.query(`
        CREATE OR REPLACE FUNCTION FIND_IN_SET(needle TEXT, haystack TEXT)
        RETURNS INT AS $$
        BEGIN
          IF haystack IS NULL OR needle IS NULL THEN
            RETURN 0;
          END IF;
          IF needle = ANY(string_to_array(haystack, ',')) THEN
            RETURN 1;
          ELSE
            RETURN 0;
          END IF;
        END;
        $$ LANGUAGE plpgsql IMMUTABLE;
      `);

      // 2. Create tables
      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id SERIAL PRIMARY KEY,
          category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          name VARCHAR(150) NOT NULL,
          description VARCHAR(255),
          min_temp_c DECIMAL(5,2) NOT NULL DEFAULT -50,
          max_temp_c DECIMAL(5,2) NOT NULL DEFAULT 60,
          weather_conditions VARCHAR(255) NOT NULL DEFAULT 'Any',
          max_precip_probability INT NOT NULL DEFAULT 100,
          setting VARCHAR(20) NOT NULL DEFAULT 'both',
          is_active SMALLINT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS saved_locations (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          city_name VARCHAR(150) NOT NULL,
          country VARCHAR(10),
          lat DECIMAL(9,6),
          lon DECIMAL(9,6),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_city UNIQUE (user_id, city_name)
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS favorite_activities (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_activity UNIQUE (user_id, activity_id)
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS alert_settings (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          high_temp_threshold_c DECIMAL(5,2) NOT NULL DEFAULT 35,
          low_temp_threshold_c DECIMAL(5,2) NOT NULL DEFAULT 10,
          precip_probability_threshold INT NOT NULL DEFAULT 70,
          wind_speed_threshold_kph DECIMAL(5,2) NOT NULL DEFAULT 40,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Seed default admin if missing
      const [adminRows] = await dbAdapter.query('SELECT id FROM users WHERE email = ?', ['admin@climacheck.local']);
      if (adminRows.length === 0) {
        const hash = await bcrypt.hash('Password123', 10);
        const [adminRes] = await dbAdapter.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          ['Admin Manager', 'admin@climacheck.local', hash, 'content_manager']
        );
        await dbAdapter.query('INSERT INTO alert_settings (user_id) VALUES (?)', [adminRes.insertId]);
        console.log('✅ Default admin user created (admin@climacheck.local / Password123)');
      }

      console.log('✅ PostgreSQL database ready.');
    } catch (err) {
      console.error('⚠️ Database init error:', err.message);
    }
  } else {
    console.log('ℹ️ Running in MySQL mode.');
  }
}

dbAdapter.initDatabase = initDatabase;

module.exports = dbAdapter;
