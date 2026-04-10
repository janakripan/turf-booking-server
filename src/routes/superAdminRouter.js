const express = require("express");

const router = express.Router();


const {
  superAdminOnlyMiddleware,
} = require("../middlewares/authenticationMiddleware");
const { userListController, updateRoleController } = require("../controllers/superAdminController");

router.get("/userList", superAdminOnlyMiddleware, userListController);
router.put("/updateRole", superAdminOnlyMiddleware, updateRoleController);

module.exports = router;
