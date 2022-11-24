const { PrismaClient } = require("@prisma/client");
const { NoContent } = require("../common/variable");
const prisma = new PrismaClient();

exports.getRoleById = async function (id) {
  try {
    const role = await prisma.roles.findFirst({
      where: { Id: id, isDeleted: false },
    });
    return role;
  } catch (err) {
    throw err;
  }
};

exports.getListRolesByFilter = async function (filter) {
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
  const name = filter.name ? filter.name : "";
  try {
    const listRolesByFilter = await prisma.roles.findMany({
      ...paginateObj,
      where: {
        name: { contains: name },
        isDeleted: false,
      },
    });
    return listRolesByFilter;
  } catch (err) {
    throw err;
  }
};

exports.createRole = async function (data) {
  try {
    const createRole = await prisma.roles.create({
      data,
    });
    return createRole;
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
