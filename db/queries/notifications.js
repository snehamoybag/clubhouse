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

exports.markUserNotificationAsReadAsync = async (notificationId, userId) => {
  const query = `
    UPDATE users_notifications SET is_read = true
    WHERE id = $1 AND user_id = $2;
  `;

  await pool.query(query, [notificationId, userId]);
};

exports.deleteNotificationFromUserAsync = async (userId, notification) => {
  const query =
    "DELETE from usres_notifications WHERE user_id = $1 AND notification = $2";
  await pool.query(query, [userId, notification]);
};

exports.getUnreadUserNotificationsCountAsync = async (userId) => {
  const query =
    "SELECT COUNT(id) FROM users_notifications WHERE user_id = $1 AND is_read = false";
  const { rows } = await pool.query(query, [userId]);
  return Number(rows[0].count);
};
