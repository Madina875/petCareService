const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Client = require("./client.model");
const Appointment = require("./appointments.model");
// const Appointment = require("./appointments.model");

const Pet = sequelize.define(
  "pet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
    },
    breed: {
      type: DataTypes.STRING(50),
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
    },
    age: {
      type: DataTypes.INTEGER,
    },
    species: {
      type: DataTypes.STRING(50),
    },
    color: {
      type: DataTypes.STRING(50),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Client.hasMany(Pet);
Pet.belongsTo(Client);

Pet.hasMany(Appointment);
Appointment.belongsTo(Pet);

module.exports = Pet;
