const { sendErrorResponse } = require("../helpers/send_error_response");
const Statistics = require("../models/statistics.model");
const Reviews = require("../models/reviews.model");
const Service = require("../models/service.model");
const Appointment = require("../models/appointments.model");
const Serviceemployee = require("../models/service_employee.model");
const { Sequelize } = require("sequelize");

const add = async (req, res) => {
  try {
    const { serviceId, last_updated } = req.body;

    const newStatistics = await Statistics.create({
      serviceId,
      last_updated,
    });

    const viewsCount = await Serviceemployee.count({
      where: { serviceId: serviceId },
    });

    const appointments = await Appointment.findAll({
      where: { serviceId },
      attributes: ["id"],
      raw: true,
    });

    const appointmentIds = appointments.map((a) => a.id);

    const ratingCounts = await Reviews.findAll({
      attributes: [
        "rating",
        [Sequelize.fn("COUNT", Sequelize.col("rating")), "count"],
      ],
      where: {
        appointmentId: appointmentIds.length ? appointmentIds : null,
      },
      group: ["rating"],
      raw: true,
    });

    const totalRatings = ratingCounts.reduce(
      (acc, r) => acc + Number(r.count),
      0
    );
    const ratingSum = ratingCounts.reduce(
      (acc, r) => acc + r.rating * Number(r.count),
      0
    );
    const averageRating = totalRatings ? ratingSum / totalRatings : 0;

    const updated = await Statistics.update(
      {
        views_count: viewsCount,
        average_rating: Number(averageRating.toFixed(2)),
        last_updated: new Date(),
      },
      {
        where: { serviceId },
        returning: true,
      }
    );

    res.status(201).send({ message: "New statistics created!", updated });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

// const add = async (req, res) => {
//   try {
//     const { total_views, average_rating, last_updated, serviceId } = req.body;

//     const newStatistics = await Statistics.create({
//       total_views,
//       average_rating,
//       last_updated,
//       serviceId,
//     });
//     const viewsCount = await Serviceemployee.count({
//       where: { serviceId: serviceId },
//     });
//     const appointments = await Appointment.findAll({
//       where: { serviceId: serviceId },
//       attributes: ["id"],
//       raw: true,
//     });
//     const appointmentIds = appointments.map((a) => a.id);

//     const ratingCounts = await Reviews.findAll({
//       attributes: [
//         "rating",
//         [Sequelize.fn("COUNT", Sequelize.col("rating")), "count"],
//       ],
//       where: {
//         appointmentId: appointmentIds.length ? appointmentIds : null,
//       },
//       group: ["rating"],
//       raw: true,
//     });

//     /*[
//     { rating: 3, count: 1 },
//     { rating: 4, count: 2 },
//     { rating: 5, count: 1 }
//     ]*/
//     const ratingMap = {};
//     const ratingArray = [];
//     ratingCounts.forEach(({ rating, count }) => {
//       ratingMap[rating] = count;
//       ratingCounts.push(ratingMap[rating]);
//       ratingArray.push(rating);
//     });
//     // console.log(ratingMap); // Output: { '3': 1, '4': 2, '5': 1 }
//     // console.log(ratingArray); //keys
//     const count = ratingCounts.reduce((acc, value) => acc + value, 0);
//     const sum = ratingArray.reduce((acc, value) => acc + value, 0);
//     const ratingAvg = sum / count;

//     await Statistics.update(
//       {
//         total_views: viewsCount,
//         average_rating: ratingAvg,
//         ratings_count: count,
//       },
//       { where: { id: serviceId } }
//     );

//     res.status(201).send({ message: "New statistics created!", newStatistics });
//   } catch (error) {
//     sendErrorResponse(error, res, 400);
//   }
// };

const getAll = async (req, res) => {
  try {
    const statisticss = await Statistics.findAll({
      include: [
        {
          model: Service,
          attributes: ["id", "is_active", "description", "price"],
        },
      ],
    });
    res.status(200).send(statisticss);
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
    const statisticss = await Statistics.findByPk(id);
    res.status(200).send(statisticss);
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
    const statistics = await Statistics.destroy({ where: { id } });
    res.status(200).send({ message: "deleted" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const { serviceId } = req.body;

    // Check if a statistics record exists for this service
    const existingStatistics = await Statistics.findOne({
      where: { serviceId },
    });

    if (!existingStatistics) {
      return res
        .status(404)
        .json({ message: "Statistics not found for this service." });
    }

    // Recalculate views
    const viewsCount = await Serviceemployee.count({
      where: { serviceId },
    });

    // Get appointments for the service
    const appointments = await Appointment.findAll({
      where: { serviceId },
      attributes: ["id"],
      raw: true,
    });
    const appointmentIds = appointments.map((a) => a.id);

    // Get ratings for those appointments
    const ratingCounts = await Reviews.findAll({
      attributes: [
        "rating",
        [Sequelize.fn("COUNT", Sequelize.col("rating")), "count"],
      ],
      where: {
        appointmentId: appointmentIds.length ? appointmentIds : null,
      },
      group: ["rating"],
      raw: true,
    });

    // Calculate weighted average rating
    const totalRatings = ratingCounts.reduce(
      (acc, r) => acc + Number(r.count),
      0
    );
    const ratingSum = ratingCounts.reduce(
      (acc, r) => acc + r.rating * Number(r.count),
      0
    );
    const averageRating = totalRatings
      ? (ratingSum / totalRatings).toFixed(2)
      : 0;

    // Perform the update
    await Statistics.update(
      {
        views_count: viewsCount,
        average_rating: averageRating,
        last_updated: new Date(),
      },
      {
        where: { serviceId },
        returning: true,
      }
    );

    res.status(200).json({ message: "Statistics updated successfully." });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

// const update = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id)
//       return res.status(404).send({ message: "Statistics ID not found" });

//     const stats = await Statistics.findByPk(id);
//     if (!stats)
//       return res.status(404).send({ message: "Statistics not found" });

//     const { serviceId } = stats;

//     const viewsCount = await ServiceEmployee.count({
//       where: { serviceId },
//     });

//     const appointments = await Appointment.findAll({
//       where: { serviceId },
//       attributes: ["id"],
//       raw: true,
//     });
//     const appointmentIds = appointments.map((a) => a.id);

//     const ratingCounts = await Reviews.findAll({
//       attributes: [
//         "rating",
//         [Sequelize.fn("COUNT", Sequelize.col("rating")), "count"],
//       ],
//       where: {
//         appointmentId: appointmentIds.length ? appointmentIds : null,
//       },
//       group: ["rating"],
//       raw: true,
//     });

//     const ratingMap = {};
//     const ratingArray = [];
//     ratingCounts.forEach(({ rating, count }) => {
//       ratingMap[rating] = count;
//       ratingArray.push(rating);
//     });
//     const count = Object.values(ratingMap).reduce(
//       (acc, value) => acc + value,
//       0
//     );
//     const sum = ratingArray.reduce((acc, value) => acc + value, 0);
//     const ratingAvg = sum / count || 0;

//     await Statistics.update(
//       {
//         total_views: viewsCount,
//         average_rating: ratingAvg,
//         ratings_count: count,
//       },
//       { where: { id } }
//     );

//     res.status(200).send({
//       message: "Statistics updated successfully!",
//     });
//   } catch (error) {
//     sendErrorResponse(error, res, 400);
//   }
// };

module.exports = { add, getAll, getById, remove, update };
