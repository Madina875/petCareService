const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Service = require("./service.model");
const Employee = require("./employee.model");

const Appointment = sequelize.define(
  "appointment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["scheduled", "completed", "cancelled", "in_progress"],
    },
    overall_amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    end_date: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Service.hasMany(Appointment);
Appointment.belongsTo(Service);

Employee.hasMany(Appointment);
Appointment.belongsTo(Employee);

// Pet.hasOne(Appointment, {
//   foreignKey: "petId",
//   as: "appointment",
// });
// Appointment.belongsTo(Pet, {
//   foreignKey: "petId",
//   as: "pet",
// });

// Appointment.hasMany(Review, { foreignKey: "appointmentId", as: "reviews" });
// Review.belongsTo(Appointment, {
//   foreignKey: "appointmentId",
//   as: "appointment",
// });

// Appointment.belongsTo(Client);
// Appointment.belongsTo(Service);

module.exports = Appointment;
