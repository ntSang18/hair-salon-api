const bcrypt = require("bcrypt");
const variable = require("../common/variable");
const Joi = require("joi");
const rolesService = require("../services/RolesService");
class rolesController {
  async getRoleById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const role = await rolesService.getRoleById(id);
      if (!role) return res.status(variable.NoContent).send();
      res.send(role);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async getListRolesByFilter(req, res) {
    try {
      const listRoles = await rolesService.getListRolesByFilter(req.query);
      if (!listRoles) return res.status(variable.NoContent).send();
      res.send(listRoles);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async createRole(req, res) {
    const roleIdAuth = req.user.roleId;
    const { error } = validateRole(req.body);
    if (error)
      return res.status(variable.BadRequest).send(error.details[0].message);
    if (roleIdAuth != variable.AdminRoleId) {
      return res.status(403).send("No permission!");
    }
    try {
      const data = {
        name: req.body.name,
        isDeleted: req.body.isDeleted ? req.body.isDeleted : false,
      };
      const result = await rolesService.createRole(data);
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  async updateRole(req, res) {
    try {
      const id = parseInt(req.params.id);
      const roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res.status(variable.Forbidden).send("No permission!");
      let data = {
        name: req.body.name,
      };
      let update = await rolesService.updateRole(id, data);
      if (!update)
        return res.status(variable.BadRequest).send("Update role failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async deleteManyRoles(req, res) {
    try {
      let idArray = req.body.idArray;
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for admin accounts");
      let delManyRoles = await rolesService.deleteManyRoles(idArray);
      if (delManyRoles == variable.NoContent)
        return res.status(variable.NoContent).send();
      res.send("Delete role(s) successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }
}
module.exports = new rolesController();

function validateRole(role) {
  const schema = Joi.object({
    name: Joi.string(),
    isDeleted: Joi.boolean().allow(null),
  });
  return schema.validate(role);
}
