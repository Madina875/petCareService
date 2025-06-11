const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Appointment = require("./appointments.model");

const MedicalRecord = sequelize.define(
  "medical_record",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    visit_date: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    medications: {
      type: DataTypes.STRING(200),
    },
    damage_description: {
      type: DataTypes.STRING(200),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Appointment.hasOne(MedicalRecord);
MedicalRecord.belongsTo(Appointment);

module.exports = MedicalRecord;
