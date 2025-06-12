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

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.post("/logout", logoutAdmin);
router.get("/refresh", refreshAdminToken);
router.get("/activate/:link", activateAdmin);

router.post(
  "/",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin"),
  add
);

router.post(
  "/",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("superadmin"),
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
router.delete("/", adminJwtGuard, adminRoleGuard("superadmin"), remove);

router.post("/:id", update);

module.exports = router;
