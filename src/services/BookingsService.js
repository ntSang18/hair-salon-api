const { PrismaClient } = require("@prisma/client");
const variable = require("../common/variable");
const prisma = new PrismaClient();

exports.createBooking = async function (data) {
  try {
    let nowDay = new Date();
    nowDay.setHours(nowDay.getHours() + 7);
    let oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    oneWeekLater.setHours(oneWeekLater.getHours() + 7);
    const listBookings = await prisma.bookings.findMany({
      where: {
        customerId: data.customerId,
        status: { not: "Cancel" },
        date: {
          lte: oneWeekLater,
          gte: nowDay,
        },
      },
    });
    if (listBookings.length >= 5) {
      return variable.ExceededBooking;
    }
    const filter = listBookings.filter((item) => item.status == "Confirm");
    if (filter.length > 0) {
      return variable.ConfirmBooking;
    }
    const createBooking = await prisma.bookings.create({
      data,
      include: { staff: true, customer: true },
    });
    if (createBooking) {
      delete createBooking.staff.password;
      delete createBooking.customer.password;
    }
    return createBooking;
  } catch (err) {
    throw err;
  }
};
exports.getBill = async function (id) {
  try {
    const bill = await prisma.bills.findFirst({
      where: { bookingId: id },
      include: {
        staff: true,
        customer: { include: { customerType: true } },
        details: { include: { service: { include: { serviceType: true } } } },
        booking: {
          include: {
            details: { include: { service: true } },
            advertisement: true,
          },
        },
      },
    });
    return bill;
  } catch (err) {
    throw err;
  }
};
exports.getBookingById = async function (id) {
  try {
    const booking = await prisma.bookings.findFirst({
      where: { Id: id },
      include: {
        staff: true,
        customer: true,
        details: { include: { service: true, bill: true } },
      },
    });
    if (booking) delete booking.staff.password;
    delete booking.customer.password;
    return booking;
  } catch (err) {
    throw err;
  }
};

exports.getListBookingsByFilter = async function (filter) {
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
  const status = filter.status ? filter.status : "";
  const isDeleted = filter.isDeleted
    ? filter.isDeleted === "false"
      ? false
      : true
    : undefined;
  const staffId = filter.staffId ? parseInt(filter.staffId) : undefined;
  const customerId = filter.customerId
    ? parseInt(filter.customerId)
    : undefined;
  const startDate = filter.startDate ? new Date(filter.startDate) : "";
  const endDate = filter.endDate ? new Date(filter.endDate) : "";
  const date = filter.date ? new Date(filter.date) : "";
  let dateObj = {};
  if (startDate && endDate) {
    dateObj = {
      date: {
        lte: new Date(
          new Date(endDate.setHours(23, 59, 59, 999))
            .toString()
            .split("GMT")[0] + " UTC"
        ).toISOString(),
        gte: new Date(
          new Date(startDate.setHours(0, 0, 0, 0)).toString().split("GMT")[0] +
            " UTC"
        ).toISOString(),
      },
    };
  }
  if (date)
    dateObj = {
      date: {
        lte: new Date(date),
        gte: new Date(date),
      },
    };
  try {
    const listBookingsByFilter = await prisma.bookings.findMany({
      ...paginateObj,
      where: {
        status: { contains: status },
        staffId: staffId,
        customerId: customerId,
        isDeleted: isDeleted,
        ...dateObj,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        rate: true,
        staff: selectStaff,
        customer: selectCustomer,
        advertisement: true,
        details: {
          include: { service: true, bill: true },
        },
      },
    });
    if (listBookingsByFilter) return listBookingsByFilter;
  } catch (err) {
    throw err;
  }
};

