const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Client = require("./client.model");
const Appointment = require("./appointments.model");

const Reviews = sequelize.define(
  "reviews",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rating: {
      type: DataTypes.INTEGER,
    },
    comment: {
      type: DataTypes.STRING(100),
    },
    review_date: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Client.hasMany(Reviews);
Appointment.hasMany(Reviews);

Reviews.belongsTo(Client);
Reviews.belongsTo(Appointment);

module.exports = Reviews;
