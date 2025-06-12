const {
  add,
  getAll,
  getById,
  remove,
  update,
  getWhichHaveBookingWithService,
  getClientsWhichHaveBookingWithService,
  getClientsRejected,
  getPaymentsByClientFirstName,
  getTopEmployeesByService,
} = require("../controllers/appointment.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");

const router = require("express").Router();

router.post("/get_by_time", getWhichHaveBookingWithService);
router.post("/getc_by_time", getClientsWhichHaveBookingWithService);
router.post("/getrejected_btime", getClientsRejected);
router.post("/getby_first_name", getPaymentsByClientFirstName);

router.get("/top-employees", getTopEmployeesByService);

router.post("/", add);
router.get("/", getAll);
router.get("/:id", getById);
router.delete("/:id", remove);
router.patch(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  update
);

module.exports = router;
