const pool = require("../../configs/pool");

exports.addUserAsync = async (firstName, lastName, email, password) => {
  await pool.query(
    "INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4)",
    [firstName, lastName, email, password],
  );
};

exports.getUserByIdAsync = async (id) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0];
};

exports.getUserByEmailAsync = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return rows[0];
};
