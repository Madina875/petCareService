const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Appointment = require("./appointments.model");

const Payment = sequelize.define(
  "payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payment_method: {
      type: DataTypes.ENUM("creditcard", "debitcard", "cash"),
    },
    status: {
      type: DataTypes.ENUM("unpaid", "paid", "pending", "processing", "failed"),
    },
    payed_at: {
      type: DataTypes.DATE,
    },
    price_per_hour: {
      type: DataTypes.DECIMAL,
    },
    price_per_day: {
      type: DataTypes.DECIMAL,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Appointment.hasOne(Payment, {
  foreignKey: "appointmentId",
});

Payment.belongsTo(Appointment, {
  foreignKey: "appointmentId",
});

module.exports = Payment;
