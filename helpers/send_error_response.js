// const logger = require("../service/logger.service");

const sendErrorResponse = (error, res, status) => {
  console.log(error);
  res.status(status).send({ message: "xatolik", error: error });
};

module.exports = {
  sendErrorResponse,
};
