const {
  handleError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} = require("../helpers/error_handler");
const Client = require("../models/client.model");
const Reviews = require("../models/reviews.model");
const { clientValidation } = require("../validations/client.validation");
const bcrypt = require("bcrypt");
const config = require("config"); //default jsonnning ichidan malumotni chiqarib olish un kk
const { ClientJwtService } = require("../service/jwt.service");
const uuid = require("uuid");
const mailService = require("../service/mail.service");
const Appointment = require("../models/appointments.model");
const Pet = require("../models/pet.model");

// const add = async (req, res) => {
//   try {
//     const { error, value } = clientValidation(req.body);
//     if (error) {
//       throw new ValidationError(error.details[0].message);
//     }

//     const existingClient = await Client.findOne({
//       where: { email: value.email },
//     });

//     if (existingClient) {
//       throw new ConflictError("Email already registered");
//     }

//     const hashedPassword = await bcrypt.hash(value.password, 10);
//     const newClient = await Client.create({
//       ...value,
//       password: hashedPassword,
//     });

//     const { password, ...clientData } = newClient.toJSON();

//     res.status(201).json({
//       success: true,
//       message: "New client created successfully!",
//       data: clientData,
//     });
//   } catch (error) {
//     handleError(error, res);
//   }
// };

const getAll = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [
        {
          model: Reviews,
          attributes: ["id", "rating", "comment", "appointmentId"],
        },
        {
          model: Appointment,
          attributes: ["id", "status", "overall_amount"],
        },
        {
          model: Pet,
          attributes: ["id", "name", "species", "gender", "age"],
        },
      ],
      attributes: [
        "id",
        "first_name",
        "last_name",
        "phone_number",
        "email",
        "is_active",
        "address",
      ],
    });

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("ID is required");
    }

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Reviews,
          attributes: ["id", "rating", "comment", "appointmentId"],
        },
        {
          model: Appointment,
          attributes: ["id", "status", "overall_amount"],
        },
        {
          model: Pet,
          attributes: ["id", "name", "species", "gender", "age"],
        },
      ],
      attributes: [
        "id",
        "first_name",
        "last_name",
        "phone_number",
        "email",
        "is_active",
        "address",
      ],
    });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("ID is required");
    }

    const client = await Client.findByPk(id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    await Client.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("ID is required");
    }

    const client = await Client.findByPk(id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const [updated] = await Client.update(req.body, {
      where: { id },
      returning: true,
    });

    if (!updated) {
      throw new Error("Failed to update client");
    }

    const updatedClient = await Client.findByPk(id, {
      attributes: { exclude: ["password", "refresh_token"] },
    });

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: updatedClient,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const client = await Client.findOne({ where: { email } });
    if (!client) {
      throw new AuthenticationError("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, client.password);
    if (!validPassword) {
      throw new AuthenticationError("Invalid credentials");
    }

    if (!client.is_active) {
      throw new AuthenticationError(
        "Account is not activated. Please check your email for activation link."
      );
    }

    const payload = {
      id: client.id,
      is_active: client.is_active,
      email: client.email,
    };

    const tokens = ClientJwtService.generateTokens(payload);
    client.refresh_token = tokens.refreshToken;
    await client.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time_client"),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: client.id,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

const logoutClient = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const client = await Client.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!client) {
      throw new AuthenticationError("Invalid token");
    }

    client.refresh_token = null;
    await client.save();

    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

const refreshClientToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    await ClientJwtService.verifyRefreshToken(refreshToken);

    const client = await Client.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!client) {
      throw new AuthenticationError("Invalid refresh token");
    }

    const payload = {
      id: client.id,
      is_active: client.is_active,
      email: client.email,
    };

    const tokens = ClientJwtService.generateTokens(payload);
    client.refresh_token = tokens.refreshToken;
    await client.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time_client"),
    });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        id: client.id,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

const registerClient = async (req, res) => {
  try {
    const { error, value } = clientValidation(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password, ...rest } = value;

    const existingClient = await Client.findOne({ where: { email } });
    if (existingClient) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activation_link = uuid.v4();

    const newClient = await Client.create({
      ...rest,
      email,
      password: hashedPassword,
      activation_link,
    });

    const link = `${config.get(
      "api_url"
    )}/api/client/activate/${activation_link}`;
    await mailService.sendMail(email, link);

    const {
      password: _,
      refresh_token: __,
      ...clientData
    } = newClient.toJSON();

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for activation.",
      data: clientData,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const activateClient = async (req, res) => {
  try {
    const { link } = req.params;

    if (!link) {
      throw new ValidationError("Activation link is required");
    }

    const client = await Client.findOne({ where: { activation_link: link } });
    if (!client) {
      throw new NotFoundError("Invalid activation link");
    }

    if (client.is_active) {
      throw new ConflictError("Client account is already activated");
    }

    client.is_active = true;
    await client.save();

    res.status(200).json({
      success: true,
      message: "Client account activated successfully",
      data: {
        isActive: client.is_active,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  // add,
  getAll,
  getById,
  remove,
  update,
  activateClient,
  loginClient,
  logoutClient,
  refreshClientToken,
  registerClient,
};
