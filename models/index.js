// const Service = require("./service.model");
// const Statistics = require("./statistics.model");
// const Employee = require("./employee.model");
// const ServiceEmployee = require("./service_employee.model");
// const Appointment = require("./appointments.model");
// const Client = require("./client.model");
// const Pet = require("./pet.model");
// const Review = require("./reviews.model");

// // ✅ Service ↔ Statistics (One-to-One)
// Service.hasOne(Statistics, {
//   foreignKey: "serviceId",
//   as: "statistics",
// });
// Statistics.belongsTo(Service, {
//   foreignKey: "serviceId",
//   as: "service",
// });

// // ✅ Service ↔ Employee (Many-to-Many)
// Service.belongsToMany(Employee, {
//   through: ServiceEmployee,
//   as: "employees",
//   foreignKey: "serviceId",
// });
// Employee.belongsToMany(Service, {
//   through: ServiceEmployee,
//   as: "services",
//   foreignKey: "employeeId",
// });

// // ✅ Appointment ↔ Client (Many-to-One)
// Appointment.belongsTo(Client, {
//   foreignKey: "clientId",
//   as: "client",
// });
// Client.hasMany(Appointment, {
//   foreignKey: "clientId",
//   as: "clientAppointments", // renamed to avoid conflict
// });

// // ✅ Appointment ↔ Service (Many-to-One)
// Appointment.belongsTo(Service, {
//   foreignKey: "serviceId",
//   as: "service",
// });
// Service.hasMany(Appointment, {
//   foreignKey: "serviceId",
//   as: "appointments",
// });

// // ✅ Review ↔ Client (Many-to-One)
// Review.belongsTo(Client, {
//   foreignKey: "clientId",
//   as: "reviewClient", // renamed to avoid conflict
// });
// Client.hasMany(Review, {
//   foreignKey: "clientId",
//   as: "clientReviews",
// });
// Review.belongsTo(Appointment, {
//   foreignKey: "appointmentId",
//   as: "reviewedAppointment",
// });
// Appointment.hasMany(Review, {
//   foreignKey: "appointmentId",
//   as: "appointmentReviews",
// });

// // ✅ Client ↔ Pet (One-to-Many)
// Client.hasMany(Pet, {
//   foreignKey: "clientId",
//   as: "pets",
// });
// Pet.belongsTo(Client, {
//   foreignKey: "clientId",
//   as: "owner",
// });

// // ✅ Pet ↔ Appointment (One-to-Many)
// Pet.hasMany(Appointment, {
//   foreignKey: "petId",
//   as: "petAppointments", // renamed to avoid conflict
// });
// Appointment.belongsTo(Pet, {
//   foreignKey: "petId",
//   as: "pet",
// });
