const router = require("express").Router();
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
  getEmployeeByService,
} = require("../controllers/appointment.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");

router.get(
  "/employee-by-service",
  adminJwtGuard,
  adminRoleGuard("superadmin"),
  getEmployeeByService
);
router.post(
  "/get_by_time",
  adminJwtGuard,
  adminRoleGuard("superadmin"),
  getWhichHaveBookingWithService
);
router.post(
  "/getc_by_time",
  adminJwtGuard,
  adminRoleGuard("superadmin"),
  getClientsWhichHaveBookingWithService
);
router.post(
  "/getrejected_btime",
  adminJwtGuard,
  adminRoleGuard("superadmin"),
  getClientsRejected
);
router.post(
  "/getby_first_name",
  adminJwtGuard,
  adminRoleGuard("superadmin"),
  getPaymentsByClientFirstName
);

router.post("/", adminJwtGuard, adminRoleGuard("superadmin", "admin"), add);
router.get("/", adminJwtGuard, adminRoleGuard("superadmin", "admin"), getAll);
router.get(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  getById
);
router.delete(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  remove
);

router.patch(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  update
);

module.exports = router;
