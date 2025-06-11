const config = require("config");
const jwt = require("jsonwebtoken");

class jwtService {
  constructor(accessKey, refreshKey, accessTime, refreshTime) {
    this.accessKey = accessKey;
    this.refreshKey = refreshKey;
    this.accessTime = accessTime;
    this.refreshTime = refreshTime;
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(payload, this.accessKey, {
      expiresIn: this.accessTime,
    });

    const refreshToken = jwt.sign(payload, this.refreshKey, {
      expiresIn: this.refreshTime,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token) {
    return jwt.verify(token, this.accessKey);
  }

  async verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshKey);
  }
}
const JwtService = new jwtService(
  config.get("access_key"),
  config.get("refresh_key"),
  config.get("access_time"),
  config.get("cookie_refresh_time")
);
const ClientJwtService = new jwtService(
  config.get("access_key_client"),
  config.get("refresh_key_client"),
  config.get("access_time_client"),
  config.get("cookie_refresh_time_client")
);
const EmployeeJwtService = new jwtService(
  config.get("access_key_employee"),
  config.get("refresh_key_employee"),
  config.get("access_time_employee"),
  config.get("cookie_refresh_time_employee")
);

module.exports = {
  JwtService,
  ClientJwtService,
  EmployeeJwtService,
};
