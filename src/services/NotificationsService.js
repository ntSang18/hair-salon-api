const { PrismaClient } = require("@prisma/client");
const { NoContent } = require("../common/variable");
const prisma = new PrismaClient();

exports.getNotificationById = async function (id) {
  try {
    const role = await prisma.Notifications.findFirst({
      where: { Id: id },
    });
    return role;
  } catch (err) {
    throw err;
  }
};

exports.getListNotificationsByFilter = async function (filter) {
  const page = filter.page ? parseInt(filter.page) : filter.page;
  const pageSize = filter.pageSize ? parseInt(filter.pageSize) : filter.pageSize;
  const paginateObj =
    page != undefined && pageSize != undefined
      ? {
          skip: pageSize * page - pageSize,
          take: pageSize,
        }
      : {};
  const staffIdAndCustomerIdObj = {};
  if (filter.toUser) staffIdAndCustomerIdObj.toUser = parseInt(filter.toUser);
  if (filter.staffId) staffIdAndCustomerIdObj.staffId = parseInt(filter.staffId);
  if (filter.customerId) staffIdAndCustomerIdObj.customerId = parseInt(filter.customerId);
  try {
    const listRolesByFilter = await prisma.Notifications.findMany({
      ...paginateObj,
      where: {
        ...staffIdAndCustomerIdObj,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
    return listRolesByFilter;
  } catch (err) {
    throw err;
  }
};

exports.createNotification = async function (data) {
  try {
    const createNotification = await prisma.Notifications.create({
      data,
    });
    return createNotification;
  } catch (err) {
    throw err;
  }
};

exports.createManyNotification = async function (data) {
  try {
    const createNotification = await prisma.Notifications.createMany({
      data: data,
      skipDuplicates: true,
    });
    return createNotification;
  } catch (err) {
    throw err;
  }
};
exports.updateNotification = async function (id, data) {
  try {
    const createNotification = await prisma.Notifications.update({
      where: { Id: id },
      data,
    });
    return createNotification;
  } catch (err) {
    throw err;
  }
};

exports.updateRole = async function (id, data) {
  try {
    let role = await prisma.roles.update({
      where: { Id: id },
      data,
    });
    return role;
  } catch (err) {
    throw err;
  }
};

exports.deleteManyRoles = async function (idArray) {
  try {
    let delManyRole = await prisma.roles.updateMany({
      where: { Id: { in: idArray } },
      data: {
        isDeleted: true,
      },
    });
    if (delManyRole.count === 0) return NoContent;
    return delManyRole;
  } catch (err) {
    throw err;
  }
};

exports.getStaffsWithNotification = async function (filter) {
  try {
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
    let staffsWithNotification = await prisma.Notifications.groupBy({
      by: ["staffId"],
      where: { ...dateObj },
      _avg: { Notification: true },
    });
    for (let i in staffsWithNotification) {
      staffsWithNotification[i].staff = await prisma.staffs.findFirst({
        where: { Id: staffsWithNotification[i].staffId },
      });
      delete staffsWithNotification[i].staff.password;
    }
    return staffsWithNotification;
  } catch (err) {
    throw err;
  }
};
