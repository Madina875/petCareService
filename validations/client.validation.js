const Joi = require("joi");

exports.clientValidation = (body) => {
  const schema = Joi.object({
    first_name: Joi.string().required().min(2).max(50),
    last_name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(30),
    phone_number: Joi.string()
      .pattern(/^\d{2}-\d{3}-\d{2}-\d{2}$/)
      .required(),
    address: Joi.string().required().min(5).max(200),
    is_active: Joi.bool(),
  });
  return schema.validate(body, { abortEarly: false });
};
