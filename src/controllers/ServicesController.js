const variable = require("../common/variable");
const servicesService = require("../services/ServicesService");
class servicesController {
  async getListServicesByFilter(req, res) {
    try {
      const services = await servicesService.getListServices(req.query, req.get("Host"));
      if (!services) return res.status(variable.NoContent).send();
      res.send(services);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getServiceById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const service = await servicesService.getServiceById(id, req.get("Host"));
      if (!service) return res.status(variable.NoContent).send();
      res.send(service);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async createService(req, res) {
    try {
      const date = new Date();
      date.setHours(date.getHours() + 7);
      const data = {
        name: req.body.name,
        price: parseInt(req.body.price),
        imageName: req.file ? req.file.filename : "",
        imagePath: req.file ? req.get("Host") + "/src/images/services/" + req.file.filename : "",
        serviceTypeId: parseInt(req.body.serviceTypeId),
        description: req.body.description ? req.body.description : "",
        createdAt: date,
        updatedAt: date,
      };
      const result = await servicesService.createService(data);
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
      throw err;
    }
  }

  async updateService(req, res) {
    try {
      const id = parseInt(req.params.id);
      const date = new Date();
      date.setHours(date.getHours() + 7);
      let data = {
        name: req.body.name,
        price: parseInt(req.body.price),
        imageName: req.file ? req.file.filename : "",
        imagePath: req.file ? req.get("Host") + "/src/images/services/" + req.file.filename : "",
        serviceTypeId: req.body.serviceTypeId,
        description: req.body.description,
        createdAt: date,
        updatedAt: date,
      };
      let update = await servicesService.updateService(id, data);
      if (!update) return res.status(variable.BadRequest).send("Update service failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async deleteManyServices(req, res) {
    try {
      let idArray = req.body.idArray;
      let deleteManyServices = await servicesService.deleteManyServices(idArray);
      if (deleteManyServices == variable.NoContent) return res.status(variable.NoContent).send();
      res.send("Delete service successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }
}
module.exports = new servicesController();
