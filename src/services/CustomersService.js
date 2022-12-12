const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../common/variable");
const tokenConfig = require("../common/tokenConfig");
const utils = require("../utils/utils");
const path = require("path");
const fs = require("fs");

exports.loginCustomer = async function (phone, password, host, encrypted) {
  try {
    let isValidCustomer = await prisma.customers.findFirst({
      where: { phone: phone },
      include: { customerType: true },
    });
    if (!isValidCustomer) return variable.UnAuthorized;
    let isValidPassword = await bcrypt.compare(password, isValidCustomer.password);
    if (!isValidPassword) return variable.UnAuthorized;
    delete isValidCustomer.password;
    if (isValidCustomer.imageName) {
      isValidCustomer.imagePath = encrypted
        ? "https://" + host + "/src/images/customters/" + isValidCustomer.imageName
        : "http://" + host + "/src/images/customters/" + isValidCustomer.imageName;
    }
    const token = jwt.sign(isValidCustomer, tokenConfig.secret, {
      expiresIn: tokenConfig.tokenLife,
    });
    const refreshToken = jwt.sign(isValidCustomer, tokenConfig.refreshTokenSecret, {
      expiresIn: tokenConfig.refreshTokenLife,
    });
    await prisma.refreshTokens.create({
      data: {
        refreshToken: refreshToken,
      },
    });
    const response = { token, refreshToken };
    return response;
  } catch (err) {
    throw err;
  }
};

exports.createCustomer = async function (data) {
  try {
    const createCustomer = await prisma.customers.create({ data: data });
    if (createCustomer) delete createCustomer.password;
    return createCustomer;
  } catch (err) {
    throw err;
  }
};

exports.registerCustomer = async function (data) {
  try {
    const registerCustomer = await prisma.customers.create({
      data,
      include: { customerType: true },
    });
    if (registerCustomer) delete registerCustomer.password;
    const token = jwt.sign(registerCustomer, tokenConfig.secret, {
      expiresIn: tokenConfig.tokenLife,
    });
    const refreshToken = jwt.sign(registerCustomer, tokenConfig.refreshTokenSecret, {
      expiresIn: tokenConfig.refreshTokenLife,
    });
    await prisma.refreshTokens.create({
      data: {
        refreshToken: refreshToken,
      },
    });
    const response = { token, refreshToken };
    return response;
  } catch (err) {
    throw err;
  }
};

exports.getCustomerById = async function (id, host, encrypted) {
  try {
    const customer = await prisma.customers.findFirst({
      where: { Id: id, isDeleted: false },
      include: { customerType: true, rates: true },
    });
    if (customer) {
      delete customer.password;
      if (customer.imageName) {
        customer.imagePath = encrypted
          ? "https://" + host + "/src/images/customers/" + customer.imageName
          : "http://" + host + "/src/images/customers/" + customer.imageName;
      }
    }
    return customer;
  } catch (err) {
    throw err;
  }
};

exports.getListCustomersByFilter = async function (filter, host, encrypted) {
  const page = filter.page ? parseInt(filter.page) : filter.page;
  const pageSize = filter.pageSize ? parseInt(filter.pageSize) : filter.pageSize;
  const name = filter.name ? filter.name : "";
  const paginateObj =
    page != undefined && pageSize != undefined
      ? {
          skip: pageSize * page - pageSize,
          take: pageSize,
        }
      : {};
  const customerTypeObj = {};
  const orderBy = filter.orderBy ? filter.orderBy : "";
  let orderByFilter = {};
  orderByFilter = orderBy === "new" ? { orderBy: { Id: "desc" } } : {};
  if (filter.customerTypeId) customerTypeObj.customerTypeId = parseInt(filter.customerTypeId);
  try {
    if (customerTypeObj.customerTypeId != 0) {
      var listCustomersByFilter = await prisma.customers.findMany({
        ...paginateObj,
        where: {
          OR: [{ name: { contains: name } }, { phone: { contains: name } }],
          isDeleted: false,
          ...customerTypeObj,
        },
        ...selectCustomer,
        ...orderByFilter,
      });
    } else {
      var listCustomersByFilter = await prisma.customers.findMany({
        ...paginateObj,
        where: {
          OR: [{ name: { contains: name } }, { phone: { contains: name } }],
          isDeleted: false,
        },
        ...selectCustomer,
      });
    }
    if (listCustomersByFilter.length > 0) {
      listCustomersByFilter.forEach((item) => {
        if (item.imageName) {
          item.imagePath = encrypted
            ? "https://" + host + "/src/images/customers/" + item.imageName
            : "http://" + host + "/src/images/customers/" + item.imageName;
        }
      });
    }
    return listCustomersByFilter;
  } catch (err) {
    throw err;
  }
};

