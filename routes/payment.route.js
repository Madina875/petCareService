const {
  add,
  getAll,
  getById,
  remove,
  update,
} = require("../controllers/payment.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");
const clientJwtGuard = require("../guards/client.jwt.guard");
const clientStatusGuard = require("../guards/client.status.guard");

const router = require("express").Router();

router.post(
  "/",
  adminJwtGuard,
  clientJwtGuard,
  clientStatusGuard,
  adminRoleGuard("superadmin", "admin"),
  add
);
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
  adminRoleGuard("admin", "superadmin"),
  clientJwtGuard,
  clientStatusGuard,
  remove
);
router.patch(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  clientJwtGuard,
  clientStatusGuard,
  update
);

module.exports = router;
