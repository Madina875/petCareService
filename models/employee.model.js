const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Employee = sequelize.define(
  "employee",
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
      type: DataTypes.STRING(30),
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
      defaultValue: true,
    },
    activation_link: {
      type: DataTypes.STRING(250),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// Employee.belongsToMany(Service, { through: ServiceEmployee });
// Service.belongsToMany(Employee, { through: ServiceEmployee });

// Appointment.belongsTo(Employee);
// Appointment.belongsTo(Service);

// Service.hasMany(Appointment);
// Employee.hasMany(Appointment);


module.exports = Employee;
