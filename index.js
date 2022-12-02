const express = require("express");
const app = express();
const route = require("./src/routes");
const port = process.env.PORT || 3001;
var bodyParser = require("body-parser");
var cron = require("node-cron");
const Sentry = require("@sentry/node");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const cors = require("cors");
const cronjobsController = require("./src/controllers/CronjobsController");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// config sentry
Sentry.init({
  dsn: "https://d70ebd30aa0b4b328009a5f45eb2d222@o4504259766452224.ingest.sentry.io/4504259770187776",
});
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());

var cancelBookings = cron.schedule(
  "* * * * *",
  async () => {
    let cancelBookings = await cronjobsController.cancelBookings();
    let reset = await cronjobsController.resetCustomerRanks();
  },
  {
    scheduled: false,
  }
);
var resetRanks = cron.schedule(
  "* * 1 1 *",
  async () => {
    let reset = await cronjobsController.resetCustomerRanks();
  },
  {
    scheduled: false,
  }
);
var createWages = cron.schedule(
  "* * 1 * *",
  async () => {
    let createWages = await cronjobsController.createWages();
  },
  {
    scheduled: false,
  }
);

cancelBookings.start();
resetRanks.start();
createWages.start();

route(app);

// module.exports = app;
app.listen(port, () => console.log(`Server starting on port ${port}!`));
