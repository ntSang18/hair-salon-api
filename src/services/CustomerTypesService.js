const { PrismaClient } = require("@prisma/client");
const variable = require("../common/variable");
const prisma = new PrismaClient();

exports.getCustomerTypeById = async function (id) {
  try {
    const customerType = await prisma.customerTypes.findFirst({
      where: { Id: id, isDeleted: false },
    });
    return customerType;
  } catch (err) {
    throw err;
  }
};

exports.getListCustomerTypesByFilter = async function (filter) {
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
    const listCustomerTypesByFilter = await prisma.customerTypes.findMany({
      ...paginateObj,
      where: {
        name: { contains: name },
        isDeleted: false,
      },
    });
    return listCustomerTypesByFilter;
  } catch (err) {
    throw err;
  }
};

exports.createCustomerType = async function (data) {
  try {
    const createCustomerType = await prisma.customerTypes.create({
      data,
    });
    return createCustomerType;
  } catch (err) {
    throw err;
  }
};

exports.updateCustomerType = async function (id, data) {
  try {
    let staff = await prisma.customerTypes.update({
      where: { Id: id },
      data,
    });
    return staff;
  } catch (err) {
    throw err;
  }
};

exports.deleteManyCustomerTypes = async function (idArray) {
  try {
    let delManyCustomerType = await prisma.customerTypes.updateMany({
      where: { Id: { in: idArray } },
      data: {
        isDeleted: true,
      },
    });
    if (delManyCustomerType.count === 0) return variable.NoContent;
    return delManyCustomerType;
  } catch (err) {
    throw err;
  }
};
