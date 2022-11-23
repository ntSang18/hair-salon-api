const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const billsController = require("../controllers/BillsController");

router.get("/:id", auth, billsController.getBillById);
router.post("/booking/", auth, billsController.createBillWithBooking);
router.delete("/:id", auth, billsController.deleteBill);
router.post("/", auth, billsController.createBill);
router.get("/profit/get/",auth, billsController.getProfitEachMonth);
router.get("/", billsController.getListBillsByFilter);
router.get("/staffs/sort", billsController.getStaffsOrderByBills);

module.exports = router;
