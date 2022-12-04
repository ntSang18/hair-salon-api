const bcrypt = require("bcrypt");
const variable = require("../common/variable");
const Joi = require("joi");
const departmentsService = require("../services/DepartmentsService");
class DepartmentsController {
  async getdepartmentById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const department = await departmentsService.getdepartmentById(id);
      if (!department) return res.status(variable.NoContent).send();
      res.send(department);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getListDepartmentsByFilter(req, res) {
    try {
      const listDepartments =
        await departmentsService.getListDepartmentsByFilter(req.query);
      if (!listDepartments) return res.status(variable.NoContent).send();
      res.send(listDepartments);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async createDepartment(req, res) {
    const roleIdAuth = req.user.roleId;
    const { error } = validateDepartment(req.body);
    if (error)
      return res.status(variable.BadRequest).send(error.details[0].message);
    if (roleIdAuth != variable.AdminRoleId) {
      return res.status(403).send("No permission!");
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const data = {
        name: req.body.name,
        isDeleted: req.body.isDeleted ? req.body.isDeleted : false,
        managerId: req.body.managerId ? req.body.managerId : null,
      };
      const result = await departmentsService.createDepartment(data);
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
      throw err;
    }
  }

  async updateDepartment(req, res) {
    try {
      const id = parseInt(req.params.id);
      const roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res.status(variable.Forbidden).send("No permission!");
      let data = {
        name: req.body.name,
        isDeleted: req.body.isDeleted,
        managerId: req.body.managerId,
      };
      let update = await departmentsService.updateDepartment(id, data);
      if (!update)
        return res.status(variable.BadRequest).send("Update failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async deleteManyDepartments(req, res) {
    try {
      let idArray = req.body.idArray;
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for admin accounts");
      let delManyDepartments = await departmentsService.deleteManyDepartments(
        idArray
      );
      if (delManyDepartments == variable.NoContent)
        return res.status(variable.NoContent).send();
      res.send("Delete Departments successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }
}
module.exports = new DepartmentsController();

function validateDepartment(department) {
  const schema = Joi.object({
    name: Joi.string(),
    isDeleted: Joi.boolean().allow(null),
    managerId: Joi.number().allow(null),
  });
  return schema.validate(department);
}
