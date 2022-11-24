const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const serviceTypesController = require("../controllers/ServiceTypesController");

router.get("/", serviceTypesController.getListserviceTypesByFilter);
router.get("/:id", serviceTypesController.getServiceTypeById);
router.post("/", auth, serviceTypesController.createServiceType);
router.patch("/:id", auth, serviceTypesController.updateServiceType);
router.delete("/", auth, serviceTypesController.deleteManyServiceTypes);

module.exports = router;
