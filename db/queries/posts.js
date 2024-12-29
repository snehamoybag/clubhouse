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

exports.getPostsAsync = async (clubId, limit, offset = 0) => {
  const selectColumns = `
    SELECT posts.*, users.id AS author_id, 
      users.first_name AS author_first_name,
      users.last_name AS author_last_name
  `;

  const joinTables = `
    FROM posts
    LEFT OUTER JOIN posts_in_clubs on posts_in_clubs.post_id = posts.id
    INNER JOIN posts_of_users ON posts_of_users.post_id = posts.id 
    INNER JOIN users ON users.id = posts_of_users.user_id
  `;

  const orderLimitOffset = `
    ORDER BY posts.date DESC
    LIMIT $1 OFFSET $2;
  `;

  // return posts that are not in any clubs
  if (!clubId) {
    const query = `
      ${selectColumns}
      ${joinTables}
      WHERE posts_in_clubs.club_id IS NULL
      ${orderLimitOffset}
    `;

    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  }

  // return posts in club
  const query = `
      ${selectColumns}
      ${joinTables}
      WHERE posts_in_clubs.club_id = $3
      ${orderLimitOffset}
    `;
  const { rows } = await pool.query(query, [limit, offset, clubId]);
  return rows;
};
