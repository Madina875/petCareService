const { sendErrorResponse } = require("../helpers/send_error_response");

module.exports = (req, res, next) => {
  try {
    if (!req.employee.is_active) {
      return res.status(403).send({
        message: `you don't have permission.🫤🪽 \  here you can only see employee info`,
      });
    }
    next();
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
