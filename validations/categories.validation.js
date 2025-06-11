const Joi = require("joi");

exports.categoriesValidation = (body) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().trim().messages({
      "string.empty": "Category name cannot be empty",
      "string.max": "Category name cannot exceed 50 characters",
      "any.required": "Category name is required",
    }),
  });
  //   return schema.validate(body);
  return schema.validate(body, { abortEarly: false });
};
