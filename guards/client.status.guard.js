const { sendErrorResponse } = require("../helpers/send_error_response");

module.exports = (req, res, next) => {
  try {
    if (!req.client.is_active) {
      return res.status(403).send({
        message: `you don't have permission.🫤🪽 \you didnot active`,
      });
    }
    next();
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
