const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const customerTypesController = require("../controllers/CustomerTypesController");

router.get("/:id", auth, customerTypesController.getCustomerTypeById);
router.patch("/:id", auth, customerTypesController.updateCustomerType);
router.post("/", auth, customerTypesController.createCustomerType);
router.delete("/", auth, customerTypesController.deleteManyCustomerTypes);
router.get("/", customerTypesController.getListCustomerTypesByFilter);

module.exports = router;
