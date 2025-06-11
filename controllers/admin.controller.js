const { sendErrorResponse } = require("../helpers/send_error_response");
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
      return sendErrorResponse(error, res, 400);
    }

    const existingAdmin = await Admin.findOne({
      where: { email: value.email },
    });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const newAdmin = await Admin.create({
      ...value,
      password: hashedPassword,
      activation_link: uuid.v4(),
    });

    // const { password, ...adminData } = newAdmin.toJSON();

    res.status(201).send({
      message: "New admin created successfully!",
      admin: adminData,
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).send(admins);
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
    const admins = await Admin.findByPk(id);
    res.status(200).send(admins);
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
    const admin = await Admin.destroy({ where: { id } });
    res.status(200).send({ message: "deleted✅" });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const admin = await Admin.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(admin);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    //ident
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res
        .status(401)
        .send({ message: "email or password is incorrect" });
    }
    //auth
    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      return res
        .status(401)
        .send({ message: "email or password is incorrect" });
    }
    //token kalit berib yuborish :
    const payload = {
      id: admin.id,
      is_creator: admin.is_creator,
      email: admin.email,
    };
    const tokens = JwtService.generateTokens(payload);
    admin.refresh_token = tokens.refreshToken;
    await admin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time"),
    });

    res.status(201).send({
      message: "welcome",
      id: admin.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }

    const admin = await Admin.findOne({
      where: { refresh_token: refreshToken },
    });
    if (!admin) {
      return res.status(400).send({ message: "Token notogri" });
    }
    admin.refresh_token = "";
    await admin.save();

    res.clearCookie("refreshToken");
    res.send({ message: "you are logged out !" });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }

    //verify
    await JwtService.verifyRefreshToken(refreshToken);

    const admin = await Admin.findOne({
      where: { refresh_token: refreshToken },
    });
    if (!admin) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
    }
    const payload = {
      id: admin.id,
      is_creator: admin.is_creator,
      email: admin.email,
    };
    const tokens = JwtService.generateTokens(payload);
    admin.refresh_token = tokens.refreshToken;
    await admin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time"),
    });

    res.status(201).send({
      message: "tokenlar yangilandi",
      id: admin.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 7);
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

    res.status(201).json({
      message: "You are registered successfully! ✅",
      newAdmin,
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const activateAdmin = async (req, res) => {
  try {
    const { link } = req.params;
    const admin = await Admin.findOne({ where: { activation_link: link } });
    if (!admin) {
      return res.status(400).send({ message: "Admin link noto'g'ri" });
    }
    if (admin.is_active) {
      return res.status(400).send({ message: "Admin avval faollashtirilgan" });
    }
    admin.is_active = true;
    await admin.save();
    res.send({ message: "Admin faollashtirildi", isActive: admin.is_active });
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
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  registerAdmin,
  activateAdmin,
};
