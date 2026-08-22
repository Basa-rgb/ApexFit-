const express = require('express');
const router = express.Router()

const {protect} = require("../middlewares/authMiddleware");
const {getProfile, getUserDashboard, getTrainerDashboard, updateProfile, deleteAccount} = require("../controllers/userController");

// Users routes
router.get("/profile",protect ,getProfile);
router.get("/dashboard", protect, getUserDashboard);
router.get("/trainer-dashboard", protect, getTrainerDashboard);
router.put("/profile", protect , updateProfile);
router.delete("/profile",protect , deleteAccount);

module.exports =router;