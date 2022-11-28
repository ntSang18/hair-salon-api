const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadStaff");
const staffsController = require("../controllers/StaffsController");
var uploadFile = upload.single("images");
const fileSizeLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    res.send(413);
  } else {
    next();
  }
};

router.get("/:id", auth, staffsController.getStaffById);
router.patch(
  "/:id",
  [uploadFile, fileSizeLimitErrorHandler, auth],
  staffsController.updateStaff
);
router.patch("/:id/password", auth, staffsController.changePassword);
router.delete("/:id", auth, staffsController.deleteStaff);
router.post("/login", staffsController.loginStaff);
router.post("/refresh-token", staffsController.refreshToken);
router.post(
  "/",
  [uploadFile, fileSizeLimitErrorHandler, auth],
  staffsController.createStaff
);
router.delete("/", auth, staffsController.deleteManyStaffs);
router.get("/", staffsController.getListStaffsByFilter);
router.get("/wages/filter", staffsController.getStaffsWithWage);

module.exports = router;
