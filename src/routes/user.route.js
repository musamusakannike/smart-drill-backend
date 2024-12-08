const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { getUserDetails, updateUserDetails, getAllUsers } = require("../controllers/user.controller");

const router = express.Router();

// User routes
router.get("/me", authenticate, getUserDetails);
router.put("/me", authenticate, updateUserDetails);

// Admin routes
router.get("/", authenticate, authorize("admin"), getAllUsers);
router.put("/:id", authenticate, authorize("admin"), updateUserDetails);

module.exports = router;
