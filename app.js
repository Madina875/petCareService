const express = require("express");
const config = require("config");
const sequelize = require("./config/db");
const cookieParser = require("cookie-parser");
const logger = require("./service/logger.service");

const PORT = config.get("port");

const indexRouter = require("./routes/index.route");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api", indexRouter);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      logger.portStarted(PORT);
    });
  } catch (error) {
    logger.error(error);
  }
}
start();
