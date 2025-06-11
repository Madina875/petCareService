const {
  add,
  getAll,
  getById,
  remove,
  update,
} = require("../controllers/statistics.controller");

const router = require("express").Router();

router.post("/", add);
router.get("/", getAll);
router.get("/:id", getById);
router.delete("/:id", remove);
router.post("/update", update);

module.exports = router;
