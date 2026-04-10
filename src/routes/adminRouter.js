express = require("express");
const router = express.Router();

const {
  createTurfController,
  turfListController,
  removeManagerController,
  addManagerController,
  deleteTurfController,
  updateTurfController,
  getTurfByIdController,
} = require("../controllers/adminController");
const {
  adminOnlyMiddleware,
} = require("../middlewares/authenticationMiddleware");

// Create a turf
router.post("/turf", adminOnlyMiddleware, createTurfController);

// Get all turfs for logged-in admin
router.get("/turf", adminOnlyMiddleware, turfListController);

// Get a specific turf by ID
router.get("/turf/:id", adminOnlyMiddleware, getTurfByIdController);

// Update a turf by ID
router.put("/turf/:id", adminOnlyMiddleware, updateTurfController);

// Delete a turf by ID
router.delete("/turf/:id", adminOnlyMiddleware, deleteTurfController);

// Add a manager to a turf
router.post("/turf/manager/add", adminOnlyMiddleware, addManagerController);

// Remove a manager from a turf
router.post(
  "/turf/manager/remove",
  adminOnlyMiddleware,
  removeManagerController
);

//

module.exports = router;
