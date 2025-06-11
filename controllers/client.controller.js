const { sendErrorResponse } = require("../helpers/send_error_response");
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

const add = async (req, res) => {
  try {
    const { error, value } = clientValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }

    const newClient = await Client.create({
      ...value,
    });
    res.status(201).send({ message: "New client created!", newClient });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};
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

    res.status(200).send(clients);
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
    const clients = await Client.findByPk(id);
    res.status(200).send(clients);
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
    const client = await Client.destroy({ where: { id } });
    res.status(200).send(client);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const update = async (req, res) => {
  try {
    const client = await Client.update(
      { ...req.body },
      {
        where: { id: req.params.id },
        returning: true,
      }
    );
    res.status(200).send(client);
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    //ident
    const client = await Client.findOne({ where: { email } });
    if (!client) {
      return res
        .status(401)
        .send({ message: "email or password is incorrect" });
    }

    //auth
    const validPassword = bcrypt.compareSync(password, client.password);
    if (!validPassword) {
      return res
        .status(401)
        .send({ message: "email or password is incorrect" });
    }

    //token kalit berib yuborish :
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

    res.status(201).send({
      message: "welcome",
      id: client.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const logoutClient = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }
    const client = await Client.findOne({
      where: { refresh_token: refreshToken },
    });
    if (!client) {
      return res.status(400).send({ message: "Token notogri" });
    }
    client.refresh_token = "";
    await client.save();

    res.clearCookie("refreshToken");
    res.send({ client });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const refreshClientToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }

    //verify
    await ClientJwtService.verifyRefreshToken(refreshToken);

    const client = await Client.findOne({ refresh_token: refreshToken });
    if (!client) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
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

    res.status(201).send({
      message: "tokenlar yangilandi",
      id: client.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const registerClient = async (req, res) => {
  try {
    const { error, value } = clientValidation(req.body);
    if (error) {
      return sendErrorResponse(error, res, 400);
    }

    const { email, password, ...rest } = value;

    const hashedPassword = bcrypt.hashSync(password, 7);
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

    res.status(201).json({
      message: "Registered successfully ✅",
      client: {
        id: newClient.id,
        first_name: newClient.first_name,
        last_name: newClient.last_name,
        email: newClient.email,
        phone_number: newClient.phone_number,
        activation_link: activation_link,
      },
    });
  } catch (error) {
    sendErrorResponse(error, res, 400);
  }
};

const activateClient = async (req, res) => {
  try {
    const { link } = req.params;
    const client = await Client.findOne({ where: { activation_link: link } });
    if (!client) {
      return res.status(400).send({ message: "Client link noto'g'ri" });
    }
    if (client.is_active) {
      return res.status(400).send({ message: "Client avval faollashtirilgan" });
    }
    client.is_active = true;
    await client.save();
    res.send({ message: "Client faollashtirildi", isActive: client.is_active });
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
  activateClient,
  loginClient,
  logoutClient,
  refreshClientToken,
  registerClient,
};
