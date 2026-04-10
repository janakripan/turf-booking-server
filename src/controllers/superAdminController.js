const UserModel = require("../models/userModel");
const { getValidationErrorMessage } = require("../utils/validationUtils");

const userListController = async (req, res) => {
  try {
    const roleFilter = req.query.role;
    let users;
    if (roleFilter) {
      users = await UserModel.find({ role: roleFilter });
    } else {
      users = await UserModel.find();
    }
    res.json({ message: "fetched users succesfully", users });
  } catch (err) {
    res.status(500).json({ message: "something went wrong in the server, please try again" });
  }
};

const updateRoleController = async (req, res) => {
  try {
    const { userID, userRole, adminId } = req.body;

    const user = await UserModel.findById(userID);
      if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userRole === "admin") {
      user.role = "admin";
      user.createdByAdmin = null; // reset if coming from manager
      await user.save();

      return res.json({
        message: "User promoted to admin successfully",
        user,
      });
    }


    if (userRole === "manager") {
  if (!adminId) {
    return res
      .status(400)
      .json({ message: "adminId is required to assign a manager" });
  }

  const admin = await UserModel.findById(adminId);
  if (!admin || admin.role !== "admin") {
    return res.status(400).json({ message: "Invalid admin ID provided" });
  }

  user.role = "manager";
  user.createdByAdmin = adminId;
  await user.save();

  return res.json({
    message: "User promoted to manager under admin successfully",
    user,
  });
}

      if (userRole === "user") {
      user.role = "user";
      user.createdByAdmin = null;
      await user.save();

      return res.json({
        message: "User demoted to normal user successfully",
        user,
      });
    }

    return res.status(400).json({ message: "Invalid role update request" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);

      res.status(400).json({ message: message });
    } else {
      res.status(400).json({
        message: "something went wrong in the server, please try again later",
      });
    }
  }
};

module.exports = { updateRoleController,userListController };
