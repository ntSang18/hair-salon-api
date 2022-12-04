const variable = require("../common/variable");
const Joi = require("joi");
const serviceTypesService = require("../services/ServiceTypesService");
class serviceTypesController {
  async getListserviceTypesByFilter(req, res) {
    try {
      const serviceTypes = await serviceTypesService.getListServiceTypes(req.query);
      if (!serviceTypes) return res.status(variable.NoContent).send();
      res.send(serviceTypes);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async getServiceTypeById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const serviceType = await serviceTypesService.getServiceTypeById(id);
      if (!serviceType) return res.status(variable.NoContent).send();
      res.send(serviceType);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async createServiceType(req, res) {
    const { error } = validateServiceType(req.body);
    if (error) return res.status(variable.BadRequest).send(error.details[0].message);
    try {
      const data = {
        name: req.body.name,
      };
      const result = await serviceTypesService.createServiceType(data);
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  async updateServiceType(req, res) {
    try {
      const id = parseInt(req.params.id);
      let data = {
        name: req.body.name,
      };
      let update = await serviceTypesService.updateServiceType(id, data);
      if (!update) return res.status(variable.BadRequest).send("Update service type failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async deleteManyServiceTypes(req, res) {
    try {
      let idArray = req.body.idArray;
      let deleteManyServiceTypes = await serviceTypesService.deleteManyServiceTypes(idArray);
      if (deleteManyServiceTypes == variable.NoContent) return res.status(variable.NoContent).send();
      res.send("Delete service Types successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }
}
function validateServiceType(serviceType) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  return schema.validate(serviceType);
}
module.exports = new serviceTypesController();
