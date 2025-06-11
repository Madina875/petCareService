const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Appointment = require("./appointments.model");

const Client = sequelize.define(
  "client",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
    },
    last_name: {
      type: DataTypes.STRING(50),
    },
    phone_number: {
      type: DataTypes.STRING(50),
    },
    email: {
      type: DataTypes.STRING(50),
    },
    password: {
      type: DataTypes.STRING(250),
    },
    refresh_token: {
      type: DataTypes.STRING(250),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    activation_link: {
      type: DataTypes.STRING(250),
    },
    address: {
      type: DataTypes.STRING(50),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Client.hasMany(Appointment);
Appointment.belongsTo(Client);

module.exports = Client;
