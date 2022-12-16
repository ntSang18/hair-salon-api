const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadAdvertisement");
const advertisementsController = require("../controllers/AdvertisementsController");
var uploadFile = upload.single("img");
const fileSizeLimitErrorHandler = (err, req, res, next) => {
    if (err) {
        res.status(variable.BadRequest).send(err.message);
    } else {
        next();
    }
};

router.get("/:id", advertisementsController.getAdvertisementById);
router.get("/", advertisementsController.getListAdvertisements);
router.post("/", [uploadFile, fileSizeLimitErrorHandler], advertisementsController.createAdvertisement
);
module.exports = router;
