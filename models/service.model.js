const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Service = sequelize.define(
  "service",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    description: {
      type: DataTypes.STRING(200),
    },
    service_categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "service_category", // or the correct table name
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Service;
