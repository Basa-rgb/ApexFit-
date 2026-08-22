const express = require('express');
const router = express.Router()

const {protect} = require("../middlewares/authMiddleware");
const {isAdmin} = require("../middlewares/adminMiddleware");
const upload = require("../middlewares/upload");
const {createTrainer, getAllTrainers, getTrainerById, updateTrainer , deleteTrainer, updateMyTrainerProfile} = require("../controllers/trainerController");


// Trainer Routes

// Signed-in trainer updates their own profile
router.put("/me", protect, upload.single("image"), updateMyTrainerProfile);

// Create Trainer (Admin only)
router.post("/", protect, isAdmin, upload.single("image"), createTrainer);


// Get All Trainers
router.get("/",  getAllTrainers);


// Get Trainer by Id

router.get("/:id" ,  getTrainerById);

// Update Trainer by id (Admin only)

router.put("/:id", protect, isAdmin, upload.single("image"), updateTrainer);

//  Delete Trainer by id (Admin only)

router.delete("/:id" , protect, isAdmin, deleteTrainer );

module.exports = router;