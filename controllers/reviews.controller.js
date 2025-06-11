const { sendErrorResponse } = require("../helpers/send_error_response");
const Reviews = require("../models/reviews.model");
const Client = require("../models/client.model");
const { reviewValidation } = require("../validations/reviews.validation");
const Appointment = require("../models/appointments.model");

const add = async (req, res) => {
  try {
    const { error, value } = reviewValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }
    const newReviews = await Reviews.create({
      ...value,
    });
    res.status(201).send({ message: "New review created!", newReviews });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const reviews = await Reviews.findAll({
      include: [
        {
          model: Client,
          attributes: ["id", "email"],
        },
        {
          model: Appointment,
          attributes: ["id", "status", "overall_amount"],
        },
      ],
      attributes: ["id", "rating", "comment", "review_date"],
    });

    res.status(200).send(reviews);
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
    const reviews = await Reviews.findByPk(id);
    res.status(200).send(reviews);
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
    const review = await Reviews.destroy({ where: { id } });
    res.status(200).send({ message: "deleted✅" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const review = await Reviews.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(review);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

module.exports = { add, getAll, getById, remove, update };
