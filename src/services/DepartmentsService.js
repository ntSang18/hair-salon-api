const { PrismaClient } = require("@prisma/client");
const variable = require("../common/variable");
const prisma = new PrismaClient();

exports.getdepartmentById = async function (id) {
  try {
    const department = await prisma.departments.findFirst({
      where: { Id: id, isDeleted: false },
    });
    return department;
  } catch (err) {
    throw err;
  }
};

exports.getListDepartmentsByFilter = async function (filter) {
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
    const listDepartmentsByFilter = await prisma.departments.findMany({
      ...paginateObj,
      where: {
        name: { contains: name },
        isDeleted: false,
      },
    });
    return listDepartmentsByFilter;
  } catch (err) {
    throw err;
  }
};

exports.createDepartment = async function (data) {
  try {
    const createDepartment = await prisma.departments.create({
      data,
    });
    return createDepartment;
  } catch (err) {
    throw err;
  }
};

exports.updateDepartment = async function (id, data) {
  try {
    let staff = await prisma.departments.update({
      where: { Id: id },
      data,
    });
    return staff;
  } catch (err) {
    throw err;
  }
};

exports.deleteManyDepartments = async function (idArray) {
  try {
    let delManyDepartment = await prisma.departments.updateMany({
      where: { Id: { in: idArray } },
      data: {
        isDeleted: true,
      },
    });
    if (delManyDepartment.count === 0) return variable.NoContent;
    return delManyDepartment;
  } catch (err) {
    throw err;
  }
};
