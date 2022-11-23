const staffsRouter = require("./staffs");
const customersRouter = require("./customers");
const departmentsRouter = require("./departments");
const rolesRouter = require("./roles");
const customerTypesRouter = require("./customerTypes");
const ratesRouter = require("./rates");
const notificationsRouter = require("./notifications");
const bookingsRouter = require("./bookings");
const imagesRouter = require("./images");
const serviceTypesRouter = require("./serviceTypes");
const servicesRouter = require("./services");
const billsRouter = require("./bills");
const advertisementsRouter = require("./advertisements");

function route(app) {
  app.use("/api/v1/staffs", staffsRouter);
  app.use("/api/v1/customers", customersRouter);
  app.use("/api/v1/departments", departmentsRouter);
  app.use("/api/v1/roles", rolesRouter);
  app.use("/api/v1/customerTypes", customerTypesRouter);
  app.use("/api/v1/rates", ratesRouter);
  app.use("/api/v1/notifications", notificationsRouter);
  app.use("/api/v1/bookings", bookingsRouter);
  app.use("/src/images", imagesRouter);
  app.use("/api/v1/serviceTypes", serviceTypesRouter);
  app.use("/api/v1/services", servicesRouter);
  app.use("/api/v1/bills", billsRouter);
  app.use("/api/v1/advertisements", advertisementsRouter);
}

module.exports = route;
