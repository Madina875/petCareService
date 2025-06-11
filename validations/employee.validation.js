const Joi = require("joi");

exports.employeeValidation = (body) => {
  const schema = Joi.object({
    first_name: Joi.string().max(50).required().messages({
      "string.empty": "First name cannot be empty",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required",
    }),
    last_name: Joi.string().max(50).required().messages({
      "string.empty": "Last name cannot be empty",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required",
    }),
    phone_number: Joi.string()
      .pattern(/^\d{2}-\d{3}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be in format: XX-XXX-XX-XX",
        "any.required": "Phone number is required",
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
    is_active: Joi.boolean().default(true),
    activation_link: Joi.string().max(250),
  });

  return schema.validate(body, { abortEarly: false });
};
