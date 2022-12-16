const variable = require("../common/variable");
const advertisementsService = require("../services/AdvertisementsService");

class AdvertisementsController {
  async getAdvertisementById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const advertisement = await advertisementsService.getAdvertisementById(id, req.get("Host"));
      if (!advertisement) return res.status(variable.NoContent).send();
      res.send(advertisement);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getListAdvertisements(req, res) {
    try {
      const advertisements = await advertisementsService.getListAdvertisements(req.get("Host"));
      if (advertisements.length === 0) return res.status(variable.NoContent).send();
      res.send(advertisements);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message + err);
      throw err;
    }
  }

  async createAdvertisement(req, res) {
    try {
      const data = {
        title: req.body.title,
        detail: req.body.detail,
        imageName: req.file ? req.file.filename : "",
      };

      const result = await advertisementsService.createAdvertisement(data);
      res.send(result);
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(variable.BadRequest).send(`No available this ${err.meta.field_name}`);
      }
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }
}
module.exports = new AdvertisementsController();
