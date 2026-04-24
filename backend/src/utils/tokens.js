const jwt = require("jsonwebtoken");
const { env } = require("./env");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

module.exports = { signAccessToken };

