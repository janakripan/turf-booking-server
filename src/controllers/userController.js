const TurfModel = require("../models/turfModel");

const getAllTurfs = async (req, res) => {
  try {
    const { location, search } = req.query;
    let query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const turfs = await TurfModel.find(query).populate(
      "admin",
      "userName email",
    );
    res.status(200).json({ message: "Turfs fetched successfully", turfs });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong in the server, please try again later",
      err,
    });
  }
};

const getTurfById = async (req, res) => {
  try {
    const turfId = req.params.id;
    const turf = await TurfModel.findById(turfId)
      .populate("admin", "userName email")
      .populate("managers", "userName email");

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

module.exports = { getAllTurfs, getTurfById };
