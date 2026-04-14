const TurfModel = require("../models/turfModel");
const { getValidationErrorMessage } = require("../utils/validationUtils");

const createTurfController = async (req, res) => {
  try {
    const data = req.body;
    if (!data.admin) {
        data.admin = req.user._id;
    }
    const newTurf = await (await TurfModel.create(data)).populate("admin");
    res.status(200).json({ message: "gym created successfully", newTurf });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);

      res.status(400).json({ message: message });
    } else {
      res.status(500).json({
        message: "something went wrong in the server, please try again later",
        err,
      });
    }
  }
};

const turfListController = async (req, res) => {
  try {
    const user = req.user;
    let turfList;
    if (user.role === "superadmin") {
      turfList = await TurfModel.find();
    } else {
      turfList = await TurfModel.find({ admin: user._id });
    }
    res
      .status(200)
      .json({ message: "fetched turf list successfully", turfList });
  } catch (err) {
    res.status(500).json({
      message: "something went wrong in the server, please try again later",
      err,
    });
  }
};

const getTurfByIdController = async (req, res) => {
  try {
    const turfId = req.params.id;
    const turf = await TurfModel.findById(turfId)
      .populate("admin")
      .populate("managers");

    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    res.status(200).json({ message: "Fetched turf successfully", turf });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong in the server, please try again later",
      err,
    });
  }
};


const updateTurfController = async (req, res) => {
  try {
    const turfId = req.params.id;
    const updates = req.body;

    // Run validation on update (important!)
    const updatedTurf = await TurfModel.findByIdAndUpdate(
      turfId,
      updates,
      { new: true, runValidators: true, context: "query" } // context needed for "required" validation
    ).populate("admin managers");

    if (!updatedTurf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    res.status(200).json({ message: "Turf updated successfully", updatedTurf });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);
      res.status(400).json({ message });
    } else {
      res.status(500).json({
        message: "Something went wrong in the server, please try again later",
        err,
      });
    }
  }
};


const deleteTurfController = async (req, res) => {
  try {
    const turfId = req.params.id;
    const deletedTurf = await TurfModel.findByIdAndDelete(turfId);

    if (!deletedTurf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    res.status(200).json({ message: "Turf deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong in the server, please try again later",
      err,
    });
  }
};


// Add a manager
const addManagerController = async (req, res) => {
  try {
    const { turfId, managerId } = req.body;
    const turf = await TurfModel.findByIdAndUpdate(
      turfId,
      { $addToSet: { managers: managerId } }, // prevents duplicates
      { new: true }
    ).populate("managers");

    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    res.status(200).json({ message: "Manager added successfully", turf });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Remove a manager
const removeManagerController = async (req, res) => {
  try {
    const { turfId, managerId } = req.body;
    const turf = await TurfModel.findByIdAndUpdate(
      turfId,
      { $pull: { managers: managerId } },
      { new: true }
    ).populate("managers");

    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    res.status(200).json({ message: "Manager removed successfully", turf });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};


const adminUpdateUserRoleController = async (req, res) => {
  try {
    const { userID, userRole } = req.body;
    console.log(req.user)
    const adminId = req.user._id; // logged-in admin

    // make sure the requester is actually an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can perform this action" });
    }

    const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admins from promoting to admin/superadmin
    if (userRole === "admin" || userRole === "superadmin") {
      return res.status(403).json({ message: "Admins cannot promote to admin or superadmin" });
    }

    if (userRole === "manager") {
      user.role = "manager";
      user.createdByAdmin = adminId; // link manager to this admin
      await user.save();

      return res.json({
        message: "User promoted to manager successfully",
        user,
      });
    }

    if (userRole === "user") {
      // demote back to normal user
      if (user.createdByAdmin?.toString() !== adminId.toString()) {
        return res.status(403).json({
          message: "You cannot demote this manager (belongs to another admin)",
        });
      }

      user.role = "user";
      user.createdByAdmin = null;
      await user.save();

      return res.json({
        message: "Manager demoted to user successfully",
        user,
      });
    }

    return res.status(400).json({ message: "Invalid role update request" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);
      res.status(400).json({ message });
    } else {
      res.status(500).json({
        message: "Something went wrong in the server, please try again later",
        err,
      });
    }
  }
};



module.exports = { createTurfController,turfListController,getTurfByIdController,updateTurfController,deleteTurfController ,addManagerController,removeManagerController,adminUpdateUserRoleController};
