const Joi = require("joi");

const validateSignup = (data) => {
  const schema = Joi.object({
    fullname: Joi.string().min(3).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    university: Joi.string().min(3).required(),
    course: Joi.string().min(3).required(),
    role: Joi.string().valid("user", "admin").default("user"),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const questionValidation = {
  addQuestion: Joi.object({
    question: Joi.string().required(),
    options: Joi.array().items(Joi.string().required()).length(4).required(),
    correctOption: Joi.number().integer().min(1).max(4).required(),
    explanation: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    course: Joi.string().required(),
  }),
};

module.exports = { validateSignup, validateLogin, questionValidation };
