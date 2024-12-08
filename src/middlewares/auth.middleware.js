const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "Access denied. No token provided.",
        data: null,
      });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found.", data: null });
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({
        status: "error",
        message: "Invalid or expired token.",
        data: null,
      });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ status: "error", message: "Access denied.", data: null });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
