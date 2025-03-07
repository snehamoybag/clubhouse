const pool = require("../../configs/pool");

const likesCountSubQuery = `
  SELECT 
    post_id, 
    COUNT(*) AS likes_count

  FROM liked_posts
  GROUP BY post_id
`;

const isLikedByUSerSubQuery = `
  SELECT 
    post_id,
    TRUE AS is_liked_by_user
  FROM liked_posts
  WHERE user_id = $1
`;

exports.getGlobalPostsAsync = async (userId, pageSize, pageNum = 1) => {
  const offset = pageSize * (pageNum - 1);

  const query = `
    SELECT posts.*, 
      users.id AS author_id, 
      users.first_name AS author_first_name,
      users.last_name AS author_last_name,
      users.avatar AS author_avatar,
      COALESCE(liked_posts.likes_count, 0) AS likes_count, -- making sure it returns 0 if no rows found while left joining tables
      COALESCE(user_likes.is_liked_by_user, FALSE) AS is_liked_by_user -- making sure it returns FALSE if now rows is found while left joining tables 

      FROM posts
      INNER JOIN posts_of_users ON posts_of_users.post_id = posts.id
      INNER JOIN users ON users.id = posts_of_users.user_id
      LEFT JOIN posts_in_clubs ON posts_in_clubs.post_id = posts.id
      LEFT JOIN (${likesCountSubQuery}) AS liked_posts 
        ON liked_posts.post_id = posts.id
      LEFT JOIN (${isLikedByUSerSubQuery}) AS user_likes
        ON user_likes.post_id = posts.id

      WHERE posts_in_clubs.club_id IS NULL

      ORDER BY posts.date DESC, posts.id DESC 
      LIMIT $2 OFFSET $3;
  `;

  const { rows } = await pool.query(query, [userId, pageSize, offset]);
  return rows;
};

exports.getClubPostsAsync = async (userId, clubId, pageSize, pageNum = 1) => {
  const offset = pageSize * (pageNum - 1);

  const query = `
    SELECT posts.*, 
      users.id AS author_id, 
      users.first_name AS author_first_name,
      users.last_name AS author_last_name, 
      users.avatar AS author_avatar,
      COALESCE(liked_posts.likes_count, 0) AS likes_count, -- making sure it returns 0 if no rows found while left joining tables
      members_of_clubs.member_role AS author_club_role,
      COALESCE(liked_posts.likes_count, 0) AS likes_count, -- making sure it returns 0 if no rows found while left joining tables
      COALESCE(user_likes.is_liked_by_user, FALSE) AS is_liked_by_user -- making sure it returns FALSE if now rows is found while left joining tables 

      FROM posts
      INNER JOIN posts_of_users ON posts_of_users.post_id = posts.id
      INNER JOIN users ON users.id = posts_of_users.user_id
      INNER JOIN posts_in_clubs ON posts_in_clubs.post_id = posts.id
      INNER JOIN members_of_clubs 
        ON members_of_clubs.member_id = posts_of_users.user_id 
        AND members_of_clubs.club_id = posts_in_clubs.club_id
      LEFT JOIN (${likesCountSubQuery}) AS liked_posts 
        ON liked_posts.post_id = posts.id
      LEFT JOIN (${isLikedByUSerSubQuery}) AS user_likes
        ON user_likes.post_id = posts.id

      WHERE posts_in_clubs.club_id = $2

      ORDER BY posts.date DESC
      LIMIT $3 OFFSET $4;
  `;

  const { rows } = await pool.query(query, [userId, clubId, pageSize, offset]);
  return rows;
};