exports.updateCustomer = async function (id, data, host, encrypted) {
  try {
    let oldCustomer = await prisma.customers.findFirst({ where: { Id: id } });
    let customer = await prisma.customers.update({
      where: { Id: id },
      data,
      include: {
        customerType: true,
      },
    });
    if (customer) {
      delete customer.password;
      if (data.imageName) {
        data.imagePath = encrypted
          ? "https://" + host + "/src/images/customers/" + customer.imageName
          : "http://" + host + "/src/images/customers/" + customer.imageName;
        deleteImgByPath(path.join(__dirname, "../../src/images/customers/" + oldCustomer.imageName));
      }
    }
    return customer;
  } catch (err) {
    throw err;
  }
};

exports.changePassword = async function (id, data, roleIdAuth) {
  try {
    if (roleIdAuth != variable.AdminRoleId) {
      let findCustomer = await prisma.customers.findFirst({
        where: { Id: id },
      });
      let isValidPassword = await bcrypt.compare(data.oldPassword, findCustomer.password);
      if (!isValidPassword) return variable.UnAuthorized;
    }
    delete data.oldPassword;
    let changePass = await prisma.customers.update({
      where: { Id: id },
      data,
      include: {
        customerType: true,
        rates: true,
      },
    });
    delete changePass.password;
    return changePass;
  } catch (err) {
    throw err;
  }
};

exports.resetPassword = async function (data) {
  try {
    let resetPass = await prisma.customers.update({
      where: { phone: data.phone },
      data,
      include: {
        customerType: true,
        rates: true,
      },
    });
    if (!resetPass) return variable.NoContent;
    delete resetPass.password;
    return resetPass;
  } catch (err) {
    if (err.code === "P2025") {
      return variable.NotFound;
    }
    throw err;
  }
};

exports.deleteCustomer = async function (id) {
  try {
    let oldCustomer = await prisma.customers.findFirst({ where: { Id: id } });
    let delCustomer = await prisma.customers.delete({
      where: { Id: id },
      include: { customerType: true },
    });
    if (delCustomer) {
      delete delCustomer.password;
      deleteImgByPath(oldCustomer.imagePath);
    }
    return delCustomer;
  } catch (err) {
    throw err;
  }
};

exports.deleteManyCustomers = async function (idArray) {
  try {
    let delManyCustomer = await prisma.customers.updateMany({
      where: { Id: { in: idArray } },
      data: {
        isDeleted: true,
      },
    });
    if (delManyCustomer.count === 0) return variable.NotFound;
    return delManyCustomer;
  } catch (err) {
    throw err;
  }
};

exports.refreshToken = async function (refreshToken) {
  try {
    let checkrefreshToken = await prisma.refreshTokens.findFirst({
      where: { refreshToken: refreshToken },
    });
    if (!checkrefreshToken) return variable.UnAuthorized;
    const decodedRefreshToken = await utils.verifyJwtToken(refreshToken, tokenConfig.refreshTokenSecret);
    let customer = await prisma.customers.findFirst({
      where: { Id: decodedRefreshToken.id },
    });
    const token = jwt.sign(customer, tokenConfig.secret, {
      expiresIn: tokenConfig.tokenLife,
    });
    return { token };
  } catch (err) {
    throw err;
  }
};

async function deleteImgByPath(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {}
}

const selectCustomer = {
  select: {
    password: false,
    Id: true,
    name: true,
    phone: true,
    address: true,
    imageName: true,
    imagePath: true,
    point: true,
    birthday: true,
    gender: true,
    customerTypeId: true,
    customerType: true,
    rates: true,
    _count: true,
    isDeleted: true,
  },
};
