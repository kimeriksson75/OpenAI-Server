const quizService = require('./quiz.service');

exports.getByCategory = async (req, res) =>
    quizService
        .getByCategory(req.params.category)
        .then((response) => res.json(response))
        .catch((err) => next(err));
        
exports.create = async (req, res) =>
    quizService
        .create(req.body)
        .then((response) => res.json(response))
        .catch((err) => next(err));