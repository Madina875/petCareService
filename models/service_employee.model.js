const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Employee = require("./employee.model");
const Service = require("./service.model");

const Serviceemployee = sequelize.define(
  "service_employee",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Service.belongsToMany(Employee, { through: Serviceemployee });
Employee.belongsToMany(Service, { through: Serviceemployee });

Serviceemployee.belongsTo(Service);
Serviceemployee.belongsTo(Employee);

module.exports = Serviceemployee;
