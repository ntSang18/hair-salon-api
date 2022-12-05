const bcrypt = require("bcrypt");
const variable = require("../common/variable");
const Joi = require("joi");
const staffsService = require("../services/StaffsService");
const fs = require("fs");
require("dotenv").config();
class StaffsController {
  async loginStaff(req, res) {
    try {
      let phone = req.body.phone;
      let password = req.body.password;
      let loginRespone = await staffsService.loginStaff(phone, password, req.get("Host"), req.connection.encrypted);
      if (loginRespone == variable.UnAuthorized)
        return res.status(variable.UnAuthorized).send("Invalid phone or password.");
      res.send(loginRespone);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getStaffById(req, res) {
    const id = parseInt(req.params.id);
    const staffId = req.user.Id;
    const roleIdAuth = req.user.roleId;
    try {
      if (roleIdAuth != variable.AdminRoleId && roleIdAuth != variable.ReceptionistRoleId && staffId != id) {
        return res.status(403).send("No permission!");
      }
      const staff = await staffsService.getStaffById(id, req.get("Host"), req.connection.encrypted);
      if (!staff) return res.status(variable.NoContent).send();
      res.send(staff);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getListStaffsByFilter(req, res) {
    try {
      const listStaffsByFilter = await staffsService.getListStaffsByFilter(
        req.query,
        req.get("Host"),
        req.connection.encrypted
      );
      if (listStaffsByFilter.length === 0) return res.status(variable.NoContent).send();
      var obj = {
        staffs: listStaffsByFilter,
      };
      let pageSize = req.query.pageSize;
      if (pageSize) {
        delete req.query.pageSize;
        delete req.query.page;
        const len = await staffsService.getListStaffsByFilter(req.query);
        obj.totalPage = len.length % pageSize == 0 ? len.length / pageSize : Math.floor(len.length / pageSize) + 1;
      }
      res.send(obj);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getStaffsWithWage(req, res) {
    try {
      const listStaffsByFilter = await staffsService.getStaffsWithWage(req.query, req.get("Host"));
      if (listStaffsByFilter.length === 0) return res.status(variable.NoContent).send();
      var obj = {
        staffs: listStaffsByFilter,
      };
      let pageSize = req.query.pageSize;
      if (pageSize) {
        delete req.query.pageSize;
        delete req.query.page;

        const len = await staffsService.getStaffsWithWage(req.query);
        obj.totalPage = len.length % pageSize == 0 ? len.length / pageSize : Math.floor(len.length / pageSize) + 1;
      }
      res.send(obj);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async createStaff(req, res) {
    const randomPass = (Math.random() + 1).toString(36).slice(2, 10);
    const { error } = validateStaff(req.body);
    if (error) {
      if (req.file) deleteImgByPath(req.file.path);
      return res.status(variable.BadRequest).send(error.details[0].message);
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const date = new Date();
      date.setHours(date.getHours() + 7);
      const data = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        password: await bcrypt.hash(randomPass, salt),
        imageName: req.file ? req.file.filename : "",
        imagePath: req.file ? req.get("Host") + "/src/images/staffs/" + req.file.filename : "",
        birthday: req.body.birthday ? new Date(req.body.birthday) : undefined,
        gender: req.body.gender ? Boolean(req.body.gender) : undefined,
        description: req.body.description,
        roleId: parseInt(req.body.roleId),
        departmentId: parseInt(req.body.departmentId),
        createdAt: date,
        updatedAt: date,
      };
      if (data.birthday == "Invalid Date") {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.BadRequest).send("Invalid birthday!");
      }
      const result = await staffsService.createStaff(data);
      result.randomPassword = randomPass;
      res.send(result);
    } catch (err) {
      if (req.file) deleteImgByPath(req.file.path);
      if (err.code === "P2002") return res.status(variable.BadRequest).send("This phone number already exists!");
      res.status(variable.BadRequest).send("Create new staff failed!");
      throw err;
    }
  }

  async updateStaff(req, res) {
    try {
      let id = parseInt(req.params.id);
      let name = req.body.name;
      let address = req.body.address;
      let roleId = req.body.roleId ? parseInt(req.body.roleId) : undefined;
      let basicWage = req.body.basicWage ? parseFloat(req.body.basicWage) : undefined;
      let departmentId = req.body.departmentId ? parseInt(req.body.departmentId) : undefined;
      let birthday = req.body.birthday ? new Date(req.body.birthday) : undefined;
      let gender = req.body.gender == "false" ? false : true;
      let description = req.body.description;
      let staffId = req.user.Id;
      let data = {};
      let date = new Date();
      let imageName = req.file ? req.file.filename : undefined;
      let imagePath = req.file ? req.get("Host") + "/src/images/staffs/" + req.file.filename : undefined;
      let roleIdAuth = req.user.roleId;
      if (birthday == "Invalid Date") {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.BadRequest).send("Invalid birthday!");
      }
      if ((roleId != undefined || departmentId != undefined) && roleIdAuth != variable.AdminRoleId) {
        if (req.file) deleteImgByPath(req.file.path);
        return res
          .status(variable.Forbidden)
          .send("No permission! Update role or department only works for admin account!");
      }
      if (basicWage != undefined && roleIdAuth != variable.AdminRoleId) {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.Forbidden).send("No permission! Update basic wage only works for admin account!");
      }
      date.setHours(date.getHours() + 7);
      data = {
        name: name,
        address: address,
        roleId: roleId,
        departmentId: departmentId,
        updatedAt: date,
        birthday: birthday,
        gender: gender,
        basicWage: basicWage,
        imageName: imageName,
        imagePath: imagePath,
        description: description,
      };
      if (staffId != id && roleIdAuth != variable.AdminRoleId) {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.Forbidden).send("No permission!");
      }
      let update = await staffsService.updateStaff(id, data, req.get("Host"), req.connection.encrypted);
      delete update.password;
      if (!update) {
        if (req.file) deleteImgByPath(req.file.path);
        return res.status(variable.BadRequest).send("Update failed!");
      }
      res.send(update);
    } catch (err) {
      if (req.file) res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async changePassword(req, res) {
    try {
      const salt = await bcrypt.genSalt(10);
      let id = parseInt(req.params.id);
      let roleIdAuth = req.user.roleId;
      let staffId = req.user.Id;
      let password = req.body.newPassword;
      let oldPassword = req.body.oldPassword;
      if (!password) return res.status(variable.BadRequest).send("No new password provided!");
      if (!oldPassword && roleIdAuth != variable.AdminRoleId)
        return res.status(variable.BadRequest).send("No old password provided!");
      if (staffId != id && roleIdAuth != variable.AdminRoleId)
        return res.status(variable.BadRequest).send("No permission!");
      let data = {
        oldPassword: req.body.oldPassword,
        password: password ? await bcrypt.hash(password, salt) : variable.DefaultPassword,
      };
      let changePassword = await staffsService.changePassword(id, data, roleIdAuth);
      if (changePassword === variable.UnAuthorized)
        return res.status(variable.UnAuthorized).send("Invalid old password!");
      return res.send(changePassword);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async deleteStaff(req, res) {
    try {
      let id = parseInt(req.params.id);
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res.status(variable.BadRequest).send("No permission! Only works for admin accounts");
      let delUser = await staffsService.deleteStaff(id);
      if (delUser == variable.NotFound) return res.status(variable.NotFound).send("No user is deleted");
      delete delUser.password;
      res.send(delUser);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async deleteManyStaffs(req, res) {
    try {
      let idArray = req.body.idArray;
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.AdminRoleId)
        return res.status(variable.BadRequest).send("No permission! Only works for admin accounts");
      let delManyStaffs = await staffsService.deleteManyStaffs(idArray);
      if (delManyStaffs == variable.NotFound) return res.status(variable.NotFound).send("No staffs is deleted");
      res.send("Delete staff(s) successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async refreshToken(req, res) {
    const refreshToken = req.body.refreshToken;
    try {
      let token = await staffsService.refreshToken(refreshToken);
      if (token == variable.UnAuthorized) return res.status(variable.UnAuthorized).send("Invalid refresh token!");
      res.send(token);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }
}
module.exports = new StaffsController();

function validateStaff(staff) {
  const schema = Joi.object({
    name: Joi.string(),
    phone: Joi.string().min(10).max(11),
    password: Joi.string().min(5).max(255),
    address: Joi.string().min(5).max(255),
    imagePath: Joi.string().allow(null).allow("").optional(),
    gender: Joi.boolean(),
    description: Joi.string().allow(null).allow("").optional(),
    birthday: Joi.date().allow(null).allow("").optional(),
    roleId: Joi.number().required(),
    departmentId: Joi.number().required(),
  });
  return schema.validate(staff);
}

async function deleteImgByPath(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {}
}
