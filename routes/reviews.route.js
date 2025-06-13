const {
  add,
  getAll,
  getById,
  remove,
  update,
} = require("../controllers/reviews.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");
const clientJwtGuard = require("../guards/client.jwt.guard");
const clientStatusGuard = require("../guards/client.status.guard");

const router = require("express").Router();

router.post(
  "/",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  clientJwtGuard,
  clientStatusGuard,
  add
);
router.get("/", getAll);

router.get(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  getById
);
router.delete(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  remove
);
router.patch(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("admin", "superadmin"),
  update
);

module.exports = router;
