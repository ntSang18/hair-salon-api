const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../common/variable");

var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
firstDay.setHours(firstDay.getHours() + 7);
var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
lastDay.setHours(lastDay.getHours() + 7);
lastDay.setUTCHours(23, 59, 59, 999);

exports.cancelBookings = async function () {
  try {
    const nowDate = new Date();
    nowDate.setHours(nowDate.getHours() + 7);
    let cancelBookings = await prisma.bookings.updateMany({
      where: {
        status: { not: { in: ["Done", "Confirm"] } },
        date: {
          lte: nowDate,
        },
      },
      data: {
        status: "Cancel",
        updatedBy: 1,
      },
    });
    return cancelBookings;
  } catch (err) {
    throw err;
  }
};
exports.createWages = async function () {
  try {
    let billsOrderby = await prisma.bills.groupBy({
      by: ["staffId"],
      where: {
        createdAt: {
          lte: lastDay,
          gte: firstDay,
        },
      },
      _count: true,
    });
    let dataWages = [];
    for (let i in billsOrderby) {
      billsOrderby[i].staff = await prisma.staffs.findFirst({
        where: {
          Id: billsOrderby[i].staffId,
          roleId: { in: [variable.ReceptionistRoleId, variable.BarberRoleId] },
        },
      });
      if (billsOrderby[i].staff.basicWage) {
        dataWages[i] = {
          staffId: billsOrderby[i].staffId,
          month: lastDay.getMonth(),
          wage:
            billsOrderby[i]._count * variable.BonusPerBill +
            billsOrderby[i].staff.basicWage,
          totalBills: billsOrderby[i]._count ? billsOrderby[i]._count : 0,
          year: lastDay.getFullYear(),
        };
      }
    }
    let createWages = await prisma.wages.createMany({
      data: dataWages,
      skipDuplicates: true,
    });
    return createWages;
  } catch (err) {
    throw err;
  }
};

exports.resetCustomerRanks = async function () {
  try {
    const nowDate = new Date();
    nowDate.setHours(nowDate.getHours() + 7);
    let reset = await prisma.customers.updateMany({
      data: {
        customerTypeId: variable.DefaultCustomerTypeId,
        updatedAt: nowDate,
      },
    });
    return reset;
  } catch (err) {
    throw err;
  }
};
