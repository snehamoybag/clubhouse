require("dotenv").config();
const { Pool } = require("pg");

const env = process.env;

const pool = new Pool({
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  port: env.DB_PORT,
});

module.exports = pool;
