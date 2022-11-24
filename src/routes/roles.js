const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const rolesController = require("../controllers/RolesController");

router.get("/:id", rolesController.getRoleById);
router.patch("/:id", auth, rolesController.updateRole);
router.post("/", auth, rolesController.createRole);
router.delete("/", auth, rolesController.deleteManyRoles);
router.get("/", rolesController.getListRolesByFilter);

module.exports = router;
