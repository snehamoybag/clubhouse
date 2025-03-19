const pool = require("../../configs/pool");

exports.isClubValidAsync = async (clubId) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM clubs WHERE id = $1
    )
      THEN 1 
      ELSE 0 
    END;
  `;

  const { rows } = await pool.query(query, [clubId]);
  return Boolean(rows[0].case);
};

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

const membersCountSubQuery = `
  SELECT club_id, COUNT(member_id) AS members_count
  FROM members_of_clubs 
  GROUP BY club_id
`;

const userRoleSubQuery = `
  SELECT club_id, member_role AS user_role
  FROM members_of_clubs
  WHERE member_id = $1 -- $1 must represent user id
`;

const clubsSelectQuery = `
  SELECT 
    clubs.*, 
    COALESCE(clubs_members.members_count, 0) AS members_count,
    roles.user_role
  FROM clubs 
  INNER JOIN (${membersCountSubQuery}) 
    AS clubs_members ON clubs_members.club_id = clubs.id 
  LEFT JOIN (${userRoleSubQuery}) 
    AS roles ON roles.club_id = clubs.id
`;

exports.getClubsAsync = async (userId, pageSize, pageNum = 1) => {
  const offset = pageSize * (pageNum - 1);

  const query = `
    ${clubsSelectQuery}
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await pool.query(query, [userId, pageSize, offset]);

  return rows;
};

exports.getSearchedClubsAsync = async (
  userId,
  searchQuery,
  pageSize,
  pageNum = 1,
) => {
  const offset = pageSize * (pageNum - 1);

  const query = `
    ${clubsSelectQuery}
    WHERE name ILIKE $2 
    LIMIT $3 OFFSET $4
  `;
  const { rows } = await pool.query(query, [
    userId,
    `%${searchQuery}%`,
    pageSize,
    offset,
  ]);
  return rows;
};

exports.getUserClubsAsync = async (userId, limit, offset = 0) => {
  const query = `
    SELECT clubs.*, members_of_clubs.member_role
    FROM clubs
    INNER JOIN members_of_clubs 
      ON members_of_clubs.club_id = clubs.id
    
    WHERE members_of_clubs.member_id = $1
    ORDER BY clubs.name ASC
    LIMIT $2 OFFSET $3;
  `;

  const { rows } = await pool.query(query, [userId, limit, offset]);
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
    "INSERT INTO members_of_clubs(club_id, member_id, member_role, joining_date) VALUES($1, $2, 'member', $3)",
    [clubId, userId, new Date()],
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

  return rows[0] ? rows[0].member_role : null;
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

exports.updateClubInfoAsync = async (clubId, name, about, privacy) => {
  const query = `
    UPDATE clubs
      SET name = $2,
      about = $3,
      privacy = $4
    WHERE id = $1;
  `;

  await pool.query(query, [clubId, name, about, privacy]);
};

exports.sendClubJoinRequestAsync = async (clubId, userId) => {
  const query =
    "INSERT INTO clubs_join_requests(club_id, user_id, date) VALUES($1, $2, $3)";
  await pool.query(query, [clubId, userId, new Date()]);
};

exports.deleteClubJoinRequestAsync = async (clubId, userId) => {
  await pool.query(
    "DELETE FROM clubs_join_requests WHERE club_id = $1 AND user_id = $2",
    [clubId, userId],
  );
};

exports.getClubJoinRequestsAsync = async (clubId, limit, offset = 0) => {
  const query = `
    SELECT clubs_join_requests.*, users.first_name AS user_first_name, 
      users.last_name AS user_last_name
    FROM clubs_join_requests 
    INNER JOIN users ON users.id = clubs_join_requests.user_id
    WHERE clubs_join_requests.club_id = $1
    ORDER BY clubs_join_requests.date DESC
    LIMIT $2 OFFSET $3;
  `;

  const { rows } = await pool.query(query, [clubId, limit, offset]);
  return rows;
};

exports.addUserToClubBanListAsync = async (clubId, userId) => {
  await pool.query(
    "INSERT INTO banned_club_members(club_id, user_id) VALUES($1, $2)",
    [clubId, userId],
  );
};

exports.removeUserFromClubBanListAsync = async (clubId, userId) => {
  await pool.query(
    "DELETE FROM banned_club_members WHERE club_id = $1 AND user_id = $2",
    [clubId, userId],
  );
};

exports.getClubBannedUsersAsync = async (clubId, limit, offset = 0) => {
  const query = `
    SELECT users.id, users.first_name, users.last_name FROM banned_club_members 
    INNER JOIN users ON users.id = banned_club_members.user_id
    WHERE banned_club_members.club_id = $1
    ORDER BY id DESC
    LIMIT $2 OFFSET $3;
  `;

  const { rows } = await pool.query(query, [clubId, limit, offset]);
  return rows;
};

exports.isUserBannedFromClubAsync = async (clubId, userId) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM banned_club_members WHERE club_id = $1 AND user_id = $2
    )
      THEN 1 
      ELSE 0 
    END;
  `;

  const { rows } = await pool.query(query, [clubId, userId]);
  return Boolean(rows[0].case);
};

exports.isClubNameAvailableAsync = async (name) => {
  const query = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 FROM clubs WHERE name = $1
    )
      THEN 0 
      ELSE 1 
    END;
  `;

  const { rows } = await pool.query(query, [name.trim()]);
  return Boolean(rows[0].case);
};

exports.saveClubInvitationAsync = async (
  clubId,
  invitedUserId,
  invitedByUserId,
) => {
  const query = `
    INSERT INTO users_invited_clubs(
      club_id, 
      invited_user_id, 
      invited_by_user_id, 
      date
    ) VALUES (
      $1, $2, $3, $4 
    );
  `;

  await pool.query(query, [clubId, invitedUserId, invitedByUserId, new Date()]);
};

exports.deleteClubInvitationAsync = async (clubId, invitedUserId) => {
  const query =
    "DELETE FROM users_invited_clubs WHERE club_id = $1 AND invited_user_id = $2";

  await pool.query(query, [clubId, invitedUserId]);
};

exports.doesUserHaveClubInvitationAsync = async (clubId, userId) => {
  const query =
    "SELECT 1 FROM users_invited_clubs WHERE club_id = $1 AND invited_user_id = $2";
  const { rows } = await pool.query(query, [clubId, userId]);

  return rows.length > 0;
};
