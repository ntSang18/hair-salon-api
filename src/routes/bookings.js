const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const bookingsController = require("../controllers/BookingsController");

router.get("/:id", auth, bookingsController.getBookingById);
router.get("/:id/bill", auth, bookingsController.getBill);
router.patch("/:id", auth, bookingsController.updateBooking);
router.delete("/:id", auth, bookingsController.deleteBooking);
router.delete("/:id/softdelete", auth, bookingsController.softDeleteBooking);
router.post("/", auth, bookingsController.createBooking);
router.get("/", bookingsController.getListBookingsByFilter);
router.patch("/", auth, bookingsController.updateManyStatuesBooking);
router.delete("/", auth, bookingsController.deleteManyBookings);

module.exports = router;
