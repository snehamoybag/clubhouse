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

exports.doesEmailExistAsync = async (email) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM users WHERE email = $1
    )
      THEN 1 
      ELSE 0
    END;
  `;
  const { rows } = await pool.query(query, [email]);
  return Boolean(rows[0].case);
};

exports.updateUserNameAsync = async (id, firstName, lastName) => {
  const query = `
    UPDATE users 
      SET first_name = $2,
        last_name = $3
    WHERE id = $1;
  `;

  await pool.query(query, [id, firstName, lastName]);
};

exports.updateUserEmailAsync = async (id, email) => {
  const query = `
    UPDATE users 
      SET email = $2
    WHERE id = $1;
  `;

  await pool.query(query, [id, email]);
};

exports.updateUserPasswordAsync = async (id, password) => {
  const query = `
    UPDATE users 
      SET password = $2
    WHERE id = $1;
  `;

  await pool.query(query, [id, password]);
};
