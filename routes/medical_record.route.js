const {
  add,
  getAll,
  getById,
  remove,
  update,
} = require("../controllers/medical_record.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");
const adminSelfGuard = require("../guards/admin.self.guard");
const clientJwtGuard = require("../guards/client.jwt.guard");
const clientStatusGuard = require("../guards/client.status.guard");

const router = require("express").Router();

router.post("/", adminJwtGuard, adminRoleGuard("admin", "superadmin"), add);
router.get(
  "/",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  clientJwtGuard,
  clientStatusGuard,
  getAll
);
router.get(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  clientJwtGuard,
  clientStatusGuard,
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
  adminSelfGuard,
  adminRoleGuard("admin", "superadmin"),
  update
);

module.exports = router;
