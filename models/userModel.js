const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../data/users.json");

exports.getUser = async (username, password) => {
  const data = fs.readFileSync(filePath);
  const users = JSON.parse(data);
  return users.find((u) => u.username === username && u.password === password);
};
