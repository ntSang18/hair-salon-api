const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const departmentsController = require("../controllers/DepartmentsController");

router.get("/:id", auth, departmentsController.getdepartmentById);
router.patch(
  "/deleteDepartments",
  auth,
  departmentsController.deleteManyDepartments
);
router.patch("/:id", auth, departmentsController.updateDepartment);
router.post("/", auth, departmentsController.createDepartment);
router.get("/", departmentsController.getListDepartmentsByFilter);

module.exports = router;
