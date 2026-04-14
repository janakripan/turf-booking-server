const BookingModel = require("../models/bookingModel");
const TurfModel = require("../models/turfModel");

const getManagerBookingsController = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Find turfs where this user is a manager
    const managedTurfs = await TurfModel.find({ managers: managerId }).select(
      "_id",
    );
    const turfIds = managedTurfs.map((t) => t._id);

    // Also include turfs where the user is an admin (if applicable)
    const adminTurfs = await TurfModel.find({ admin: managerId }).select("_id");
    const allTurfIds = [
      ...new Set([...turfIds, ...adminTurfs.map((t) => t._id)]),
    ];

    const bookings = await BookingModel.find({ turf: { $in: allTurfIds } })
      .populate("user", "userName email contactNo")
      .populate("turf", "name location")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ message: "Manager bookings fetched", bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const updateBookingStatusController = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!["confirmed", "cancelled", "rescheduled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const booking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true },
    ).populate("user turf");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res
      .status(200)
      .json({ message: `Booking ${status} successfully`, booking });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const banUserController = async (req, res) => {
  try {
    const { turfId, userId } = req.body;
    
    // Verify the turf exists and the requester has rights (is admin or manager of it, or superadmin)
    const turf = await TurfModel.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    const requesterId = req.user._id.toString();
    const isSuperAdmin = req.user.role === "superadmin";
    const isAdmin = turf.admin.toString() === requesterId;
    const isManager = turf.managers.some(m => m.toString() === requesterId);

    if (!isSuperAdmin && !isAdmin && !isManager) {
      return res.status(403).json({ message: "Not authorized to ban users for this turf" });
    }

    if (!turf.bannedUsers.includes(userId)) {
      turf.bannedUsers.push(userId);
      await turf.save();
    }

    res.status(200).json({ message: "User banned successfully", turf });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const unbanUserController = async (req, res) => {
  try {
    const { turfId, userId } = req.body;

    const turf = await TurfModel.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    const requesterId = req.user._id.toString();
    const isSuperAdmin = req.user.role === "superadmin";
    const isAdmin = turf.admin.toString() === requesterId;
    const isManager = turf.managers.some(m => m.toString() === requesterId);

    if (!isSuperAdmin && !isAdmin && !isManager) {
      return res.status(403).json({ message: "Not authorized to unban users for this turf" });
    }

    turf.bannedUsers = turf.bannedUsers.filter(id => id.toString() !== userId);
    await turf.save();

    res.status(200).json({ message: "User unbanned successfully", turf });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

module.exports = {
  getManagerBookingsController,
  updateBookingStatusController,
  banUserController,
  unbanUserController,
};
