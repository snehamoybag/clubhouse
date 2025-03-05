const fs = require("node:fs");
const path = require("node:path");

module.exports = () => {
  const pathToAvatarsDir = path.join(__dirname, "../public/assets/avatars/");
  return fs.readdirSync(pathToAvatarsDir);
};
