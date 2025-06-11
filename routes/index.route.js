const adminRouter = require("../routes/admin.route");
const clientRouter = require("../routes/client.route");
const employeeRouter = require("../routes/employee.route");
const paymentRouter = require("../routes/payment.route");
const reviewsRouter = require("../routes/reviews.route");
const statisticsRouter = require("../routes/statistics.route");
const petRouter = require("../routes/pet.route");
const appointmentRouter = require("../routes/appointments.model.route");
const service_employeeRouter = require("../routes/service_employee.route");
const service_categoryRouter = require("../routes/service_category.route");
const medicalRecordRouter = require("../routes/medical_record.route");
const serviceRouter = require("../routes/service.route");

const router = require("express").Router();

router.use("/client", clientRouter);
router.use("/employee", employeeRouter);
router.use("/pet", petRouter);
router.use("/medicalr", medicalRecordRouter);
router.use("/appointment", appointmentRouter);
router.use("/scategory", service_categoryRouter);
router.use("/payment", paymentRouter);
router.use("/semployee", service_employeeRouter);
router.use("/reviews", reviewsRouter);
router.use("/statistics", statisticsRouter);
router.use("/admin", adminRouter);
router.use("/service", serviceRouter);

module.exports = router;
