const express = require("express");
const router = express.Router();

const {
  createWorkoutPlan,
  getAllWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlanById,
  deleteWorkoutPlanById,
} = require("../controllers/workoutController");

const { protect } = require("../middlewares/authMiddleware");
const { isAdmin, isTrainerOrAdmin } = require("../middlewares/adminMiddleware");


// Create Workout Plan (admin or trainer)
router.post("/", protect, isTrainerOrAdmin, createWorkoutPlan);


// Get All Workout Plans (public)
router.get("/", getAllWorkoutPlans);


// Get Workout Plan By ID (public)
router.get("/:id", getWorkoutPlanById);


// Update Workout Plan (admin or owning trainer)
router.put("/:id", protect, isTrainerOrAdmin, updateWorkoutPlanById);


// Delete Workout Plan (admin or owning trainer)
router.delete("/:id", protect, isTrainerOrAdmin, deleteWorkoutPlanById);


module.exports = router;