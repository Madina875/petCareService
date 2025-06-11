const { sendErrorResponse } = require("../helpers/send_error_response");
const Service = require("../models/service.model");
const ServiceCategory = require("../models/service_category.model");
const {
  serviceCategoryValidation,
} = require("../validations/service_category.validation");

const add = async (req, res) => {
  try {
    const { error, value } = serviceCategoryValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }
    const newCategory = await ServiceCategory.create({
      ...value,
    });
    res.status(201).send({ message: "New category created!", newCategory });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const category = await ServiceCategory.findAll({
      include: [
        {
          model: Service,
          as: "services",
          attributes: ["id", "is_active", "price", "description"],
        },
      ],
    });
    res.status(200).send(category);
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
    const category = await ServiceCategory.findByPk(id);
    res.status(200).send(category);
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
    const category = await ServiceCategory.destroy({ where: { id } });
    res.status(200).send({ message: "deleted succcessfuly✅" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const category = await ServiceCategory.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(category);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

module.exports = { add, getAll, getById, remove, update };
