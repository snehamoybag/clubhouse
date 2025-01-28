const pool = require("../../configs/pool");

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

exports.deletePostFromReportedPostsAsync = async (postId) => {
  await pool.query("DELETE FROM reported_posts WHERE post_id = $1", [postId]);
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

exports.getPostReporterIdsAsync = async (postId) => {
  const query =
    "SELECT DISTINCT reporter_id from reported_posts WHERE post_id = $1";
  const { rows } = await pool.query(query, [postId]);

  return rows.map((row) => row.reporter_id);
};
