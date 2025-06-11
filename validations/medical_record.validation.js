const Joi = require("joi");

exports.medicalRecordValidation = (body) => {
  const schema = Joi.object({
    visit_date: Joi.date().default(new Date()).messages({
      "date.base": "Created at must be a valid date",
    }),
    medications: Joi.string().max(200).required().messages({
      "string.empty": "Medications cannot be empty",
      "string.max": "Medications cannot exceed 200 characters",
      "any.required": "Medications are required",
    }),
    damage_description: Joi.string().max(200).required().messages({
      "string.empty": "Damage description cannot be empty",
      "string.max": "Damage description cannot exceed 200 characters",
      "any.required": "Damage description is required",
    }),
    appointmentId: Joi.number().integer().required().messages({
      "number.base": "Appointment ID must be a number",
      "any.required": "Appointment ID is required",
    }),
  });

  return schema.validate(body, { abortEarly: false });
};
