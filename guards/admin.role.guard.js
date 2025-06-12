const { sendErrorResponse } = require("../helpers/send_error_response");

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;

      if (!admin || !allowedRoles.includes(admin.role)) {
        return res.status(403).send({
          // message: `Access denied for role: ${admin?.role || "unknown"} 🫤🪽`,
          message: `Access denied for role: ${allowedRoles} 🫤🪽`,
        });
      }

      next();
    } catch (error) {
      sendErrorResponse(error, res);
    }
  };
};
