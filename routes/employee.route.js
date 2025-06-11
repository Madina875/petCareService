const {
  add,
  getAll,
  getById,
  remove,
  update,
  loginEmployee,
  logoutEmployee,
  refreshEmployeeToken,
  registerEmployee,
  activateEmployee,
} = require("../controllers/employee.controller");
const employeeJwtGuard = require("../guards/employee.jwt.guard");
const employeeSelfGuard = require("../guards/employee.self.guard");
const employeeStatusGuard = require("../guards/employee.status.guard");

const router = require("express").Router();

router.post("/login", loginEmployee);
router.post("/register", registerEmployee);
router.post("/logout", logoutEmployee);
router.get("/refresh", refreshEmployeeToken);
router.get("/activate/:link", activateEmployee);

router.post("/", add);
router.get("/", getAll);
router.get(
  "/:id",
  employeeJwtGuard,
  employeeSelfGuard,
  employeeStatusGuard,
  getById
);
router.delete("/:id", remove);
router.post("/:id", update);

module.exports = router;
