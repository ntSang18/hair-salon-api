const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadCustomer");
const customersController = require("../controllers/CustomersController");
var uploadFile = upload.single("images");
const fileSizeLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    res.send(413);
  } else {
    next();
  }
};

router.get("/:id", auth, customersController.getCustomerById);
router.patch(
  "/:id",
  [uploadFile, fileSizeLimitErrorHandler, auth],
  customersController.updateCustomer
);
router.patch("/:id/password", auth, customersController.changePassword);
router.patch("/password/reset", customersController.resetPassword);
router.delete("/:id", auth, customersController.deleteCustomer);
router.post("/login", customersController.loginCustomer);
router.post("/refresh-token", customersController.refreshToken);
router.post(
  "/",
  [uploadFile, fileSizeLimitErrorHandler],
  customersController.createCustomer
);
router.post(
  "/register",
  [uploadFile, fileSizeLimitErrorHandler],
  customersController.registerCustomer
);
router.delete("/", auth, customersController.deleteManyCustomers);
router.get("/", customersController.getListCustomersByFilter);

module.exports = router;
