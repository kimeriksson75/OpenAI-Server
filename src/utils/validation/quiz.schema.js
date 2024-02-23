const Joi = require("joi");

const quizSchema = Joi.array().items(
  Joi.object({
    category: Joi.string().required(),
    question: Joi.string().required(),
    answers: Joi.array().items(Joi.string()).required(),
    correctAnswer: Joi.string().required(),
    difficulty: Joi.string().valid("easy", "medium", "hard"),
  })
);

module.exports = quizSchema;
