const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Admin = sequelize.define(
  "admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
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
    role: {
      type: DataTypes.ENUM("superAdmin", "admin"),
      defaultValue: "admin",
    },
    is_creator: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    activation_link: {
      type: DataTypes.STRING(100),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Admin;
