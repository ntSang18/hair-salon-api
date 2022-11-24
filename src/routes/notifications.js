const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const notificationsController = require("../controllers/NotificationsController");

router.get("/:id", notificationsController.getNotificationById);
router.post("/many", auth, notificationsController.createManyNotification);
router.post("/", auth, notificationsController.createNotification);
router.get("/", notificationsController.getListNotificationsByFilter);
router.patch("/:id", auth, notificationsController.updateNotification);

module.exports = router;
