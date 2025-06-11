const Joi = require("joi");

exports.serviceEmployeeValidation = (body) => {
  const schema = Joi.object({
    created_at: Joi.date().default(new Date()).messages({
      "date.base": "Created at must be a valid date",
    }),
    serviceId: Joi.number().integer().required().messages({
      "number.base": "Service ID must be a number",
      "any.required": "Service ID is required",
    }),
    employeeId: Joi.number().integer().required().messages({
      "number.base": "Employee ID must be a number",
      "any.required": "Employee ID is required",
    }),
  });

  return schema.validate(body, { abortEarly: false });
};
