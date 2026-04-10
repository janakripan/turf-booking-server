const express = require("express");
const router = express.Router();
const { getAllTurfs, getTurfById } = require("../controllers/userController");

// Publicly list all turfs
router.get("/", getAllTurfs);

// Get a specific turf by ID
router.get("/:id", getTurfById);

module.exports = router;
