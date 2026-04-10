const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const getUserMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findOne({ email: decoded.email });
    req.user = user;
  } catch (err) {
    console.log("not authoraised");
  }

  next();
};

const superAdminOnlyMiddleware = (req, res, next) => {
  if (req.user.role === "superadmin") {
    next();
  } else {
    res.status(401).json({ message: "user is not a superAdmin" });
  }
};

const adminOnlyMiddleware = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "user is not a turf admin" });
  }
};

const managerOnlyMiddleware = (req, res, next) => {
  if (
    req.user.role === "manager" ||
    req.user.role === "admin" ||
    req.user.role === "superadmin"
  ) {
    next();
  } else {
    res.status(401).json({ message: "Access denied: Managers only" });
  }
};

module.exports = {
  superAdminOnlyMiddleware,
  adminOnlyMiddleware,
  managerOnlyMiddleware,
  getUserMiddleware,
};
