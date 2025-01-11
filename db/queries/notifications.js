const pool = require("../../configs/pool");

exports.sendNotificactionToUserAsync = async (
  userId,
  message,
  link,
  isRead = false,
) => {
  const query =
    "INSERT INTO users_notifications(user_id, message, link, date, is_read) VALUES($1, $2, $3, $4, $5)";
  await pool.query(query, [userId, message, link, new Date(), isRead]);
};

exports.getUserNotificationsAsync = async (userId, limit, offset = 0) => {
  const { rows } = await pool.query(
    "SELECT * FROM users_notifications WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3",
    [userId, limit, offset],
  );

  return rows;
};

exports.markUserNotificationAsReadAsync = async (userId, notification) => {
  const query = `
    UPDATE users_notifications SET is_read = true
    WHERE user_id = $1 AND notification = $2;
  `;

  await pool.query(query, [userId, notification]);
};

exports.deleteNotificationFromUserAsync = async (userId, notification) => {
  const query =
    "DELETE from usres_notifications WHERE user_id = $1 AND notification = $2";
  await pool.query(query, [userId, notification]);
};
