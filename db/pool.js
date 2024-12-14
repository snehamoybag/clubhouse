const { Pool } = require("pg");

const pool = new Pool({
  // connection string or connection object values
});

module.exports = pool;
