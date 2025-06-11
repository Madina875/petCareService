const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Service = require("./service.model");

const ServiceCategory = sequelize.define(
  "service_category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
    },
    description: {
      type: DataTypes.STRING(200),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
ServiceCategory.hasMany(Service, {
  foreignKey: "service_categoryId", // 👈 this is the name of the foreign key column in Service
  as: "services", // optional alias
});

Service.belongsTo(ServiceCategory, {
  foreignKey: "service_categoryId", // 👈 this is the name of the foreign key column in Service
  as: "category", // optional alias for usage like `service.category`
});

module.exports = ServiceCategory;
