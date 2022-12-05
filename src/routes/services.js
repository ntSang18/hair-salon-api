const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadService");
const servicesController = require("../controllers/ServicesController");
var uploadFile = upload.single("images");
const fileSizeLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    res.status(variable.BadRequest).send(err.message);
  } else {
    next();
  }
};

router.post(
  "/",
  [uploadFile, fileSizeLimitErrorHandler],
  auth,
  servicesController.createService
);

router.patch(
  "/:id",
  [uploadFile, fileSizeLimitErrorHandler],
  auth,
  servicesController.updateService
);
router.get("/", servicesController.getListServicesByFilter);
router.get("/:id", servicesController.getServiceById);
router.post("/", auth, servicesController.createService);
router.delete("/", auth, servicesController.deleteManyServices);

module.exports = router;
