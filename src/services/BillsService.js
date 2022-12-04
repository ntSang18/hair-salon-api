const { PrismaClient } = require("@prisma/client");
const variable = require("../common/variable");
const groupBy = require("core-js/actual/array/group-by");
const prisma = new PrismaClient();
const _ = require("lodash");
const { isNull } = require("lodash");

exports.createBill = async function (data) {
  try {
    const findCustomer = await prisma.customers.findFirst({
      where: { phone: data.phone },
    });
    if (!findCustomer) {
      let date = new Date();
      date.setHours(date.getHours() + 7);
      const createNewCustomer = await prisma.customers.create({
        data: {
          phone: data.phone,
          customerTypeId: variable.DefaultCustomerTypeId,
          createdAt: date,
          updatedAt: date,
        },
      });
      data.customerId = createNewCustomer.Id;
      delete data.phone;
    } else {
      data.customerId = findCustomer.Id;
      delete data.phone;
    }
    const createBill = await prisma.bills.create({
      data,
      include: {
        staff: true,
        customer: { select: { customerType: true } },
        booking: { include: { advertisement: true } },
        details: {
          include: {
            service: true,
          },
        },
      },
    });
    if (createBill) {
      delete createBill.staff.password;
      delete createBill.customer.password;
    }
    return createBill;
  } catch (err) {
    throw err;
  }
};

exports.createBillWithBooking = async function (data) {
  const detailsByBookingId = await prisma.details.findMany({
    where: { bookingId: data.bookingId },
    include: { service: { include: { serviceType: true } } },
  });
  try {
    const findBooking = await prisma.bookings.findFirst({
      where: { Id: data.bookingId },
    });
    if (findBooking.status !== "Confirm") return variable.BadRequest;
    data.staffId = findBooking.staffId;
    data.customerId = findBooking.customerId;
    const findCustomer = await prisma.customers.findFirst({
      where: { Id: findBooking.customerId },
      include: { customerType: true },
    });
    const createBill = await prisma.bills.create({
      data,
      include: {
        staff: true,
        customer: { select: { customerType: true } },
        booking: true,
      },
    });
    if (createBill) {
      const updateStatusBooking = await prisma.bookings.update({
        where: { Id: data.bookingId },
        data: { status: "Done" },
      });
      createBill.booking.details = detailsByBookingId;
      delete createBill.staff.password;
      delete createBill.customer.password;
    }
    return createBill;
  } catch (err) {
    throw err;
  }
};

exports.getBillById = async function (id) {
  try {
    const bill = await prisma.bills.findFirst({
      where: { Id: id },
      include: {
        staff: selectStaff,
        customer: selectCustomer,
        details: { include: { service: { include: { serviceType: true } } } },
        booking: { include: { advertisement: true } },
      },
    });
    if (bill) {
      delete bill.staff.password;
      delete bill.customer.password;
    }

    return bill;
  } catch (err) {
    throw err;
  }
};

exports.deleteBill = async function (id) {
  try {
    let delBill = await prisma.bills.delete({
      where: { Id: id },
    });
    return delBill;
  } catch (err) {
    throw err;
  }
};

exports.getListBillsByFilter = async function (filter) {
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
  const startDate = filter.startDate ? new Date(filter.startDate) : "";
  const endDate = filter.endDate ? new Date(filter.endDate) : "";
  const createdAt = filter.createdAt ? new Date(filter.createdAt) : "";
  let dateObj = {};
  if (startDate && endDate)
    dateObj = {
      createdAt: {
        lte: new Date(endDate),
        gte: new Date(startDate),
      },
    };
  if (createdAt)
    dateObj = {
      createdAt: {
        lte: new Date(createdAt),
        gte: new Date(createdAt),
      },
    };
  try {
    const listBillsByFilter = await prisma.bills.findMany({
      ...paginateObj,
      where: {
        ...dateObj,
      },
      include: {
        staff: selectStaff,
        customer: selectCustomer,
        details: { include: { service: { include: { serviceType: true } } } },
        booking: { include: { advertisement: true } },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
    if (listBillsByFilter) return listBillsByFilter;
  } catch (err) {
    throw err;
  }
};

exports.getStaffsOrderByBills = async function (filter) {
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
    let billsOrderby = await prisma.bills.groupBy({
      by: ["staffId"],
      where: { ...dateObj },
      _count: true,
      orderBy: [
        {
          _count: {
            staffId: "desc",
          },
        },
      ],
    });
    for (let i in billsOrderby) {
      billsOrderby[i].staff = await prisma.staffs.findFirst({
        where: { Id: billsOrderby[i].staffId },
      });
      delete billsOrderby[i].staff.password;
    }
    return billsOrderby;
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
    imageName: false,
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

const selectCustomer = {
  select: {
    password: false,
    Id: true,
    name: true,
    phone: true,
    address: true,
    imageName: false,
    imagePath: true,
    birthday: true,
    gender: true,
    customerTypeId: true,
    customerType: true,
    rates: true,
    isDeleted: true,
  },
};

exports.getProfitEachMonth = async function (year) {
  try {
    let dateObj = {};
    if (year)
      dateObj = {
        createdAt: {
          lte: new Date(year, 11, 31),
          gte: new Date(year, 0, 1),
        },
      };
    const startDay = await prisma.bills.findMany({
      where: { ...dateObj },
      select: {
        createdAt: true,
        price: true,
      },
    });
    let dict = _.groupBy(
      startDay,
      ({ createdAt }) => new Date(createdAt).getMonth() + 1
    );
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let profits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let keys = [];
    let values = [];
    Object.entries(dict).forEach(([key, value, index]) => {
      keys.push(key);
      let sum = 0;
      value.forEach((element) => {
        sum += element.price;
      });
      values.push(sum);
    });

    for (var i in keys) {
      if (months.includes(parseInt(keys[i]))) {
        profits[keys[i] - 1] = values[i];
      }
    }
    const result = months.map((month, i) => ({ month, profit: profits[i] }));
    return result;
  } catch (err) {
    throw err;
  }
};

exports.getTopServicesInMonth = async function (year, month) {
  try {
    let dateObj = {};
    let dateHasThirtyDay = [4, 6, 9, 11];
    let day = 31;
    if (month == 2) {
      day = 28;
    } else {
      if (dateHasThirtyDay.includes(month)) {
        day = 30;
      }
    }
    if (year && month)
      dateObj = {
        createdAt: {
          lte: new Date(year, month - 1, day),
          gte: new Date(year, month - 1, 1),
        },
      };
    const services = await prisma.bills.findMany({
      where: {
        ...dateObj,
      },
      select: {
        details: {
          select: {
            serviceId: true,
            service: true,
          },
        },
      },
    });
    const filter = services.filter(
      (item) => JSON.stringify(item.details) !== JSON.stringify([])
    );
    const mapFilter = filter.map((item) => item.details);
    const map2 = [];
    for (let i = 0; i < mapFilter.length; ++i) {
      map2.push(...mapFilter[i]);
    }
    const map3 = map2.groupBy((item) => item.serviceId);
    const map4 = [];
    Object.values(map3).forEach((item) =>
      map4.push({ service: item[0].service, count: item.length })
    );
    map4.sort(function (a, b) {
      return b.count - a.count;
    });
    return map4;
  } catch (err) {
    throw err;
  }
};
