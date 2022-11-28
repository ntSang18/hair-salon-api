const variable = require("../common/variable");
const Joi = require("joi");
const bookingsService = require("../services/BookingsService");
class BookingsController {
  async getBookingById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const booking = await bookingsService.getBookingById(id);
      if (!booking) return res.status(variable.NoContent).send();
      res.send(booking);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async getListBookingsByFilter(req, res) {
    try {
      const listbookings = await bookingsService.getListBookingsByFilter(
        req.query
      );
      if (listbookings.length === 0)
        return res.status(variable.NoContent).send();
      var obj = {
        bookings: listbookings,
      };
      let pageSize = req.query.pageSize;
      if (pageSize) {
        delete req.query.pageSize;
        delete req.query.page;
        const len = await bookingsService.getListBookingsByFilter(req.query);
        obj.totalPage =
          len.length % pageSize == 0
            ? len.length / pageSize
            : Math.floor(len.length / pageSize) + 1;
      }
      res.send(obj);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async createBooking(req, res) {
    const customerId = req.user.Id;
    const serviceArray = req.body.serviceArray;
    const serviceArrayMap = serviceArray.map(
      (item) => new Object({ serviceId: item })
    );
    const { error } = validateBooking(req.body);
    if (error)
      return res.status(variable.BadRequest).send(error.details[0].message);
    const date = new Date();
    date.setHours(date.getHours() + 7);
    let checkCreatedAt = new Date(req.body.date + " " + req.body.timeSlot);
    checkCreatedAt.setHours(checkCreatedAt.getHours() + 7);
    if (checkCreatedAt < date) {
      return res.status(variable.BadRequest).send("Overdue for booking");
    }
    try {
      const data = {
        date: new Date(req.body.date),
        timeSlot: req.body.timeSlot,
        note: req.body.note,
        status: variable.Pending,
        createdAt: date,
        updatedAt: date,
        createBy: req.body.createBy,
        staffId: parseInt(req.body.staffId),
        customerId: customerId,
        advertisementId: req.body.advertisementId
          ? parseInt(req.body.advertisementId)
          : undefined,
        details: {
          create: serviceArrayMap,
        },
      };
      const result = await bookingsService.createBooking(data);
      if (result === variable.ExceededBooking) {
        return res
          .status(variable.BadRequest)
          .send("Each account can only book 5 bookings in the next 7 days");
      }
      if (result === variable.ConfirmBooking) {
        return res
          .status(variable.BadRequest)
          .send("You already have a confirmed booking");
      }
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  async updateBooking(req, res) {
    try {
      const id = parseInt(req.params.id);
      const status = req.body.status;
      const roleIdAuth = req.user.roleId;
      const updatedBy = req.user.Id;
      const customerId = parseInt(req.user.Id);
      const serviceDeleteArray = req.body.serviceDeleteArray || [];
      let serviceInsertArray = req.body.serviceInsertArray || [];
      if (serviceInsertArray) {
        serviceInsertArray = serviceInsertArray.map(
          (item) => new Object({ serviceId: item })
        );
      }
      if (roleIdAuth != variable.ReceptionistRoleId && status != "Cancel")
        return res
          .status(variable.Forbidden)
          .send(
            "No permission! Update status only work for receptionist role!"
          );
      if (req.body.date) {
        if (new Date(req.body.date).toDateString() === "Invalid Date")
          return res.status(variable.BadRequest).send("Invalid date!");

        let checkCreatedAt = req.body.timeSlot
          ? new Date(req.body.date + " " + req.body.timeSlot)
          : new Date(req.body.date);
        checkCreatedAt.setHours(checkCreatedAt.getHours() + 7);
        const date = new Date();
        date.setHours(date.getHours() + 7);
        if (checkCreatedAt < date) {
          return res.status(variable.BadRequest).send("Overdue for booking");
        }
      }

      let data = {
        date: req.body.date ? new Date(req.body.date) : undefined,
        timeSlot: req.body.timeSlot,
        note: req.body.note,
        status: req.body.status,
        updatedBy: updatedBy,
        details: {
          create: serviceInsertArray,
          deleteMany: { Id: { in: serviceDeleteArray } },
        },
      };

      let update = await bookingsService.updateBooking(
        id,
        data,
        customerId,
        roleIdAuth
      );
      if (update === variable.Forbidden)
        return res
          .status(variable.Forbidden)
          .send("No permission! Only update your booking");
      if (Array.isArray(update)) {
        let dupError = {};
        dupError.message = "Duplicate service(s)";
        dupError.duplicate = update;
        return res.status(variable.BadRequest).send(dupError);
      }
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async updateManyStatuesBooking(req, res) {
    try {
      const roleIdAuth = req.user.roleId;
      const status = req.body.status;
      if (roleIdAuth != variable.ReceptionistRoleId && status)
        return res
          .status(variable.Forbidden)
          .send("No permission! Only work for receptionist role!");
      let idArray = req.body.idArray;
      let update = await bookingsService.updateManyStatuesBooking(
        idArray,
        status
      );
      if (update === variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      if (update === variable.NotFound)
        return res.status(variable.NotFound).send("No bookings is updated!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async deleteBooking(req, res) {
    try {
      let id = parseInt(req.params.id);
      let roleIdAuth = req.user.roleId;
      const customerId = parseInt(req.user.Id);
      if (roleIdAuth && roleIdAuth != variable.ReceptionistRoleId)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for receptionist accounts");
      let delBooking = await bookingsService.deleteBooking(id, customerId);
      if (delBooking === variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      res.send("Delete Booking successful!");
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(variable.BadRequest).send(err.meta.cause);
      }
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async softDeleteBooking(req, res) {
    try {
      let id = parseInt(req.params.id);
      let roleIdAuth = req.user.roleId;
      const customerId = parseInt(req.user.Id);
      if (roleIdAuth && roleIdAuth != variable.ReceptionistRoleId)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for receptionist accounts");
      let delBooking = await bookingsService.softDeleteBooking(id, customerId);
      if (delBooking === variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      res.send("Delete Booking successful!");
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(variable.BadRequest).send(err.meta.cause);
      }
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async deleteManyBookings(req, res) {
    try {
      let idArray = req.body.idArray;
      let roleIdAuth = req.user.roleId;
      if (roleIdAuth != variable.ReceptionistRoleId)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for receptionist accounts");
      let delManyBookings = await bookingsService.deleteManyBookings(idArray);
      if (delManyBookings == variable.NotFound)
        return res.status(variable.NotFound).send("No Bookings is deleted");
      res.send("Delete Booking(s) successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async getBill(req, res) {
    try {
      let bookingId = parseInt(req.params.id);
      let roleIdAuth = req.user.roleId;
      if (
        roleIdAuth != variable.ReceptionistRoleId &&
        roleIdAuth != variable.AdminRoleId
      )
        return res.status(variable.BadRequest).send("No permission!");
      let bill = await bookingsService.getBill(bookingId);
      res.send(bill);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }
}
module.exports = new BookingsController();

function validateBooking(booking) {
  const schema = Joi.object({
    date: Joi.date().allow("").required(),
    timeSlot: Joi.string().required(),
    note: Joi.string().allow("").allow(null).optional(),
    status: Joi.string().allow("").allow(null).optional(),
    createBy: Joi.number().allow(null).optional(),
    staffId: Joi.number().required(),
    advertisementId: Joi.number(),
    serviceArray: Joi.array().allow(null).optional(),
  });
  return schema.validate(booking);
}
