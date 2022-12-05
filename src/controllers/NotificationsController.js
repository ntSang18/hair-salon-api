const variable = require("../common/variable");
const Joi = require("joi");
const notificationsService = require("../services/NotificationsService");
class NotificationsController {
  async getNotificationById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const notification = await notificationsService.getNotificationById(id);
      if (!notification) return res.status(variable.NoContent).send();
      res.send(notification);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getListNotificationsByFilter(req, res) {
    try {
      const listnotifications = await notificationsService.getListNotificationsByFilter(req.query);
      if (!listnotifications) return res.status(variable.NoContent).send();
      res.send(listnotifications);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async createNotification(req, res) {
    const customerId = req.user.Id;
    const toUser = req.body.toUser;
    let date = new Date();
    date.setHours(date.getHours() + 7);
    try {
      const data = {
        name: req.body.name,
        message: req.body.message || null,
        customerId: parseInt(customerId),
        toUser: toUser ? parseInt(toUser) : undefined,
        createdAt: date,
        bookingDate: req.body.bookingDate ? new Date(req.body.bookingDate) : undefined,
      };
      const result = await notificationsService.createNotification(data);
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
      throw err;
    }
  }
  async createManyNotification(req, res) {
    // const customerId = req.user.Id;
    // const toUser = req.body.toUser;
    const data = req.body;
    let date = new Date();
    date.setHours(date.getHours() + 7);
    try {
      const datas = data.map((el) => {
        return {
          name: el.name,
          message: el.message || null,
          customerId: el.customerId ? parseInt(el.customerId) : undefined,
          toUser: el.toUser ? parseInt(el.toUser) : undefined,
          createdAt: date,
          bookingDate: req.body.bookingDate ? new Date(req.body.bookingDate) : undefined,
        };
      });

      const result = await notificationsService.createManyNotification(datas);
      res.send(result);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
      throw err;
    }
  }

  
  async updateNotification(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = {
        status: Boolean(req.body.status) || false,
      };
      let update = await notificationsService.updateNotification(id, data);
      if (!update) return res.status(variable.BadRequest).send("Update failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }
}
module.exports = new NotificationsController();
