const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = role => async (req, res, next) => {
  const token = req.header("x-auth-token");
  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    const userId = decoded.user.id;
    const user = await User.findOne({ _id: userId });

    if (user && user.role === role) {
      next();
    } else {
      res.status(403).json({ msg: "You are not authorized to see this." });
    }
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid " });
  }
};
