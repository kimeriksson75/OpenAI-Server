const authService = require("./auth.service");

exports.login = async (req, res, next) =>
  authService
    .login(req.body)
    .then((response) => res.json(response))
    .catch((err) => next(err));

exports.register = async (req, res, next) =>
  authService
    .register(req.body)
    .then((response) => res.json(response))
    .catch((err) => next(err));
