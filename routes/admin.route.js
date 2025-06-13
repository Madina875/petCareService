const {
  add,
  getAll,
  getById,
  remove,
  update,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  registerAdmin,
  activateAdmin,
} = require("../controllers/admin.controller");
const adminRoleGuard = require("../guards/admin.role.guard");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminSelfGuard = require("../guards/admin.self.guard");

const router = require("express").Router();

router.post(
  "/login",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin", "admin"),
  loginAdmin
);
router.post(
  "/register",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard(),
  registerAdmin
);
router.post(
  "/logout",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin", "admin"),
  logoutAdmin
);
router.get(
  "/refresh",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin", "admin"),
  refreshAdminToken
);
router.get(
  "/activate/:link",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin", "admin"),
  activateAdmin
);

router.post(
  "/",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin"),
  add
);

router.get("/", adminJwtGuard, adminRoleGuard("superadmin"), getAll);
// router.get("/", adminJwtGuard, getAll);

router.get(
  "/:id",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin", "admin"),
  getById
);
// router.delete("/:id", remove);
router.delete("/:id", adminJwtGuard, adminRoleGuard("superadmin"), remove);

router.patch("/:id", update);

module.exports = router;
