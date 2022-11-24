const express = require("express");
const router = express.Router();
const imagesController = require("../controllers/ImagesController");
router.get("/staffs/:name", imagesController.getStaffImageByName);
router.get("/customers/:name", imagesController.getCustomerImageByName);
router.get(
  "/advertisements/:name",
  imagesController.getAdvertisementImageByName
);
router.get(
  "/services/:name",
  imagesController.getServiceImageByName
);

module.exports = router;
