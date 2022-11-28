const bcrypt = require("bcrypt");
const variable = require("../common/variable");
const Joi = require("joi");
const customersService = require("../services/CustomersService");
const fs = require("fs");

class CustomersController {
  async loginCustomer(req, res) {
    try {
      let phone = req.body.phone;
      let password = req.body.password;
      let loginRespone = await customersService.loginCustomer(phone, password);
      if (loginRespone == variable.UnAuthorized)
        return res
          .status(variable.UnAuthorized)
          .send("Invalid phone or password.");
      res.send(loginRespone);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async getCustomerById(req, res) {
    const id = parseInt(req.params.id);
    const customerId = req.user.Id;
    const roleIdAuth = req.user.roleId;
    try {
      if (roleIdAuth != variable.AdminRoleId && customerId != id) {
        return res.status(403).send("No permission!");
      }
      const customer = await customersService.getCustomerById(
        id,
        req.get("Host")
      );
      if (!customer) return res.status(variable.NoContent).send();
      res.send(customer);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async getListCustomersByFilter(req, res) {
    try {
      const listCustomersByFilter =
        await customersService.getListCustomersByFilter(
          req.query,
          req.get("Host")
        );
      if (listCustomersByFilter.length === 0)
        return res.status(variable.NoContent).send();

      var obj = {
        customers: listCustomersByFilter,
      };
      let pageSize = req.query.pageSize;
      if (pageSize) {
        delete req.query.pageSize;
        delete req.query.page;
        const len = await customersService.getListCustomersByFilter(req.query);
        obj.totalPage =
          len.length % pageSize == 0
            ? len.length / pageSize
            : Math.floor(len.length / pageSize) + 1;
      }

      res.send(obj);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message + err);
    }
  }

  async createCustomer(req, res) {
    const { error } = validateCustomer(req.body);
    if (error) {
      if (req.file) deleteImgByPath(req.file.path);
      return res.status(variable.BadRequest).send(error.details[0].message);
    }
    const password = req.body.password
      ? req.body.password
      : variable.DefaultPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      const date = new Date();
      date.setHours(date.getHours() + 7);
      const data = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        password: await bcrypt.hash(password, salt),
        imageName: req.file ? req.file.filename : "",
        imagePath: req.file
          ? req.get("Host") + "/src/images/customers/" + req.file.filename
          : "",
        gender: req.body.gender ? req.body.gender : undefined,
        birthday: req.body.birthday ? new Date(req.body.birthday) : undefined,
        customerTypeId: req.body.customerTypeId
          ? parseInt(req.body.customerTypeId)
          : variable.DefaultCustomerTypeId,
        description: req.body.description,
        createdAt: date,
        updatedAt: date,
      };
      if (data.birthday == "Invalid Date") {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.BadRequest).send("Invalid birthday!");
      }
      const result = await customersService.registerCustomer(data);
      res.send(result);
    } catch (err) {
      if (req.file) deleteImgByPath(req.file.path);
      if (err.code === "P2002")
        return res
          .status(variable.BadRequest)
          .send("This phone number already exists!");
      if (err.code === "P2003") {
        return res
          .status(variable.BadRequest)
          .send(`No available this ${err.meta.field_name}`);
      }
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async registerCustomer(req, res) {
    const { error } = validateCustomer(req.body);
    if (error) {
      if (req.file) deleteImgByPath(req.file.path);
      return res.status(variable.BadRequest).send(error.details[0].message);
    }
    if (!req.body.password) {
      if (req.file) deleteImgByPath(req.file.path);
      return res.status(variable.BadRequest).send("No password provided!");
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const date = new Date();
      date.setHours(date.getHours() + 7);
      const data = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        password: await bcrypt.hash(req.body.password, salt),
        imageName: req.file ? req.file.filename : "",
        imagePath: req.file
          ? req.get("Host") + "/src/images/customers/" + req.file.filename
          : "",
        gender: req.body.gender ? req.body.gender : undefined,
        birthday: req.body.birthday ? new Date(req.body.birthday) : undefined,
        customerTypeId: req.body.customerTypeId
          ? parseInt(req.body.customerTypeId)
          : variable.DefaultCustomerTypeId,
        description: req.body.description,
        createdAt: date,
        updatedAt: date,
      };
      if (data.birthday == "Invalid Date") {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.BadRequest).send("Invalid birthday!");
      }
      const result = await customersService.registerCustomer(data);
      res.send(result);
    } catch (err) {
      if (req.file) deleteImgByPath(req.file.path);
      if (err.code === "P2002")
        return res
          .status(variable.BadRequest)
          .send("This phone number already exists!");
      if (err.code === "P2003") {
        return res
          .status(variable.BadRequest)
          .send(`No available this ${err.meta.field_name}`);
      }
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async updateCustomer(req, res) {
    try {
      let id = parseInt(req.params.id);
      let name = req.body.name;
      let address = req.body.address;
      let customerTypeId = req.body.customerTypeId
        ? parseInt(req.body.customerTypeId)
        : undefined;
      let birthday = req.body.birthday
        ? new Date(req.body.birthday)
        : undefined;
      let gender = req.body.gender;
      let point = req.body.point ? parseInt(req.body.point) : undefined;
      let isCustomerCreated = req.body.isCustomerCreated
        ? Boolean(req.body.isCustomerCreated)
        : undefined;
      let customerId = req.user.Id;
      let data = {};
      let date = new Date();
      let imageName = req.file ? req.file.filename : undefined;
      let imagePath = req.file
        ? req.get("Host") + "/src/images/customers/" + req.file.filename
        : undefined;
      let roleIdAuth = req.user.roleId;
      if (birthday == "Invalid Date") {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.BadRequest).send("Invalid birthday!");
      }
      if (customerTypeId != undefined && roleIdAuth != variable.AdminRoleId) {
        if (req.file) deleteImgByPath(req.file.path);
        return res
          .status(variable.Forbidden)
          .send(
            "No permission! Update customer type only works for admin account!"
          );
      }
      date.setHours(date.getHours() + 7);
      data = {
        name: name,
        address: address,
        customerTypeId: customerTypeId,
        updatedAt: date,
        birthday: birthday ? new Date(birthday) : undefined,
        gender: gender ? Boolean(gender) : undefined,
        point: point,
        imageName: imageName,
        imagePath: imagePath,
        isCustomerCreated: isCustomerCreated,
      };
      if (customerId != id && roleIdAuth != variable.AdminRoleId) {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.Forbidden).send("No permission!");
      }
      let update = await customersService.updateCustomer(
        id,
        data,
        req.get("Host")
      );
      if (!update) {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.BadRequest).send("Update failed!");
      }
      res.send(update);
    } catch (err) {
      if (req.file) deleteImgByPath(req.file.path);
      if (err.code === "P2003") {
        return res
          .status(variable.BadRequest)
          .send(`No available this ${err.meta.field_name}`);
      }
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async changePassword(req, res) {
    try {
      const salt = await bcrypt.genSalt(10);
      let id = parseInt(req.params.id);
      let roleIdAuth = req.user.roleId;
      let customerId = req.user.Id;
      let password = req.body.newPassword;
      let oldPassword = req.body.oldPassword;
      if (!password)
        return res
          .status(variable.BadRequest)
          .send("No new password provided!");
      if (!oldPassword && roleIdAuth != variable.AdminRoleId)
        return res
          .status(variable.BadRequest)
          .send("No old password provided!");
      if (customerId != id && roleIdAuth != variable.AdminRoleId)
        return res.status(variable.BadRequest).send("No permission!");
      let data = {
        oldPassword: oldPassword,
        password: password
          ? await bcrypt.hash(password, salt)
          : variable.DefaultPassword,
      };
      let changePassword = await customersService.changePassword(
        id,
        data,
        roleIdAuth
      );
      if (changePassword === variable.UnAuthorized)
        return res.status(variable.UnAuthorized).send("Invalid old password!");
      return res.send(changePassword);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async resetPassword(req, res) {
    try {
      const salt = await bcrypt.genSalt(10);
      let phone = req.body.phone;
      let password = req.body.newPassword;
      if (!password)
        return res
          .status(variable.BadRequest)
          .send("No new password provided!");
      let data = {
        phone: phone,
        password: password
          ? await bcrypt.hash(password, salt)
          : variable.DefaultPassword,
      };
      let resetPassword = await customersService.resetPassword(data);
      if (resetPassword === variable.NoContent)
        res.status(variable.NoContent).send();
      if (resetPassword === variable.NotFound)
        res.status(variable.NotFound).send("Invalid phone number!");
      return res.send(resetPassword);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async deleteCustomer(req, res) {
    try {
      let id = parseInt(req.params.id);
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res.status(variable.BadRequest).send("No permission!");
      let delCustomer = await customersService.deleteCustomer(id);
      res.send("Delete customer successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async deleteManyCustomers(req, res) {
    try {
      let idArray = req.body.idArray;
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for admin accounts");
      let delManyCustomers = await customersService.deleteManyCustomers(
        idArray
      );
      if (delManyCustomers == variable.BadRequest)
        return res.status(variable.BadRequest).send("No Customers is deleted");
      res.send("Delete customer(s) successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async refreshToken(req, res) {
    const refreshToken = req.body.refreshToken;
    try {
      let token = await customersService.refreshToken(refreshToken);
      if (token == variable.UnAuthorized)
        return res.status(variable.UnAuthorized).send("Invalid refresh token!");
      res.send(token);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }
}
module.exports = new CustomersController();

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string(),
    phone: Joi.string().min(10).max(11).required(),
    password: Joi.string().min(5).max(255),
    address: Joi.string().min(5).max(255),
    imagePath: Joi.string().allow(null).allow("").optional(),
    isCustomerCreated: Joi.boolean(),
    gender: Joi.boolean(),
    birthday: Joi.string().allow(null).allow("").optional(),
    customerTypeId: Joi.number(),
  });
  return schema.validate(customer);
}

async function deleteImgByPath(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {}
}
