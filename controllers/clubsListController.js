const asyncHandler = require("express-async-handler");
const { getClubsAsync, getSearchedClubsAsync } = require("../db/queries/clubs");

exports.GET = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const pageSize = 30;
  const currentPage = Number(req.query.page) || 1;

  const searchQuery = req.query.searchedClub || "";
  let clubs = [];

  if (searchQuery) {
    clubs = await getSearchedClubsAsync(
      userId,
      searchQuery,
      pageSize,
      currentPage,
    );
  } else {
    clubs = await getClubsAsync(userId, pageSize, currentPage);
  }

  res.render("root", {
    title: "List of clubs",
    mainView: "clubsList",
    clubs,
    search: {
      query: searchQuery || "",
    },
    pagination: {
      numOfItmes: clubs.length,
      page: currentPage,
      pageSize,
    },
    styles: "clubs",
  });
});
