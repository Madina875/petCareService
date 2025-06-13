const { sendErrorResponse } = require("../helpers/send_error_response");
const Employee = require("../models/employee.model");
const Service = require("../models/service.model");
const ServiceEmployee = require("../models/service_employee.model");
const {
  serviceEmployeeValidation,
} = require("../validations/service_employee.validation");

const add = async (req, res) => {
  try {
    const { error, value } = serviceEmployeeValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }
    const newEmployee = await ServiceEmployee.create({
      ...value,
    });
    res.status(201).send({ message: "New employee created!", newEmployee });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const employee = await ServiceEmployee.findAll({
      include: [
        {
          model: Employee,
          attributes: [
            "id",
            "first_name",
            "last_name",
            "phone_number",
            "email",
            "is_active",
          ],
        },
        {
          model: Service,
          attributes: ["id", "name", "description", "price", "is_active"],
        },
      ],
      attributes: ["id", "created_at"],
    });
    res.status(200).send(employee);
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
    const employee = await ServiceEmployee.findByPk(id);
    res.status(200).send(employee);
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
    const employee = await ServiceEmployee.destroy({ where: { id } });
    res.status(200).send({ message: "deleted succcessfuly✅" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const employee = await ServiceEmployee.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(employee);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

module.exports = { add, getAll, getById, remove, update };
