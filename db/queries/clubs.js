const pool = require("../../config/pool");

exports.getClubAsync = async (clubId) => {
  const { rows } = await pool.query("SELECT * FROM clubs WHERE id = $1", [
    clubId,
  ]);
  return rows[0];
};

exports.getNumberOfClubMembersAsync = async (clubId) => {
  const { rows } = await pool.query(
    "SELECT COUNT(id) FROM members_of_clubs WHERE club_id = $1",
    [clubId],
  );

  return rows[0].count;
};

exports.addClubAsync = async (name, about, privacy) => {
  const { rows } = await pool.query(
    "INSERT INTO clubs(name, about, privacy) VALUES($1, $2, $3) RETURNING id",
    [name, about, privacy],
  );

  return rows[0].id;
};

exports.addClubMemberAsync = async (clubId, userId) => {
  await pool.query(
    "INSERT INTO members_of_clubs(club_id, member_id, member_role) VALUES($1, $2, 'member')",
    [clubId, userId],
  );
};

exports.assignClubRoleAdminAsync = async (clubId, memberId) => {
  const query = `
    UPDATE members_of_clubs
      SET member_role = 'admin'
      WHERE club_id = $1 AND member_id = $2;
  `;

  await pool.query(query, [clubId, memberId]);
};

exports.assignClubRoleModAsync = async (clubId, memberId) => {
  const query = `
    UPDATE TABLE members_of_clubs
      SET member_role = 'mod'
      WHERE club_id = $1 AND member_id = $2;
  `;
  await pool.query(query, [clubId, memberId]);
};

exports.assignClubRoleMemberAsync = async (clubId, memberId) => {
  const query = `
    UPDATE TABLE members_of_clubs
      SET member_role = 'member'
      WHERE club_id = $1 AND member_id = $2;
  `;
  await pool.query(query, [clubId, memberId]);
};
