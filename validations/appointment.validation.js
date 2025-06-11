const Joi = require("joi");

exports.appointmentValidation = (body) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid("scheduled", "completed", "cancelled", "in_progress")
      .messages({
        "any.only":
          "Status must be one of: scheduled, completed, cancelled, in_progress",
      }),
    overall_amount: Joi.number().precision(2).messages({
      "number.base": "Overall amount must be a number",
      "number.precision": "Overall amount can have at most 2 decimal places",
    }),
    start_date: Joi.date().default(new Date()).messages({
      "date.base": "Start date must be a valid date",
    }),
    end_date: Joi.date().messages({
      "date.base": "End date must be a valid date",
    }),
    petId: Joi.number().integer().required().messages({
      "number.base": "Pet ID must be a number",
      "any.required": "Pet ID is required",
    }),
    clientId: Joi.number().integer().required().messages({
      "number.base": "Client ID must be a number",
      "any.required": "Client ID is required",
    }),
    serviceId: Joi.number().integer().required().messages({
      "number.base": "service ID must be a number",
      "any.required": "service ID is required",
    }),
    employeeId: Joi.number().integer().required(),
  });

  return schema.validate(body, { abortEarly: false });
};
