const { sendErrorResponse } = require("../helpers/send_error_response");
const Client = require("../models/client.model");
const { petValidation } = require("../validations/pet.validation");
const Pet = require("../models/pet.model");
const Appointment = require("../models/appointments.model");

const add = async (req, res) => {
  try {
    const { error, value } = petValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }
    const newPet = await Pet.create({
      ...value,
    });
    res.status(201).send({ message: "New pet!", newPet });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const pets = await Pet.findAll({
      include: [
        {
          model: Appointment,
          attributes: [
            "id",
            "status",
            "overall_amount",
            "start_date",
            "end_date",
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
      ],
      attributes: ["id", "name", "species", "gender", "age", "gender"],
    });
    res.status(200).send(pets);
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
    const pet = await Pet.findByPk(id);
    res.status(200).send(pet);
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
    const pet = await Pet.destroy({ where: { id } });
    res.status(200).send(product);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const pet = await Pet.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(pet);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

// const getProductWhichHaveContractWithClient = async (req, res) => {
//   try {
//     const { start_time, end_time } = req.body;

//     const start = new Date(start_time);
//     const end = new Date(end_time);
//     end.setHours(23, 59, 59, 999); //start_date >= 2025-01-07 00:00:00 | end_date <= 2025-08-07 23:59:59.999

//     if (!start_time || !end_time) {
//       return res
//         .status(400)
//         .send({ message: "start_time and end_time are required" });
//     }

//     const products = await Contract_products.findAll({
//       include: [
//         {
//           model: Contract,
//           where: {
//             start_date: { [Op.gte]: start },
//             end_date: { [Op.lte]: end }, // dan oldin dan keyin
//           },
//         },
//       ],
//     });

//     if (products.length === 0) {
//       return res
//         .status(404)
//         .send({ message: "No products found with contracts in time range" });
//     }
//     res.status(200).send(products);
//   } catch (error) {
//     sendErrorResponse(error, res, 400);
//   }
// };

// const getClientsProductStatusByTime = async (req, res) => {
//   try {
//     const { start_time, end_time } = req.body;
//     const start = new Date(start_time);
//     const end = new Date(end_time);
//     end.setHours(23, 59, 59, 999); //start_date >= 2025-01-07 00:00:00 | end_date <= 2025-08-07 23:59:59.999

//     if (!start_time || !end_time) {
//       return res
//         .status(400)
//         .send({ message: "start_time and end_time are required" });
//     }

//     const products = await Product.findAll({
//       include: [
//         {
//           model: Client,
//           required: true,
//           through: {
//             model: Reviews,
//             where: {
//               status_on_return: "damaged",
//               review_date: { [Op.between]: [start, end] },
//             },
//             attributes: [
//               "status_on_delivery",
//               "status_on_return",
//               "review_date",
//             ],
//           },
//           attributes: ["id", "first_name"],
//         },
//       ],
//       attributes: ["id", "name"],
//     });

//     if (products.length === 0) {
//       return res
//         .status(404)
//         .send({ message: "No damaged products found in time range" });
//     }
//     res.status(200).send(products);
//   } catch (error) {
//     sendErrorResponse(error, res, 400);
//   }
// };

// const getContractRejectedByTime = async (req, res) => {
//   try {
//     const { start_time, end_time } = req.body;
//     const start = new Date(start_time);
//     const end = new Date(end_time);
//     end.setHours(23, 59, 59, 999); //start_date >= 2025-01-07 00:00:00 | end_date <= 2025-08-07 23:59:59.999

//     if (!start_time || !end_time) {
//       return res
//         .status(400)
//         .send({ message: "start_time and end_time are required" });
//     }
//     const products = await Contract_products.findAll({
//       include: [
//         {
//           model: Contract,
//           where: {
//             status: "rejected",
//             start_date: { [Op.gte]: start },
//             end_date: { [Op.lte]: end },
//           },
//         },
//       ],
//     });
//     if (products.length === 0) {
//       return res
//         .status(404)
//         .send({ message: "No products found with contracts in time range" });
//     }
//     res.status(200).send(products);
//   } catch (error) {
//     sendErrorResponse(error, res, 400);
//   }
// };

// const getHighOwnerByCategory = async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       return res.status(400).send({ message: "type is required" });
//     }
//     const owner = await Categories.findAll({
//       include: [
//         {
//           model: Owner,
//           through: {
//             model: Product,
//           },
//         },
//       ],
//     });

//     res.status(200).send(owner);
//   } catch (error) {
//     sendErrorResponse(error, res, 400);
//   }
// };

module.exports = {
  add,
  getAll,
  getById,
  remove,
  update,
};
