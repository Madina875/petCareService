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
const clientJwtGuard = require("../guards/client.jwt.guard");
const clientSelfGuard = require("../guards/client.self.guard");
const clientStatusGuard = require("../guards/client.status.guard");

const router = require("express").Router();

// Auth routes should come first
router.post("/register", registerClient);
router.post("/login", loginClient);
router.get("/logout", logoutClient);
router.get("/refresh", refreshClientToken);
router.get("/activate/:link", activateClient);

// Then regular CRUD routes
router.post("/", add);
router.get("/", getAll);
router.get("/:id", clientJwtGuard, clientSelfGuard, clientStatusGuard, getById);
router.post("/:id", update);
router.delete("/:id", remove);

module.exports = router;
