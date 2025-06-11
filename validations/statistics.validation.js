const Joi = require("joi");

exports.statisticsValidation = (body) => {
  const schema = Joi.object({
    views_count: Joi.number().integer().min(0).required(),
    average_rating: Joi.number().precision(2).min(0).max(5).required(),
    last_updated: Joi.date().default(new Date()).messages({
      "date.base": "Last updated must be a valid date",
    }),
    serviceId: Joi.number().integer().messages({
      "number.base": "Statistics ID must be a number",
    }),
  });

  return schema.validate(body, { abortEarly: false });
};
