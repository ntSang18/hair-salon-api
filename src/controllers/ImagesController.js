const path = require("path");
const variable = require("../common/variable");
class ImagesController {
  async getStaffImageByName(req, res, next) {
    var options = {
      root: path.join(__dirname, "../../src/images/staffs"),
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };
    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
      if (err) {
        res.status(variable.BadRequest).send("Get image false!");
      }
    });
  }
  async getCustomerImageByName(req, res, next) {
    var options = {
      root: path.join(__dirname, "../../src/images/customers"),
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };
    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
      if (err) {
        res.status(variable.BadRequest).send("Get image false!");
      }
    });
  }
  async getAdvertisementImageByName(req, res, next) {
    var options = {
      root: path.join(__dirname, "../../src/images/Advertisements"),
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };
    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
      if (err) {
        res.status(variable.BadRequest).send("Get image false!");
      }
    });
  }

  async getServiceImageByName(req, res, next) {
    var options = {
      root: path.join(__dirname, "../../src/images/services"),
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };
    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
      if (err) {
        res.status(variable.BadRequest).send("Get image false!");
      }
    });
  }
}
module.exports = new ImagesController();
