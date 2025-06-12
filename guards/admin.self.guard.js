const { sendErrorResponse } = require("../helpers/send_error_response");

module.exports = (req, res, next) => {
  try {
    const admin = req.admin;

    // If the admin is a superadmin, allow access to all resources
    if (admin.role === "superadmin") {
      return next();
    }

    // For non-superadmin roles, check if they're accessing their own resource
    if (req.params.id && req.params.id != admin.id) {
      return res.status(403).send({
        message: `Access denied. You can only access your own resources.`,
      });
    }

    next();
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
