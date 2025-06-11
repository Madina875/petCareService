const { sendErrorResponse } = require("../helpers/send_error_response");
const Appointment = require("../models/appointments.model");
const Payment = require("../models/payment.model");
const { paymentValidation } = require("../validations/payment.validation");

const add = async (req, res) => {
  try {
    const { error, value } = paymentValidation(req.body);

    if (error) {
      return sendErrorResponse(error, res, 400);
    }

    const newPayment = await Payment.create({
      ...value,
    });
    res.status(201).send({ message: "New payment created!", newPayment });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Appointment,
          attributes: [
            "id",
            "status",
            "start_date",
            "end_date",
            "overall_amount",
          ],
        },
      ],
    });
    res.status(200).send(payments);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getById = async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(404).send({ message: "id not found" });
    }
    const payments = await Payment.findByPk(id);
    res.status(200).send(payments);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const remove = async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(404).send({ message: "id not found" });
    }
    const payment = await Payment.destroy({ where: { id } });
    res.status(200).send({ message: "deleted succcessfuly✅" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const payment = await Payment.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(payment);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

module.exports = { add, getAll, getById, remove, update };
