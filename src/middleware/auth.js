const utils = require("../utils/utils");
const tokenConfig = require("../common/tokenConfig");

module.exports = async function (req, res, next) {
  try {
    let token = req.header("Authorization") || req.headers["x-access-token"];
    if (!token) {
      return res.status(403).send({
        message: "No token provided!",
      });
    }
    token = token.split(" ")[1];
    const decoded = await utils.verifyJwtToken(token, tokenConfig.secret);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access!",
    });
  }
};
