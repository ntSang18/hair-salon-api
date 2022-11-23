const variable = require("../common/variable");
const cronjobsService = require("../services/CronjobsService");
class CronjobsController {
  async cancelBookings(req, res) {
    try {
      const cancel = await cronjobsService.cancelBookings();
      return cancel;
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }
  async createWages(req, res) {
    try {
      const create = await cronjobsService.createWages();
      return create;
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }

  async resetCustomerRanks(req, res) {
    try {
      const reset = await cronjobsService.resetCustomerRanks();
      return reset;
    } catch (err) {
      res.status(variable.InternalServerError).send(err.message);
    }
  }
}
module.exports = new CronjobsController();
