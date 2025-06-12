const {
  handleError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} = require("../helpers/error_handler");
const Employee = require("../models/employee.model");
const { employeeValidation } = require("../validations/employee.validation");
const config = require("config");
const bcrypt = require("bcrypt");
const { EmployeeJwtService } = require("../service/jwt.service");
const uuid = require("uuid");
const mailService = require("../service/mail.service");
const Service = require("../models/service.model");
const Appointment = require("../models/appointments.model");
const Serviceemployee = require("../models/service_employee.model");

const add = async (req, res) => {
  try {
    const { error, value } = employeeValidation(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const existingEmployee = await Employee.findOne({
      where: { email: value.email },
    });
    if (existingEmployee) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const newEmployee = await Employee.create({
      ...value,
      password: hashedPassword,
      activation_link: uuid.v4(),
    });

    const { password, ...employeeData } = newEmployee.toJSON();

    res.status(201).json({
      success: true,
      message: "New employee created successfully!",
      data: employeeData,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getAll = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          model: Service,
          through: {
            model: Serviceemployee,
            attributes: [],
          },
          attributes: ["id", "price", "description"],
        },
        {
          model: Appointment,
          attributes: [
            "id",
            "status",
            "start_date",
            "end_date",
            "overall_amount",
          ],
        },
      ],
      attributes: ["id", "first_name", "email", "phone_number"],
    });

    res.status(200).json({
      success: true,
      data: employees,
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

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Service,
          through: {
            model: Serviceemployee,
            attributes: [],
          },
          attributes: ["id", "price", "description"],
        },
        {
          model: Appointment,
          attributes: [
            "id",
            "status",
            "start_date",
            "end_date",
            "overall_amount",
          ],
        },
      ],
      attributes: ["id", "first_name", "email", "phone_number", "is_active"],
    });

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    res.status(200).json({
      success: true,
      data: employee,
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

    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    await Employee.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
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

    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const [updated] = await Employee.update(req.body, {
      where: { id },
      returning: true,
    });

    if (!updated) {
      throw new Error("Failed to update employee");
    }

    const updatedEmployee = await Employee.findByPk(id, {
      attributes: { exclude: ["password", "refresh_token"] },
    });

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      throw new AuthenticationError("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, employee.password);
    if (!validPassword) {
      throw new AuthenticationError("Invalid credentials");
    }

    if (!employee.is_active) {
      throw new AuthenticationError(
        "Account is not activated. Please check your email for activation link."
      );
    }

    const payload = {
      id: employee.id,
      is_active: employee.is_active,
      email: employee.email,
    };

    const tokens = EmployeeJwtService.generateTokens(payload);
    employee.refresh_token = tokens.refreshToken;
    await employee.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time_employee"),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: employee.id,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

const logoutEmployee = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const employee = await Employee.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!employee) {
      throw new AuthenticationError("Invalid token");
    }

    employee.refresh_token = null;
    await employee.save();

    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

const refreshEmployeeToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    await EmployeeJwtService.verifyRefreshToken(refreshToken);

    const employee = await Employee.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!employee) {
      throw new AuthenticationError("Invalid refresh token");
    }

    const payload = {
      id: employee.id,
      is_active: employee.is_active,
      email: employee.email,
    };

    const tokens = EmployeeJwtService.generateTokens(payload);
    employee.refresh_token = tokens.refreshToken;
    await employee.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time_employee"),
    });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        id: employee.id,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

const registerEmployee = async (req, res) => {
  try {
    const { error, value } = employeeValidation(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password, ...rest } = value;

    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activation_link = uuid.v4();

    const newEmployee = await Employee.create({
      ...rest,
      email,
      password: hashedPassword,
      activation_link,
    });

    const link = `${config.get(
      "api_url"
    )}/api/employee/activate/${activation_link}`;
    await mailService.sendMail(email, link);

    const {
      password: _,
      refresh_token: __,
      ...employeeData
    } = newEmployee.toJSON();

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for activation.",
      data: employeeData,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const activateEmployee = async (req, res) => {
  try {
    const { link } = req.params;

    if (!link) {
      throw new ValidationError("Activation link is required");
    }

    const employee = await Employee.findOne({
      where: { activation_link: link },
    });
    if (!employee) {
      throw new NotFoundError("Invalid activation link");
    }

    if (employee.is_active) {
      throw new ConflictError("Employee account is already activated");
    }

    employee.is_active = true;
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee account activated successfully",
      data: {
        isActive: employee.is_active,
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
  loginEmployee,
  logoutEmployee,
  refreshEmployeeToken,
  registerEmployee,
  activateEmployee,
};