exports.getProfilePostsAsync = async (
  userId,
  profileId,
  pageSize,
  pageNum = 1,
) => {
  const offset = pageSize * (pageNum - 1);

  const query = `
    SELECT posts.*,  
      clubs.id AS club_id, clubs.name AS club_name, clubs.privacy AS club_privacy, 
      users.id AS author_id, 
      users.first_name AS author_first_name,
      users.last_name AS author_last_name,
      users.avatar AS author_avatar,
      COALESCE(liked_posts.likes_count, 0) AS likes_count, -- making sure it returns 0 if no rows found while left joining tables
      liked_posts.likes_count,
      user_likes.is_liked_by_user,
      COALESCE(liked_posts.likes_count, 0) AS likes_count, -- making sure it returns 0 if no rows found while left joining tables
      COALESCE(user_likes.is_liked_by_user, FALSE) AS is_liked_by_user -- making sure it returns FALSE if now rows is found while left joining tables 

    FROM posts 
    INNER JOIN posts_of_users ON posts_of_users.post_id = posts.id
    INNER JOIN users ON users.id = posts_of_users.user_id
    LEFT JOIN posts_in_clubs ON posts_in_clubs.post_id = posts.id
    LEFT JOIN clubs ON clubs.id = posts_in_clubs.club_id
    LEFT JOIN (${likesCountSubQuery}) AS liked_posts 
      ON liked_posts.post_id = posts.id
    LEFT JOIN (${isLikedByUSerSubQuery}) AS user_likes
      ON user_likes.post_id = posts.id

    WHERE posts_of_users.user_id = $2
    ORDER BY posts.date DESC 
    LIMIT $3 OFFSET $4;
  `;

  const { rows } = await pool.query(query, [
    userId,
    profileId,
    pageSize,
    offset,
  ]);
  return rows;
};

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
  // delete from related tables first
  await pool.query("DELETE FROM posts_of_users WHERE post_id = $1", [postId]);
  await pool.query("DELETE FROM posts_in_clubs WHERE post_id = $1", [postId]);
  await pool.query("DELETE FROM reported_posts WHERE post_id = $1", [postId]);
  await pool.query("DELETE FROM liked_posts WHERE post_id = $1", [postId]);

  // delete from posts table
  await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
};

exports.getPostAsync = async (userId, postId) => {
  const query = `
    SELECT posts.*, users.id AS author_id, 
      users.first_name AS author_first_name,
      users.last_name AS author_last_name, 
      users.avatar AS author_avatar,
      members_of_clubs.member_role AS author_club_role,
      COALESCE(liked_posts.likes_count, 0) AS likes_count, -- making sure it returns 0 if no rows found while left joining tables
      COALESCE(user_likes.is_liked_by_user, FALSE) AS is_liked_by_user -- making sure it returns FALSE if now rows is found while left joining tables 

      FROM posts
      LEFT JOIN posts_of_users ON posts_of_users.post_id = posts.id
      INNER JOIN users ON users.id = posts_of_users.user_id
      LEFT JOIN posts_in_clubs ON posts_in_clubs.post_id = posts.id
      LEFT JOIN members_of_clubs 
        ON members_of_clubs.member_id = posts_of_users.user_id 
        AND members_of_clubs.club_id = posts_in_clubs.club_id
      LEFT JOIN (${likesCountSubQuery}) AS liked_posts 
        ON liked_posts.post_id = posts.id
      LEFT JOIN (${isLikedByUSerSubQuery}) AS user_likes
        ON user_likes.post_id = posts.id

      WHERE posts.id = $2
  `;

  const { rows } = await pool.query(query, [userId, postId]);
  return rows[0];
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
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM posts_of_users
      WHERE posts_of_users.post_id = $1 AND posts_of_users.user_id = $2
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

exports.likePostAsync = async (userId, postId) => {
  const query = "INSERT INTO liked_posts(post_id, user_id) VALUES($1, $2);";
  await pool.query(query, [postId, userId]);
};

exports.unlikePostAsync = async (userId, postId) => {
  const query = "DELETE FROM liked_posts WHERE post_id = $1 AND user_id = $2;";
  await pool.query(query, [postId, userId]);
};
