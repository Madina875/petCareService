const Joi = require("joi");

exports.reviewValidation = (body) => {
  const schema = Joi.object({
    rating: Joi.number().integer().messages({
      "number.base": "Rating must be a number",
    }),
    comment: Joi.string().max(100).messages({
      "string.max": "Comment cannot exceed 100 characters",
    }),
    review_date: Joi.date().default(new Date()).messages({
      "date.base": "Review date must be a valid date",
    }),
    clientId: Joi.number().integer().required().messages({
      "number.base": "Client ID must be a number",
      "any.required": "Client ID is required",
    }),
    appointmentId: Joi.number().integer().required(),
  });

  return schema.validate(body, { abortEarly: false });
};
