const {
  add,
  getAll,
  getById,
  remove,
  update,
} = require("../controllers/service_category.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");
const clientJwtGuard = require("../guards/client.jwt.guard");
const employeeJwtGuard = require("../guards/employee.jwt.guard");

const router = require("express").Router();

router.post("/", adminJwtGuard, adminRoleGuard("admin", "superadmin"), add);
router.get(
  "/",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  clientJwtGuard,
  employeeJwtGuard,
  getAll
);
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
