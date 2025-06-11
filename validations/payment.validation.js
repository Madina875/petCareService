const Joi = require("joi");

exports.paymentValidation = (body) => {
  const schema = Joi.object({
    payment_method: Joi.string()
      .valid("creditcard", "debitcard", "cash")
      .messages({
        "any.only":
          "Payment method must be one of: creditcard, debitcard, cash",
      }),
    status: Joi.string()
      .valid("unpaid", "paid", "pending", "processing", "failed")
      .messages({
        "any.only":
          "Status must be one of: unpaid, paid, pending, processing, failed",
      }),
    payed_at: Joi.date().default(new Date()),
    price_per_hour: Joi.number().integer().min(0).required(),
    price_per_day: Joi.number().integer().min(0).required(),
    appointmentId: Joi.number().integer().required().messages({
      "number.base": "Appointment ID must be a number",
      "any.required": "Appointment ID is required",
    }),
  });

  return schema.validate(body, { abortEarly: false });
};
