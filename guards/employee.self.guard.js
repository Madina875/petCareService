const { sendErrorResponse } = require("../helpers/send_error_response");

module.exports = (req, res, next) => {
  try {
    if (req.params.id != req.employee.id) {
      return res.status(403).send({
        message: `you don't have permission.🫤🪽 \  here you can only see owners info`,
      });
    }
    next();
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
