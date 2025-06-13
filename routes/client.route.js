const {
  add,
  getAll,
  getById,
  remove,
  update,
  loginClient,
  logoutClient,
  refreshClientToken,
  registerClient,
  activateClient,
} = require("../controllers/client.controller");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminRoleGuard = require("../guards/admin.role.guard");
const clientJwtGuard = require("../guards/client.jwt.guard");
const clientSelfGuard = require("../guards/client.self.guard");
const clientStatusGuard = require("../guards/client.status.guard");

const router = require("express").Router();

// Auth routes should come first
router.post(
  "/register",
  clientJwtGuard,
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  registerClient
);
router.post(
  "/login",
  clientJwtGuard,
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  loginClient
);
router.get(
  "/logout",
  clientJwtGuard,
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  logoutClient
);
router.get(
  "/refresh",
  clientJwtGuard,
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  refreshClientToken
);
router.get(
  "/activate/:link",
  clientJwtGuard,
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  activateClient
);

// // Then regular CRUD routes
// router.post("/", add);
router.get("/", adminJwtGuard, adminRoleGuard("superadmin", "admin"), getAll);
router.get("/:id", clientJwtGuard, clientSelfGuard, clientStatusGuard, getById);
router.patch(
  "/:id",
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  update
);
router.delete(
  "/:id",
  clientJwtGuard,
  clientSelfGuard,
  adminJwtGuard,
  adminRoleGuard("superadmin", "admin"),
  remove
);

module.exports = router;
