const pool = require("../../configs/pool");

exports.getClubAsync = async (clubId) => {
  const query = `
    SELECT clubs.*, COUNT(members_of_clubs.club_id) AS number_of_members FROM clubs
    LEFT OUTER JOIN members_of_clubs ON members_of_clubs.club_id = clubs.id
    WHERE clubs.id = $1
    GROUP BY clubs.id
  `;
  const { rows } = await pool.query(query, [clubId]);
  return rows[0];
};

exports.getAllClubsAsync = async (limit, offset = 0) => {
  const { rows } = await pool.query("SELECT * FROM clubs LIMIT $1 OFFSET $2", [
    limit,
    offset,
  ]);

  return rows;
};

exports.addClubAsync = async (name, about, privacy) => {
  const { rows } = await pool.query(
    "INSERT INTO clubs(name, about, privacy) VALUES($1, $2, $3) RETURNING id",
    [name, about, privacy],
  );

  return rows[0].id;
};

exports.isClubMemberAsync = async (clubId, userId) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM members_of_clubs
      WHERE members_of_clubs.club_id = $1 
        AND members_of_clubs.member_id = $2
    )
    THEN 1
    ELSE 0 END;
  `;

  const { rows } = await pool.query(query, [clubId, userId]);
  return Boolean(rows[0].case);
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

exports.getMemberClubRoleAsync = async (clubId, memberId) => {
  const query =
    "SELECT member_role FROM members_of_clubs WHERE club_id = $1 AND member_id = $2";

  const { rows } = await pool.query(query, [clubId, memberId]);
  return rows[0].member_role;
};

exports.getNumberOfClubAdminsAsync = async (clubId) => {
  const query =
    "SELECT COUNT(DISTINCT member_id) FROM members_of_clubs WHERE club_id = $1";

  const { rows } = await pool.query(query, [clubId]);
  return Number(rows[0].count);
};

exports.removeClubMemberAsync = async (clubId, memberId) => {
  const query =
    "DELETE FROM members_of_clubs WHERE club_id = $1 AND member_id = $2";

  await pool.query(query, [clubId, memberId]);
};
