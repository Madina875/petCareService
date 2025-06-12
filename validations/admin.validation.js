const Joi = require("joi");

exports.adminValidation = (body) => {
  const schema = Joi.object({
    username: Joi.string().max(50).required().messages({
      "string.empty": "Username cannot be empty",
      "string.max": "Username cannot exceed 50 characters",
      "any.required": "Username is required",
    }),
    email: Joi.string().email().max(50).required().messages({
      "string.email": "Please enter a valid email address",
      "string.max": "Email cannot exceed 50 characters",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).max(250).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password cannot exceed 250 characters",
      "any.required": "Password is required",
    }),
    refresh_token: Joi.string().max(250),
    role: Joi.string().valid("superadmin", "admin", "medical").default("admin"),
    is_creator: Joi.boolean().default(true),
    is_active: Joi.boolean().default(false),
    activation_link: Joi.string().max(100),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  });

  return schema.validate(body, { abortEarly: false });
};
