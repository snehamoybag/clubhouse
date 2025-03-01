const pool = require("../../configs/pool");
const getHashPasswordAsync = require("../../lib/getHashPasswordAsync");

exports.addUserAsync = async (firstName, lastName, email, password) => {
  const hashedPassword = await getHashPasswordAsync(password);

  await pool.query(
    "INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4)",
    [firstName, lastName, email, hashedPassword],
  );
};

const getNumberOfUserPostsAsync = async (userId) => {
  const query = `
    SELECT COUNT(*) AS number_of_posts
    FROM posts_of_users
    WHERE user_id = $1;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0].number_of_posts;
};

const getNumberOfLikesOnUserPostsAsync = async (userId) => {
  const query = `
    SELECT COUNT(liked_posts.*) AS number_of_likes
    FROM posts_of_users 
    INNER JOIN liked_posts ON liked_posts.post_id = posts_of_users.post_id
       

    WHERE posts_of_users.user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);

  return rows[0].number_of_likes;
};

const getUserAuraAsync = async (userId) => {
  const numOfPosts = await getNumberOfUserPostsAsync(userId);
  const numOfLikes = await getNumberOfLikesOnUserPostsAsync(userId);

  return Math.round(
    numOfLikes / numOfPosts || 1, // making sure the divider is not 0 to prevent unexprected behaviors
  );
};

exports.getUserByIdAsync = async (id) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  const userDetails = rows[0];

  userDetails.aura = await getUserAuraAsync(id);
  return userDetails;
};

exports.getUserByEmailAsync = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const userDetails = rows[0];

  userDetails.aura = await getUserAuraAsync(userDetails.id);
  return userDetails;
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
  const hashedPassword = await getHashPasswordAsync(password);
  const query = `
    UPDATE users 
      SET password = $2
    WHERE id = $1;
  `;

  await pool.query(query, [id, hashedPassword]);
};

exports.updateUserBioAsync = async (id, bio) => {
  const query = `
    UPDATE users
      SET bio = $2
    WHERE id = $1;
  `;

  await pool.query(query, [id, bio]);
};
