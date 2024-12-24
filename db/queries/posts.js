const pool = require("../../config/pool");

exports.addPostAsync = async (message, timeStamp, authorId, clubId) => {
  // insert into 'posts' tabe
  const { rows } = await pool.query(
    "INSERT INTO posts(message, date) VALUES($1, $2) RETURNING id",
    [message, timeStamp],
  );
  const postId = rows[0].id;

  // insert into 'posts_of_usrs' table
  await pool.query(
    "INSERT INTO posts_of_users(user_id, post_id) VALUES($1, $2)",
    [authorId, postId],
  );

  // insert into 'posts_in_clubs' table
  if (clubId) {
    await pool.query(
      "INSERT INTO posts_in_clubs(club_id, post_id) VALUES($1, $2)",
      [clubId, postId],
    );
  } else {
    await pool.query("INSERT INTO posts_in_clubs(post_id) VALUES($1)", [
      postId,
    ]);
  }
};

exports.getPostsAsync = async (limit, offset = 0) => {
  const query = `
    SELECT posts.*, users.id AS author_id, users.first_name AS author_first_name,
      users.last_name AS author_last_name 
    FROM posts INNER JOIN posts_of_users 
    ON posts_of_users.post_id = posts.id
    INNER JOIN users ON posts_of_users.user_id = users.id
    ORDER BY posts.date DESC
    LIMIT $1 OFFSET $2;
  `;

  const { rows } = await pool.query(query, [limit, offset]);
  return rows;
};
