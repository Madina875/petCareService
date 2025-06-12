const { sendErrorResponse } = require("../helpers/send_error_response");
const Service = require("../models/service.model");
const { serviceValidation } = require("../validations/service.validation");
const Client = require("../models/client.model");
const ServiceCategory = require("../models/service_category.model");
const Statistics = require("../models/statistics.model");
const Employee = require("../models/employee.model");
const Serviceemployee = require("../models/service_employee.model");
const Appointment = require("../models/appointments.model");

const add = async (req, res) => {
  try {
    const { error, value } = serviceValidation(req.body);
    console.log(value);
    if (error) {
      return sendErrorResponse(res, error, 400); // ✅ correct order
    }

    const newService = await Service.create({
      ...value,
    });

    return res.status(201).send({
      message: "New service created!",
      newService,
    });
  } catch (error) {
    return sendErrorResponse(res, error, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: ServiceCategory,
          as: "category",
          attributes: ["id", "name", "description"],
        },
        {
          model: Employee,
          through: {
            model: Serviceemployee,
            attributes: ["id", "created_at"],
          },
          attributes: [
            "id",
            "first_name",
            "phone_number",
            "email",
            "is_active",
          ],
        },
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
        {
          model: Statistics,
          attributes: ["id", "views_count", "average_rating"],
        },
      ],
      attributes: ["id", "name", "is_active", "description", "price"],
    });
    res.status(200).send(services);
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
    const service = await Service.findByPk(id);
    res.status(200).send(service);
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
    const service = await Service.destroy({ where: { id } });
    res.status(200).send({ message: "deleted succcessfuly✅" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const service = await Service.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(service);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

module.exports = { add, getAll, getById, remove, update };
