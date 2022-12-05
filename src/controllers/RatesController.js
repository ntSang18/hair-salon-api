const variable = require("../common/variable");
const Joi = require("joi");
const ratesService = require("../services/RatesService");
class ratesController {
  async getRateById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const rate = await ratesService.getRateById(id);
      if (!rate) return res.status(variable.NoContent).send();
      res.send(rate);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async getListRatesByFilter(req, res) {
    try {
      const listrates = await ratesService.getListRatesByFilter(req.query);
      if (!listrates) return res.status(variable.NoContent).send();
      res.send(listrates);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async createRate(req, res) {
    const customerId = req.user.Id;
    const { error } = validateRate(req.body);
    if (error) return res.status(variable.BadRequest).send(error.details[0].message);
    try {
      const data = {
        rate: req.body.rate,
        comment: req.body.comment,
        bookingId: parseInt(req.body.bookingId),
        customerId: parseInt(customerId),
      };
      const result = await ratesService.createRate(data);
      if (result === variable.BadRequest) return res.status(variable.BadRequest).send("This booking is not completed");
      res.send(result);
    } catch (err) {
      if (err.code === "P2002") return res.status(variable.BadRequest).send("You have rated this booking");
      res.status(variable.BadRequest).send(err.message);
      throw err;
    }
  }

  async updaterate(req, res) {
    try {
      const id = parseInt(req.params.id);
      const rateIdAuth = req.user.rateId;
      if (rateIdAuth != variable.AdminrateId) return res.status(variable.Forbidden).send("No permission!");
      let data = {
        name: req.body.name,
      };
      let update = await ratesService.updaterate(id, data);
      if (!update) return res.status(variable.BadRequest).send("Update rate failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }

  async deleteManyrates(req, res) {
    try {
      let idArray = req.body.idArray;
      let rateIdAuth = req.user.rateId;
      if (rateIdAuth != variable.AdminrateId)
        return res.status(variable.BadRequest).send("No permission! Only works for admin accounts");
      let delManyrates = await ratesService.deleteManyrates(idArray);
      if (delManyrates == variable.NoContent) return res.status(variable.NoContent).send();
      res.send("Delete rate(s) successful!");
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }
  async getStaffsWithRate(req, res) {
    try {
      const staffsWithRate = await ratesService.getStaffsWithRate(req.query);
      res.send(staffsWithRate);
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
      throw err;
    }
  }
}
module.exports = new ratesController();

function validateRate(rate) {
  const schema = Joi.object({
    rate: Joi.number().required(),
    comment: Joi.string().allow(null).allow(""),
    bookingId: Joi.number().required(),
  });
  return schema.validate(rate);
}
