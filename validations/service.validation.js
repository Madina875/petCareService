const Joi = require("joi");

exports.serviceValidation = (body) => {
  const schema = Joi.object({
    name: Joi.string().max(200).required().messages({
      "string.empty": "Description cannot be empty",
      "string.max": "Description cannot exceed 200 characters",
      "any.required": "Description is required",
    }),
    price: Joi.number().precision(2).min(0).default(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
      "number.precision": "Price can have at most 2 decimal places",
    }),
    is_active: Joi.boolean().default(true).messages({
      "boolean.base": "Is active must be a boolean",
    }),
    description: Joi.string().max(200).required().messages({
      "string.empty": "Description cannot be empty",
      "string.max": "Description cannot exceed 200 characters",
      "any.required": "Description is required",
    }),
    service_categoryId: Joi.number().integer().required().messages({
      "number.base": "Service category ID must be a number",
      "any.required": "Service category ID is required",
    }),
  });

  return schema.validate(body, { abortEarly: false });
};
