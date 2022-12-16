const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../common/variable");
const tokenConfig = require("../common/tokenConfig");
const utils = require("../utils/utils");
const path = require("path");
const groupBy = require("core-js/actual/array/group-by");
const fs = require("fs");
const { HOST_USER_SERVICE } = require("../common/HOST_SERVICE");

exports.loginStaff = async function (phone, password, host, encrypted) {
  try {
    let isValidStaff = await prisma.staffs.findFirst({
      where: { phone: phone, isDeleted: false },
      include: { role: true, department: true },
    });
    let isValidPassword = await bcrypt.compare(password, isValidStaff.password);
    if (!isValidPassword) return variable.UnAuthorized;
    delete isValidStaff.password;
    if (isValidStaff.imageName) {
      isValidStaff.imagePath =
        HOST_USER_SERVICE + "src/images/staffs/" + isValidStaff.imageName;
    }
    const token = jwt.sign(isValidStaff, tokenConfig.secret, {
      expiresIn: tokenConfig.tokenLife,
    });
    const refreshToken = jwt.sign(
      isValidStaff,
      tokenConfig.refreshTokenSecret,
      {
        expiresIn: tokenConfig.refreshTokenLife,
      }
    );
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

exports.createStaff = async function (data) {
  try {
    const createStaff = await prisma.staffs.create({
      data,
      include: { role: true, department: true, wages: true },
    });
    if (createStaff) {
      delete createStaff.password;
    }
    return createStaff;
  } catch (err) {
    throw err;
  }
};

exports.getStaffById = async function (id, host, encrypted) {
  try {
    const staff = await prisma.staffs.findFirst({
      where: { Id: id, isDeleted: false },
      include: { role: true, department: true, wages: true },
    });
    if (staff) {
      delete staff.password;
      if (staff.imageName) {
        staff.imagePath =
          HOST_USER_SERVICE + "src/images/staffs/" + staff.imageName;
      }
    }
    return staff;
  } catch (err) {
    throw err;
  }
};

exports.getListStaffsByFilter = async function (filter, host, encrypted) {
  const page = filter.page ? parseInt(filter.page) : filter.page;
  const pageSize = filter.pageSize
    ? parseInt(filter.pageSize)
    : filter.pageSize;
  const paginateObj =
    page != undefined && pageSize != undefined
      ? {
          skip: pageSize * page - pageSize,
          take: pageSize,
        }
      : {};
  const orderBy = filter.orderBy ? filter.orderBy : "";
  const startDate = filter.startDate ? new Date(filter.startDate) : "";
  const endDate = filter.endDate ? new Date(filter.endDate) : "";
  let dateObj = {};
  if (startDate && endDate)
    dateObj = {
      createdAt: {
        lte: new Date(endDate),
        gte: new Date(startDate),
      },
    };
  const roleAndDepartmentObj = {};
  let orderByFilter = {};
  orderByFilter = orderBy === "new" ? { orderBy: { Id: "desc" } } : {};
  orderByFilter =
    orderBy === "bills" ? { orderBy: { bills: { _count: "desc" } } } : {};
  if (filter.roleId) roleAndDepartmentObj.roleId = parseInt(filter.roleId);
  if (filter.departmentId)
    roleAndDepartmentObj.departmentId = parseInt(filter.departmentId);
  const name = filter.name ? filter.name : "";
  try {
    const listStaffsByFilter = await prisma.staffs.findMany({
      ...paginateObj,
      where: {
        OR: [{ name: { contains: name } }, { phone: { contains: name } }],
        isDeleted: false,
        ...roleAndDepartmentObj,
        ...dateObj,
      },
      ...selectStaff,
      ...orderByFilter,
    });
    if (listStaffsByFilter.length > 0) {
      let rates = await prisma.rates.findMany({
        include: { booking: true },
      });
      const staffsWithAvgRate = rates.groupBy((item) => {
        return item.booking.staffId;
      });

      for (let i in staffsWithAvgRate) {
        let avg =
          staffsWithAvgRate[i].reduce(function (sum, value) {
            return sum + value.rate;
          }, 0) / staffsWithAvgRate[i].length;
        staffsWithAvgRate[i] = Math.round(avg * 100) / 100;
      }
      listStaffsByFilter.forEach((item) => {
        item.avg = staffsWithAvgRate[item.Id];
        if (item.imageName) {
          item.imagePath =
            HOST_USER_SERVICE + "src/images/staffs/" + item.imageName;
        }
      });
    }
    return listStaffsByFilter;
  } catch (err) {
    throw err;
  }
};

exports.getStaffsWithWage = async function (filter, host) {
  const page = filter.page ? parseInt(filter.page) : filter.page;
  const pageSize = filter.pageSize
    ? parseInt(filter.pageSize)
    : filter.pageSize;
  const paginateObj =
    page != undefined && pageSize != undefined
      ? {
          skip: pageSize * page - pageSize,
          take: pageSize,
        }
      : {};
  const orderBy = filter.orderBy ? filter.orderBy : "";
  const month = filter.month ? parseInt(filter.month) : "";
  const year = filter.year ? parseInt(filter.year) : "";
  const roleAndDepartmentObj = {};
  let orderByFilter = {};
  orderByFilter = orderBy === "new" ? { orderBy: { Id: "desc" } } : {};
  if (filter.roleId) roleAndDepartmentObj.roleId = parseInt(filter.roleId);
  if (filter.departmentId)
    roleAndDepartmentObj.departmentId = parseInt(filter.departmentId);
  const name = filter.name ? filter.name : "";
  if (month && year) {
    selectStaffsWithWage.select.wages = { where: { month: month, year: year } };
  }
  try {
    const listStaffsByFilter = await prisma.staffs.findMany({
      ...paginateObj,
      where: {
        OR: [{ name: { contains: name } }, { phone: { contains: name } }],
        isDeleted: false,
        ...roleAndDepartmentObj,
      },
      ...selectStaffsWithWage,
      ...orderByFilter,
    });
    if (listStaffsByFilter.length > 0) {
      listStaffsByFilter.forEach((item) => {
        if (item.wages.length > 0) {
          item.wages = item.wages[0];
        } else {
          item.wages = {};
        }
      });
    }
    return listStaffsByFilter;
  } catch (err) {
    throw err;
  }
};

exports.updateStaff = async function (id, data, host, encrypted) {
  try {
    let oldStaff = await prisma.staffs.findFirst({ where: { Id: id } });
    let staff = await prisma.staffs.update({
      where: { Id: id },
      data,
      include: { role: true, department: true },
    });
    if (staff) {
      delete staff.password;
      if (staff.imageName) {
        staff.imagePath =
          HOST_USER_SERVICE + "src/images/staffs/" + staff.imageName;
        deleteImgByPath(
          path.join(__dirname, "../../src/images/staffs/" + oldStaff.imageName)
        );
      }
    }
    return staff;
  } catch (err) {
    throw err;
  }
};

exports.changePassword = async function (id, data, roleIdAuth) {
  try {
    let findStaff = await prisma.staffs.findFirst({ where: { Id: id } });
    let isValidPassword = await bcrypt.compare(
      data.oldPassword,
      findStaff.password
    );
    if (!isValidPassword) return variable.UnAuthorized;
    delete data.oldPassword;
    let changePass = await prisma.staffs.update({
      where: { Id: id },
      data,
      include: {
        role: true,
        department: true,
      },
    });
    delete changePass.password;
    return changePass;
  } catch (err) {
    throw err;
  }
};

exports.deleteStaff = async function (id) {
  try {
    let oldStaff = await prisma.staffs.findFirst({ where: { Id: id } });
    let delStaff = await prisma.staffs.delete({
      where: { Id: id },
    });
    delete staff.password;
    if (staff) {
      deleteImgByPath(oldStaff.imagePath);
    }
    return delStaff;
  } catch (err) {
    throw err;
  }
};

exports.deleteManyStaffs = async function (idArray) {
  try {
    let delManyStaff = await prisma.staffs.updateMany({
      where: { Id: { in: idArray } },
      data: {
        isDeleted: true,
      },
    });
    if (delManyStaff.count === 0) return variable.NotFound;
    return delManyStaff;
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
    const decodedRefreshToken = await utils.verifyJwtToken(
      refreshToken,
      tokenConfig.refreshTokenSecret
    );
    let staff = await prisma.staffs.findFirst({
      where: { Id: decodedRefreshToken.id },
    });
    const token = jwt.sign(staff, tokenConfig.secret, {
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

const selectStaff = {
  select: {
    password: false,
    Id: true,
    name: true,
    phone: true,
    address: true,
    basicWage: true,
    imageName: true,
    imagePath: true,
    birthday: true,
    gender: true,
    description: true,
    roleId: true,
    role: true,
    departmentId: true,
    department: true,
    wages: true,
    isDeleted: true,
    bookings: true,
    bills: true,
    _count: true,
  },
};

const selectStaffsWithWage = {
  select: {
    password: false,
    Id: true,
    name: true,
    wages: true,
    basicWage: true,
    isDeleted: true,
    _count: { select: { bills: true, wages: true } },
  },
};
