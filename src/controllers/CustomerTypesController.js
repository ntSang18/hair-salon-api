const bcrypt = require("bcrypt");
const variable = require("../common/variable");
const Joi = require("joi");
const customerTypesService = require("../services/CustomerTypesService");
class customerTypesController {
  async getCustomerTypeById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const customerType = await customerTypesService.getCustomerTypeById(id);
      if (!customerType) return res.status(variable.NoContent).send();
      res.send(customerType);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async getListCustomerTypesByFilter(req, res) {
    try {
      const listCustomerTypes =
        await customerTypesService.getListCustomerTypesByFilter(req.query);
      if (!listCustomerTypes) return res.status(variable.NoContent).send();
      res.send(listCustomerTypes);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async createCustomerType(req, res) {
    const roleIdAuth = req.user.roleId;
    const { error } = validateCustomerType(req.body);
    if (error)
      return res.status(variable.BadRequest).send(error.details[0].message);
    if (roleIdAuth != variable.AdminRoleId) {
      return res.status(403).send("No permission!");
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const data = {
        name: req.body.name,
        percent: req.body.percent ? parseInt(req.body.percent) : null,
        description: req.body.description,
        isDeleted: req.body.isDeleted ? req.body.isDeleted : false,
      };
      const result = await customerTypesService.createCustomerType(data);
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  async updateCustomerType(req, res) {
    try {
      const id = parseInt(req.params.id);
      const roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res.status(variable.Forbidden).send("No permission!");
      let data = {
        name: req.body.name,
        percent: req.body.percent,
        description: req.body.description,
      };
      let update = await customerTypesService.updateCustomerType(id, data);
      if (!update)
        return res.status(variable.BadRequest).send("Update failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async deleteManyCustomerTypes(req, res) {
    try {
      let idArray = req.body.idArray;
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for admin accounts");
      let delManycustomerTypes =
        await customerTypesService.deleteManyCustomerTypes(idArray);
      if (delManycustomerTypes == variable.NoContent)
        return res.status(variable.NoContent).send();
      res.send("Delete customerTypes successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }
}
module.exports = new customerTypesController();

function validateCustomerType(customerType) {
  const schema = Joi.object({
    name: Joi.string(),
    isDeleted: Joi.boolean().allow(null),
    percent: Joi.number().allow(null),
    description: Joi.string().allow(null).allow(""),
  });
  return schema.validate(customerType);
}
