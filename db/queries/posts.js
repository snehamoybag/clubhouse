const pool = require("../../configs/pool");

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
  }
};

exports.editPostAsync = async (postId, newMessage) => {
  const query = `
    UPDATE posts SET message = $2 
    WHERE id = $1
  `;
  await pool.query(query, [postId, newMessage]);
};

exports.deletePostAsync = async (postId) => {
  // delete from posts_of_users table
  await pool.query("DELETE FROM posts_of_users WHERE post_id = $1", [postId]);

  // delete from posts_in_clubs table
  await pool.query("DELETE FROM posts_in_clubs WHERE post_id = $1", [postId]);

  // delete from posts table
  await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
};

exports.getPostsAsync = async (clubId, limit, offset = 0) => {
  const query = `
    SELECT posts.*, users.id AS author_id, 
      users.first_name AS author_first_name,
      users.last_name AS author_last_name, 
      members_of_clubs.member_role AS author_club_role

      FROM posts
      LEFT JOIN posts_of_users ON posts_of_users.post_id = posts.id
      INNER JOIN users ON users.id = posts_of_users.user_id
      LEFT JOIN posts_in_clubs ON posts_in_clubs.post_id = posts.id
      LEFT JOIN members_of_clubs 
        ON members_of_clubs.member_id = posts_of_users.user_id 
        AND members_of_clubs.club_id = posts_in_clubs.club_id

      WHERE 
        (
          (posts_in_clubs.club_id = $3) 
          OR 
          ($3 IS NULL AND posts_in_clubs.club_id IS NULL)
        )
      ORDER BY posts.date DESC
      LIMIT $1 OFFSET $2;
  `;

  const { rows } = await pool.query(query, [limit, offset, clubId]);
  return rows;
};

exports.getUserPostsAsync = async (userId, limit, offset = 0) => {
  const query = `
    SELECT posts.*,  
      clubs.id AS club_id, clubs.name AS club_name, clubs.privacy AS club_privacy, 
      users.id AS author_id, 
      users.first_name AS author_first_name,
      users.last_name AS author_last_name
    FROM posts 
    INNER JOIN posts_of_users ON posts_of_users.post_id = posts.id
    INNER JOIN users ON users.id = posts_of_users.user_id
    LEFT JOIN posts_in_clubs ON posts_in_clubs.post_id = posts.id
    LEFT JOIN clubs ON clubs.id = posts_in_clubs.club_id
    WHERE posts_of_users.user_id = $1
    ORDER BY posts.date DESC 
    LIMIT $2 OFFSET $3;
  `;

  const { rows } = await pool.query(query, [userId, limit, offset]);
  return rows;
};

exports.getPostClubIdAsync = async (postId) => {
  const { rows } = await pool.query(
    "SELECT club_id FROM posts_in_clubs WHERE post_id = $1",
    [postId],
  );

  return Number(rows[0].club_id);
};

exports.isPostValidAsync = async (postId) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM posts WHERE id = $1
    )
      THEN 1 
      ELSE 0 
    END;
  `;

  const { rows } = await pool.query(query, [postId]);
  return Boolean(rows[0].case);
};

exports.isPostAuthorAsync = async (postId, userId) => {
  const query = `
    SELECT CASE IF EXISTS (
      SELECT 1 FROM posts_of_users
      WHERE posts_of_users.post_id = $1 AND posts_of_users.user_id = $2;
    ) 
      THEN 1 
      ELSE 0 
    END;
  `;

  const { rows } = await pool.query(query, [postId, userId]);
  return Boolean(rows[0].case);
};

exports.isPostInClubAsync = async (postId) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM posts_in_clubs WHERE post_id = $1
    )
      THEN 1 
      ELSE 0
    END;
  `;

  const { rows } = await pool.query(query, [postId]);
  return Boolean(rows[0].case);
};

exports.getReportedPostsAsync = async (clubId, limit, offset = 0) => {
  const query = `
    SELECT * FROM reported_posts 
    WHERE (
      club_id = $1 
      OR 
      $1 IS NULL AND club_id IS NULL
    )
    ORDER BY date ASC
    LIMIT $2 OFFSET $3;
  `;

  const { rows } = await pool.query(query, [clubId, limit, offset]);
  return rows;
};

exports.reportPostToClubAdminAsync = async (
  postId,
  reporterId,
  clubId = null,
) => {
  const query = `INSERT INTO reported_posts(post_id, reporter_id, club_id, date) VALUES($1, $2, $3, $4)`;
  await pool.query(query, [postId, reporterId, clubId, new Date()]);
};

exports.isPostAlreadyReportedByUserAsync = async (postId, userId) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM reported_posts WHERE post_id = $1 AND reporter_id = $2
    )
      THEN 1 
      ELSE 0 
    END;
  `;

  const { rows } = await pool.query(query, [postId, userId]);
  return Boolean(rows[0].case);
};