exports.updateBooking = async function (id, data, customerId, roleIdAuth) {
  try {
    let findBooking = await prisma.bookings.findFirst({
      where: { Id: id },
      include: {
        staff: selectStaff,
        customer: selectCustomer,
        advertisement: true,
        details: {
          include: { service: true, bill: true },
        },
      },
    });

    if (data.status === variable.ConfirmBooking) {
      let dupBooking = await prisma.bookings.findFirst({
        where: {
          Id: { not: id },
          status: variable.ConfirmBooking,
          timeSlot: data.timeSlot,
          staffId: findBooking?.staffId,
          date: data.date,
        },
      });
      if (dupBooking) return variable.BadRequest;
    }

    if (
      findBooking.customerId != customerId &&
      roleIdAuth != variable.ReceptionistRoleId &&
      roleIdAuth != variable.AdminRoleId
    )
      return variable.Forbidden;
    const filterBooking = findBooking.details.map((item) => item.serviceId);
    const duplicateService = data.details.create
      .filter((item) => filterBooking.includes(item.serviceId))
      .map((item) => item.serviceId);
    if (
      JSON.stringify(duplicateService) !== JSON.stringify([undefined]) &&
      JSON.stringify(duplicateService) !== JSON.stringify([])
    ) {
      findDup = await prisma.services.findMany({
        where: { Id: { in: duplicateService } },
      });
      return findDup;
    }
    let [bookingResponse, adsResponse] = [];
    if (findBooking && findBooking.advertisementId) {
      let amount = undefined;
      if (
        findBooking.status !== variable.ConfirmBooking &&
        data.status === variable.ConfirmBooking
      ) {
        amount = { increment: -1 };
      }
      if (
        findBooking.status === variable.ConfirmBooking &&
        data.status !== variable.ConfirmBooking
      ) {
        amount = { increment: +1 };
      }
      [bookingResponse, adsResponse] = await prisma.$transaction([
        prisma.bookings.update({
          where: { Id: id },
          data,
          include: {
            staff: selectStaff,
            customer: selectCustomer,
            advertisement: true,
            details: { include: { service: true, bill: true } },
          },
        }),
        prisma.advertisements.update({
          where: {
            Id: findBooking.advertisementId,
          },
          data: { amount: amount },
        }),
      ]);
    } else {
      bookingResponse = await prisma.bookings.update({
        where: { Id: id },
        data,
        include: {
          staff: selectStaff,
          customer: selectCustomer,
          advertisement: true,
          details: { include: { service: true, bill: true } },
        },
      });
    }
    return bookingResponse;
  } catch (err) {
    throw err;
  }
};

exports.updateManyStatuesBooking = async function (idArray, status) {
  try {
    let bookings = await prisma.bookings.updateMany({
      where: { Id: { in: idArray } },
      data: { status: status },
    });
    if (bookings.count === 0) return variable.NotFound;
    return bookings;
  } catch (err) {
    throw err;
  }
};

exports.deleteBooking = async function (id, customerId) {
  try {
    let findBooking = await prisma.bookings.findFirst({ where: { Id: id } });
    if (findBooking && findBooking.customerId != customerId)
      return variable.Forbidden;
    let delBooking = await prisma.bookings.delete({
      where: { Id: id },
    });
    return delBooking;
  } catch (err) {
    throw err;
  }
};

exports.softDeleteBooking = async function (id, customerId) {
  try {
    let findBooking = await prisma.bookings.findFirst({ where: { Id: id } });
    if (findBooking && findBooking.customerId != customerId)
      return variable.Forbidden;
    let delBooking = await prisma.bookings.update({
      where: { Id: id },
      data: {
        isDeleted: true,
      },
    });
    return delBooking;
  } catch (err) {
    throw err;
  }
};

exports.deleteManyBookings = async function (idArray) {
  try {
    let delManyBooking = await prisma.bookings.deleteMany({
      where: { Id: { in: idArray } },
    });
    if (delManyBooking.count === 0) return variable.NotFound;
    return delManyBooking;
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

const selectCustomer = {
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
    customerTypeId: true,
    customerType: true,
    rates: true,
    isDeleted: true,
  },
};
