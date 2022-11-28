const { PrismaClient } = require("@prisma/client");
const { NoContent } = require("../common/variable");
const groupBy = require("core-js/actual/array/group-by");
const variable = require("../common/variable");
const prisma = new PrismaClient();

exports.getRateById = async function (id) {
  try {
    const role = await prisma.rates.findFirst({
      where: { Id: id },
    });
    return role;
  } catch (err) {
    throw err;
  }
};

exports.getListRatesByFilter = async function (filter) {
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
  const staffIdAndCustomerIdObj = { booking: { staffId: undefined } };
  if (filter.staffId)
    staffIdAndCustomerIdObj.booking.staffId = parseInt(filter.staffId);
  if (filter.customerId)
    staffIdAndCustomerIdObj.customerId = parseInt(filter.customerId);
  try {
    const listRolesByFilter = await prisma.rates.findMany({
      ...paginateObj,
      where: {
        ...staffIdAndCustomerIdObj,
      },
      include: { booking: { include: { staff: selectStaff } } },
    });
    return listRolesByFilter;
  } catch (err) {
    throw err;
  }
};

exports.createRate = async function (data) {
  try {
    const findBooking = await prisma.bookings.findFirst({
      where: {
        Id: data.bookingId,
      },
    });
    if (findBooking) {
      if (findBooking.status !== "Done") {
        return variable.BadRequest;
      }
    }
    const createRate = await prisma.rates.create({
      data,
    });
    return createRate;
  } catch (err) {
    throw err;
  }
};

exports.getStaffsWithRate = async function (filter) {
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
    let rates = await prisma.rates.findMany({
      where: { ...dateObj },
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
    return staffsWithAvgRate;
  } catch (err) {
    throw err;
  }
};

const selectStaff = {
  select: {
    password: false,
    Id: true,
    name: true,
    phone: true,
    address: true,
    imageName: true,
    imagePath: true,
    birthday: true,
    gender: true,
    description: true,
    roleId: true,
    role: true,
    departmentId: true,
    department: true,
    isDeleted: true,
  },
};
