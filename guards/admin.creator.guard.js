const { sendErrorResponse } = require("../helpers/send_error_response");

module.exports = (req, res, next) => {
  try {
    if (!req.admin.is_creator) {
      return res.status(403).send({
        message: `you are not a creator 🫤🪽 `,
      });
    }
    next();
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
