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
const adminCreatorGuard = require("../guards/admin.creator.guard");
const adminJwtGuard = require("../guards/admin.jwt.guard");
const adminSelfGuard = require("../guards/admin.self.guard");

const router = require("express").Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.post("/logout", logoutAdmin);
router.get("/refresh", refreshAdminToken);
router.get("/activate/:link", activateAdmin);

router.post("/", add);
router.get("/", getAll);
router.get("/:id", adminJwtGuard, adminSelfGuard, adminCreatorGuard, getById);
router.delete("/:id", remove);
router.post("/:id", update);

module.exports = router;
