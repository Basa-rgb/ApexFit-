const mongoose = require("mongoose");
const WorkoutPlan = require("../models/WorkoutPlan");
const User = require("../models/User");
const Trainer = require("../models/Trainer");


// Create Workout Plan
const createWorkoutPlan = async (req, res) => {
  try {
    const {
      userId,
      trainerId,
      title,
      goal,
      duration,
      exercises,
    } = req.body;


    // Check required fields
    if (
      !userId ||
      !trainerId ||
      !title ||
      !goal ||
      !duration ||
      !exercises
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(trainerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID or Trainer ID",
      });
    }


    // Check User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // Check Trainer
    const trainer = await Trainer.findById(trainerId);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }


    // Create Workout Plan
    const workoutPlan = await WorkoutPlan.create({
      userId,
      trainerId,
      title,
      goal,
      duration,
      exercises,
      status: "Active",
    });


    return res.status(201).json({
      success: true,
      message: "Workout plan created successfully",
      workoutPlan,
    });


  } catch (error) {

    console.log("Create Workout Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Get All Workout Plans
const getAllWorkoutPlans = async (req, res) => {
  try {

    const workoutPlans = await WorkoutPlan.find()
      .populate("userId", "fullName email")
      .populate("trainerId", "fullName specialization");


    if (workoutPlans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No workout plans found",
      });
    }


    return res.status(200).json({
      success: true,
      count: workoutPlans.length,
      workoutPlans,
    });


  } catch (error) {

    console.log("Get All Workout Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const getWorkoutPlanById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Workout Plan ID",
      });
    }


    // Find workout plan
    const workoutPlan = await WorkoutPlan.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("trainerId", "fullName specialization");


    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }


    return res.status(200).json({
      success: true,
      workoutPlan,
    });


  } catch (error) {

    console.log("Get Workout Plan By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const updateWorkoutPlanById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Workout Plan ID",
      });
    }


    // Find workout plan
    const workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }


    // Read request body
    const {
      title,
      goal,
      duration,
      exercises,
      status,
    } = req.body;


    // Validate goal
    if (
      goal !== undefined &&
      ![
        "Weight Loss",
        "Muscle Gain",
        "Fitness",
        "Strength",
      ].includes(goal)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid workout goal",
      });
    }


    // Validate status
    if (
      status !== undefined &&
      ![
        "Active",
        "Completed",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid workout status",
      });
    }


    // Update fields

    if (title !== undefined) {
      workoutPlan.title = title;
    }

    if (goal !== undefined) {
      workoutPlan.goal = goal;
    }

    if (duration !== undefined) {
      workoutPlan.duration = duration;
    }

    if (exercises !== undefined) {
      workoutPlan.exercises = exercises;
    }

    if (status !== undefined) {
      workoutPlan.status = status;
    }


    await workoutPlan.save();


    return res.status(200).json({
      success: true,
      message: "Workout plan updated successfully",
      workoutPlan,
    });


  } catch (error) {

    console.log("Update Workout Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const deleteWorkoutPlanById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Workout Plan ID",
      });
    }


    // Find workout plan
    const workoutPlan = await WorkoutPlan.findById(req.params.id);


    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }


    // Delete workout plan
    await workoutPlan.deleteOne();


    return res.status(200).json({
      success: true,
      message: "Workout plan deleted successfully",
    });


  } catch (error) {

    console.log("Delete Workout Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



module.exports = {
  createWorkoutPlan,
  getAllWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlanById,
  deleteWorkoutPlanById
};