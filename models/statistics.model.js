const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Service = require("./service.model");

const Statistics = sequelize.define(
  "statistics",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    views_count: {
      type: DataTypes.INTEGER,
    },
    average_rating: {
      type: DataTypes.DECIMAL(15, 2),
    },
    last_updated: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Service.hasOne(Statistics, {
  foreignKey: "serviceId",
});

Statistics.belongsTo(Service, {
  foreignKey: "serviceId",
});

module.exports = Statistics;
