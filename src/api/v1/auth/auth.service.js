const { ACCESS_TOKEN_SECRET } = require("../../../config");
const {
  ValidationError,
  NotFoundError,
} = require("../../../helpers/customErrors/customErrors");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const users = [];

const login = async ({ username, password }) => {
  console.log("logging in user", username, password, users);
  const user = users.find((user) => user.username === username);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  if (user.password !== password) {
    throw new ValidationError("Invalid password");
  }
  const token = jwt.sign({ username, email: user.email }, ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  user.access_token = token;

  return user;
};

const register = async ({ username, email, password }) => {
  console.log("registering user", users);
  const user = users.find((user) => user.email === email);
  if (user) {
    throw new ValidationError("User already exists");
  }
  const newUser = { username, email, password, id: uuidv4() };
  users.push(newUser);
  return newUser;
};

module.exports = {
  login,
  register,
};
