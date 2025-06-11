const { sendErrorResponse } = require("../helpers/send_error_response");
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
      return sendErrorResponse(error, res, 400);
    }
    const existingEmployee = await Employee.findOne({
      where: { email: value.email },
    });
    if (existingEmployee) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const newEmployee = await Employee.create({
      ...value,
      password: hashedPassword,
      activation_link: uuid.v4(),
    });

    const { password, ...employeeData } = newEmployee.toJSON();

    res.status(201).send({
      message: "New employee created successfully!",
      employee: employeeData,
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
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

    res.status(200).send(employees);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getById = async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(404).send({ message: "id not found" });
    }
    const employees = await Employee.findByPk(id);
    res.status(200).send(employees);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const remove = async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(404).send({ message: "id not found" });
    }
    const employee = await Employee.destroy({ where: { id } });
    res.status(200).send(employee);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const employee = await Employee.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(employee);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    //ident
    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      return res
        .status(401)
        .send({ message: "email or password is incorrect" });
    }

    //auth
    const validPassword = bcrypt.compareSync(password, employee.password);
    if (!validPassword) {
      return res
        .status(401)
        .send({ message: "email or password is incorrect" });
    }

    //token kalit berib yuborish :
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

    res.status(201).send({
      message: "welcome",
      id: employee.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const logoutEmployee = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }
    const employee = await Employee.findOne({
      where: { refresh_token: refreshToken },
    });
    if (!employee) {
      return res.status(400).send({ message: "Token notogri" });
    }
    employee.refresh_token = "";
    await employee.save();

    res.clearCookie("refreshToken");
    res.send({ employee });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const refreshEmployeeToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }

    //verify
    await EmployeeJwtService.verifyRefreshToken(refreshToken);

    const employee = await Employee.findOne({
      where: { refresh_token: refreshToken },
    });
    if (!employee) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
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

    res.status(201).send({
      message: "tokenlar yangilandi",
      id: employee.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const registerEmployee = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 7);
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

    res.status(201).json({
      message: "Registration confirmed ✅",
      employee: {
        id: newEmployee.id,
        first_name: newEmployee.first_name,
        last_name: newEmployee.last_name,
        email: newEmployee.email,
        phone_number: newEmployee.phone_number,
        activation_link: activation_link,
      },
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const activateEmployee = async (req, res) => {
  try {
    const { link } = req.params;
    const employee = await Employee.findOne({
      where: { activation_link: link },
    });
    if (!employee) {
      return res.status(400).send({ message: "employee link noto'g'ri" });
    }
    if (employee.is_active) {
      return res
        .status(400)
        .send({ message: "employee avval faollashtirilgan" });
    }
    employee.is_active = true;
    await employee.save();
    res.send({
      message: "employee faollashtirildi",
      isActive: employee.is_active,
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
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
