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

const router = require("express").Router();

router.post("/", add);
router.get("/", getAll);
router.get("/:id", getById);
router.delete("/:id", remove);
router.post(
  "/:id",
  adminJwtGuard,
  adminSelfGuard,
  adminRoleGuard("medical"),
  update
);

module.exports = router;
