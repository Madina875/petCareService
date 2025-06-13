const {
  add,
  getAll,
  getById,
  remove,
  update,
} = require("../controllers/service.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");

const router = require("express").Router();

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
