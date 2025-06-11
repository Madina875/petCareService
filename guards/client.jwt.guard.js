const { ClientJwtService } = require("../service/jwt.service");
const { sendErrorResponse } = require("../helpers/send_error_response");

module.exports = async (req, res, next) => {
  try {
    const authorHeader = req.headers.authorization;

    if (!authorHeader) {
      return res.status(401).send({ message: "Auth header not found" });
    }

    const token = authorHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Token not found" });
    }

    const decodedToken = await ClientJwtService.verifyAccessToken(token);
    req.client = decodedToken;
    next();
  } catch (error) {
    sendErrorResponse(error, res, 403);
  }
};

/*
🔐This is an authentication middleware — it protects routes by checking if a valid JWT access token is present.
*/
