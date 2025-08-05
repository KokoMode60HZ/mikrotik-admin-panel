const mysql = require('mysql2/promise');
require('dotenv').config();

// FreeRADIUS Database Configuration
const dbConfig = {
  host: process.env.FREERADIUS_DB_HOST || 'localhost',
  port: process.env.FREERADIUS_DB_PORT || 3306,
  user: process.env.FREERADIUS_DB_USER || 'radius',
  password: process.env.FREERADIUS_DB_PASSWORD || 'radius_password',
  database: process.env.FREERADIUS_DB_NAME || 'radius',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ FreeRADIUS Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ FreeRADIUS Database connection failed:', err.message);
  });

module.exports = pool;
