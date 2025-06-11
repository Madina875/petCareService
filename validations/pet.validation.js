const Joi = require("joi");

exports.petValidation = (body) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      "string.empty": "Pet name cannot be empty",
      "string.max": "Pet name cannot exceed 50 characters",
      "any.required": "Pet name is required",
    }),
    breed: Joi.string().max(50).required().messages({
      "string.empty": "Breed cannot be empty",
      "string.max": "Breed cannot exceed 50 characters",
      "any.required": "Breed is required",
    }),
    gender: Joi.string().valid("male", "female").required().messages({
      "any.only": "Gender must be either male or female",
      "any.required": "Gender is required",
    }),
    age: Joi.number().integer().min(0).required().messages({
      "number.base": "Age must be a number",
      "number.min": "Age cannot be negative",
      "any.required": "Age is required",
    }),
    species: Joi.string().max(50).required().messages({
      "string.empty": "Species cannot be empty",
      "string.max": "Species cannot exceed 50 characters",
      "any.required": "Species is required",
    }),
    color: Joi.string().max(50).required().messages({
      "string.empty": "Color cannot be empty",
      "string.max": "Color cannot exceed 50 characters",
      "any.required": "Color is required",
    }),
    clientId: Joi.number().integer().required().messages({
      "number.base": "Client ID must be a number",
      "any.required": "Client ID is required",
    }),
  });

  return schema.validate(body, { abortEarly: false });
};
