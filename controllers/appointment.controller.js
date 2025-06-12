const { sendErrorResponse } = require("../helpers/send_error_response");
const MedicalRecord = require("../models/medical_record.model");
const Payment = require("../models/payment.model");
const Service = require("../models/service.model");
const Employee = require("../models/employee.model");
const {
  appointmentValidation,
} = require("../validations/appointment.validation");
const Appointment = require("../models/appointments.model");
const Pet = require("../models/pet.model");
const Client = require("../models/client.model");
const Reviews = require("../models/reviews.model");
const { Op, Sequelize } = require("sequelize");

const add = async (req, res) => {
  try {
    const { error, value } = appointmentValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }
    let {
      petId,
      clientId,
      serviceId,
      employeeId,
      status,
      start_date,
      end_date,
      overall_amount,
    } = value;

    if (status === "rejected") {
      start_date = new Date();
      end_date = new Date();
    }

    const newAppointmetn = await Appointment.create({
      petId,
      clientId,
      serviceId,
      employeeId,
      status,
      start_date,
      end_date,
      overall_amount,
    });

    res
      .status(201)
      .send({ message: "New appointment created!", newAppointmetn });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Pet,
          attributes: ["id", "name", "species", "gender", "age"],
        },

        {
          model: Employee,
          attributes: [
            "id",
            "first_name",
            "email",
            "phone_number",
            "is_active",
          ],
        },
        {
          model: Service,
          attributes: ["id", "price", "is_active"],
        },
        {
          model: MedicalRecord,
          attributes: ["id", "visit_date", "medications"],
        },
        {
          model: Payment,
          attributes: [
            "id",
            "payed_at",
            "price_per_day",
            "price_per_hour",
            "payment_method",
            "status",
          ],
        },
        {
          model: Client,
          attributes: [
            "id",
            "first_name",
            "email",
            "phone_number",
            "is_active",
          ],
        },
        {
          model: Reviews,
          attributes: ["id", "rating", "comment", "appointmentId"],
        },
      ],
      attributes: ["id", "status", "start_date", "end_date"],
    });
    res.status(200).send(appointments);
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
    const appointment = await Appointment.findByPk(id);
    res.status(200).send(appointment);
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
    const appointment = await Appointment.destroy({ where: { id } });
    res.status(200).send({ message: "deleted successfuly ✅" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Appointment ID is required" });
    }

    // Find the appointment first
    const existingAppointment = await Appointment.findByPk(id);
    if (!existingAppointment) {
      return res.status(404).send({ message: "Appointment not found" });
    }

    // Validate the update data
    const { error, value } = appointmentValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }

    // Update the appointment
    const [updated] = await Appointment.update(value, {
      where: { id },
      returning: true,
    });

    if (!updated) {
      return res.status(400).send({ message: "Failed to update appointment" });
    }

    // Get the updated appointment
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Service,
          attributes: ["id", "price", "description"],
        },
        {
          model: Employee,
          attributes: ["id", "first_name", "email", "phone_number"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getWhichHaveBookingWithService = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    const start = new Date(start_time);
    const end = new Date(end_time);
    end.setHours(23, 59, 59, 999); //start_date >= 2025-01-07 00:00:00 | end_date <= 2025-08-07 23:59:59.999

    if (!start_time || !end_time) {
      return res
        .status(400)
        .send({ message: "start_time and end_time are required" });
    }

    const bookings = await Appointment.findAll({
      include: [
        {
          model: Service,
          attributes: ["id", "is_active", "description"],
        },
        {
          model: Pet,
          attributes: ["id", "name", "age"],
        },
      ],
      where: {
        start_date: { [Op.gte]: start },
        end_date: { [Op.lte]: end },
      },
      attributes: ["id"],
    });

    if (bookings.length === 0) {
      return res
        .status(404)
        .send({ message: "No bookings found with contracts in time range" });
    }
    res.status(200).send(bookings);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getClientsWhichHaveBookingWithService = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    const start = new Date(start_time);
    const end = new Date(end_time);
    end.setHours(23, 59, 59, 999); //start_date >= 2025-01-07 00:00:00 | end_date <= 2025-08-07 23:59:59.999

    if (!start_time || !end_time) {
      return res
        .status(400)
        .send({ message: "start_time and end_time are required" });
    }

    const bookings = await Appointment.findAll({
      include: [
        {
          model: Client,
          attributes: ["id", "first_name"],
        },
      ],
      where: {
        start_date: { [Op.gte]: start },
        end_date: { [Op.lte]: end }, // dan oldin dan keyin
      },
      attributes: ["id"],
    });

    if (bookings.length === 0) {
      return res
        .status(404)
        .send({ message: "No bookings found with contracts in time range" });
    }
    res.status(200).send(bookings);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getClientsRejected = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;
    const start = new Date(start_time);
    const end = new Date(end_time);
    end.setHours(23, 59, 59, 999); //start_date >= 2025-01-07 00:00:00 | end_date <= 2025-08-07 23:59:59.999

    if (!start_time || !end_time) {
      return res
        .status(400)
        .send({ message: "start_time and end_time are required" });
    }

    const bookings = await Appointment.findAll({
      include: [
        {
          model: Client,
          attributes: ["id", "first_name"],
        },
      ],
      where: {
        start_date: { [Op.gte]: start },
        end_date: { [Op.lte]: end }, // dan oldin dan keyin
        status: "cancelled",
      },
      attributes: ["id", "status"],
    });
    if (bookings.length === 0) {
      return res
        .status(404)
        .send({ message: "No bookings found with contracts in time range" });
    }
    res.status(200).send(bookings);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getPaymentsByClientFirstName = async (req, res) => {
  try {
    const { first_name } = req.body;
    if (!first_name) {
      return res
        .status(400)
        .json({ message: "first_name is required in body" });
    }
    const payments = await Payment.findAll({
      include: [
        {
          model: Appointment,
          required: true,
          include: [
            {
              model: Client,
              where: {
                first_name: {
                  [Op.iLike]: first_name,
                },
              },
              required: true,
              attributes: ["id", "first_name", "last_name"],
            },
            {
              model: Service,
              attributes: ["id", "description", "price"],
            },
          ],
        },
      ],
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        message: `No payments found for client with first name: ${first_name}`,
      });
    }

    res.status(200).json({
      message: "Payments found",
      count: payments.length,
      payments: payments,
    });
  } catch (error) {
    sendErrorResponse(error, res, 500);
  }
};

const getTopEmployeesByService = async (req, res) => {
  try {
    const { service_name } = req.query;

    if (!service_name) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    const topEmployees = await Employee.findAll({
      attributes: [
        "id",
        "first_name",
        "email",
        "phone_number",
        [
          Sequelize.fn("COUNT", Sequelize.col("appointment.id")),
          "appointment_count",
        ],
      ],
      include: [
        {
          model: Appointment,
          attributes: [],
          required: true,
          include: [
            {
              model: Service,
              attributes: [],
              required: true,
              where: {
                nam,
              },
            },
          ],
        },
      ],
      group: ["employee.id"],
      having: Sequelize.literal("COUNT(appointment.id) > 0"),
      order: [[Sequelize.literal("appointment_count"), "DESC"]],
    });

    if (!topEmployees.length) {
      return res.status(404).json({
        success: false,
        message: `No employees found for service: ${service_name}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Top employees for service: ${service_name}`,
      data: topEmployees,
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

module.exports = {
  add,
  getAll,
  getById,
  remove,
  update,
  getWhichHaveBookingWithService,
  getClientsWhichHaveBookingWithService,
  getClientsRejected,
  getPaymentsByClientFirstName,
  getTopEmployeesByService,
};
