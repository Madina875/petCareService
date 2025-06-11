const { sendErrorResponse } = require("../helpers/send_error_response");
const Appointment = require("../models/appointments.model");
const MedicalRecord = require("../models/medical_record.model");
const {
  medicalRecordValidation,
} = require("../validations/medical_record.validation");

const add = async (req, res) => {
  try {
    const { error, value } = medicalRecordValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }
    const newMR = await MedicalRecord.create({
      ...value,
    });
    res.status(201).send({ message: "New medical created!", newMR });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const imagess = await MedicalRecord.findAll({
      include: [
        {
          model: Appointment,
          attributes: ["id", "status", "overall_amount"],
        },
      ],
      attributes: ["id", "visit_date", "medications"],
    });
    res.status(200).send(imagess);
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
    const medica_record = await MedicalRecord.findByPk(id);
    res.status(200).send(medica_record);
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
    const records = await MedicalRecord.destroy({ where: { id } });
    res.status(200).send(records);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const m_records = await MedicalRecord.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(m_records);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

module.exports = { add, getAll, getById, remove, update };
