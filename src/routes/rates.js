const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const ratesController = require("../controllers/RatesController");

router.get("/:id", ratesController.getRateById);
router.post("/", auth, ratesController.createRate);
router.get("/", ratesController.getListRatesByFilter);
router.get("/staffs/sort", ratesController.getStaffsWithRate);

module.exports = router;
