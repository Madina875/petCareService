const {
  handleError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} = require("../helpers/error_handler");

const Admin = require("../models/admin.model");
const config = require("config");
const bcrypt = require("bcrypt");
const { JwtService } = require("../service/jwt.service");
const mailService = require("../service/mail.service");
const uuid = require("uuid");
const { adminValidation } = require("../validations/admin.validation");

const add = async (req, res) => {
  try {
    const { error, value } = adminValidation(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const existingAdmin = await Admin.findOne({
      where: { email: value.email },
    });
    if (existingAdmin) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const newAdmin = await Admin.create({
      ...value,
      password: hashedPassword,
      activation_link: uuid.v4(),
    });

    const { password, ...adminData } = newAdmin.toJSON();

    res.status(201).json({
      success: true,
      message: "New admin created successfully!",
      admin: adminData,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getAll = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ["password", "refresh_token"] },
    });
    res.status(200).json({
      success: true,
      data: admins,
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

    const admin = await Admin.findByPk(id, {
      attributes: { exclude: ["password", "refresh_token"] },
    });

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    res.status(200).json({
      success: true,
      data: admin,
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

    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    await Admin.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
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

    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const [updated] = await Admin.update(req.body, {
      where: { id },
      returning: true,
    });

    if (!updated) {
      throw new Error("Failed to update admin");
    }

    const updatedAdmin = await Admin.findByPk(id, {
      attributes: { exclude: ["password", "refresh_token"] },
    });

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      throw new AuthenticationError("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      throw new AuthenticationError("Invalid credentials");
    }

    const payload = {
      id: admin.id,
      is_creator: admin.is_creator,
      email: admin.email,
      role: admin.role,
      username: admin.username,
    };

    const tokens = JwtService.generateTokens(payload);
    admin.refresh_token = tokens.refreshToken;
    await admin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time"),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: admin.id,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const admin = await Admin.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!admin) {
      throw new AuthenticationError("Invalid token");
    }

    admin.refresh_token = null;
    await admin.save();

    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    await JwtService.verifyRefreshToken(refreshToken);

    const admin = await Admin.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!admin) {
      throw new AuthenticationError("Invalid refresh token");
    }

    const payload = {
      id: admin.id,
      is_creator: admin.is_creator,
      email: admin.email,
      role: admin.role,
    };

    const tokens = JwtService.generateTokens(payload);
    admin.refresh_token = tokens.refreshToken;
    await admin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time"),
    });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        id: admin.id,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activation_link = uuid.v4();

    const newAdmin = await Admin.create({
      ...rest,
      email,
      password: hashedPassword,
      activation_link,
    });

    const link = `${config.get(
      "api_url"
    )}/api/admin/activate/${activation_link}`;
    await mailService.sendMail(email, link);

    const { password: _, ...adminData } = newAdmin.toJSON();

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for activation.",
      data: adminData,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const activateAdmin = async (req, res) => {
  try {
    const { link } = req.params;

    if (!link) {
      throw new ValidationError("Activation link is required");
    }

    const admin = await Admin.findOne({ where: { activation_link: link } });
    if (!admin) {
      throw new NotFoundError("Invalid activation link");
    }

    if (admin.is_active) {
      throw new ConflictError("Admin account is already activated");
    }

    admin.is_active = true;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin account activated successfully",
      data: {
        isActive: admin.is_active,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  add,
  getAll,
  getById,
  remove,
  update,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  registerAdmin,
  activateAdmin,
};
