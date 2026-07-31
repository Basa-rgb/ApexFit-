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


// Create Workout Plan
router.post("/", protect, createWorkoutPlan);


// Get All Workout Plans
router.get("/", protect, getAllWorkoutPlans);


// Get Workout Plan By ID
router.get("/:id", protect, getWorkoutPlanById);


// Update Workout Plan
router.put("/:id", protect, updateWorkoutPlanById);


// Delete Workout Plan
router.delete("/:id", protect, deleteWorkoutPlanById);


module.exports = router;