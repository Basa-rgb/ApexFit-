const express = require('express');
const router = express.Router()

const {protect} = require("../middlewares/authMiddleware");
const {getProfile, updateProfile, deleteAccount} = require("../controllers/userController");

// Users routes
router.get("/profile",protect ,getProfile);
router.put("/profile", protect , updateProfile);
router.delete("/profile",protect , deleteAccount);

module.exports =router;