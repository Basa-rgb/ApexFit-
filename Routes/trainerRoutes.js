const express = require('express');
const router = express.Router()

const {protect} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const {createTrainer, getAllTrainers, getTrainerById, updateTrainer , deleteTrainer} = require("../controllers/trainerController");


// Trainer Routes



// Create Trainer
router.post("/", protect,  upload.single("image"), createTrainer);


// Get All Trainers
router.get("/", protect, getAllTrainers);


// Get Trainer by Id

router.get("/:id" , protect , getTrainerById);

// Update Trainer by id

router.put("/:id",protect ,  upload.single("image"), updateTrainer);

//  Delete Trainer by id

router.delete("/:id" , protect , deleteTrainer );

module.exports = router;