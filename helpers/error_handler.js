class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends CustomError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class AuthenticationError extends CustomError {
  constructor(message) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

class NotFoundError extends CustomError {
  constructor(message) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class ConflictError extends CustomError {
  constructor(message) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

const handleError = (error, res) => {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
      },
    });
  }

  // Handle Sequelize specific errors
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        name: "ValidationError",
        message: error.errors.map((e) => e.message).join(", "),
        statusCode: 400,
      },
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        name: "AuthenticationError",
        message: "Invalid token",
        statusCode: 401,
      },
    });
  }

  // Default error
  console.error("Unhandled error:", error);
  return res.status(500).json({
    success: false,
    error: {
      name: "InternalServerError",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
  });
};

module.exports = {
  CustomError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  handleError,
};
