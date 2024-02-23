const Joi = require("joi");

const generateImageSchema = Joi.object({
  prompt: Joi.string()
    .required()
    .regex(/[$\(\)<>]/, { invert: true }),
});

module.exports = generateImageSchema;
