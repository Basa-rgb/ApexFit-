const mongoose = require("mongoose");
const WorkoutPlan = require("../models/WorkoutPlan");
const User = require("../models/User");
const Trainer = require("../models/Trainer");

// Trainer profiles are linked to accounts by matching email.
const getOwnTrainerProfile = async (req) => {
  if (req.user?.role !== "trainer") return null;
  const account = await User.findById(req.user.id);
  if (!account) return null;
  return Trainer.findOne({ email: account.email });
};


// Create Workout Plan
const createWorkoutPlan = async (req, res) => {
  try {
    const {
      userId,
      trainerId,
      title,
      description,
      image,
      goal,
      difficulty,
      duration,
      targetAudience,
      daysPerWeek,
      estimatedSessionTime,
      equipment,
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

    // Trainers can only publish plans under their own profile.
    if (req.user?.role === "trainer") {
      const own = await getOwnTrainerProfile(req);
      if (!own || String(own._id) !== String(trainerId)) {
        return res.status(403).json({
          success: false,
          message: "You can only create workout plans under your own trainer profile.",
        });
      }
    }


    // Create Workout Plan
    const workoutPlan = await WorkoutPlan.create({
      userId,
      trainerId,
      title,
      description,
      image,
      goal,
      difficulty,
      duration,
      targetAudience,
      daysPerWeek,
      estimatedSessionTime,
      equipment,
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

    // Trainers can only manage their own plans.
    if (req.user?.role === "trainer") {
      const own = await getOwnTrainerProfile(req);
      if (!own || String(workoutPlan.trainerId) !== String(own._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only manage your own workout plans.",
        });
      }
    }


    // Read request body
    const {
      title,
      description,
      image,
      goal,
      difficulty,
      duration,
      exercises,
      targetAudience,
      daysPerWeek,
      estimatedSessionTime,
      equipment,
      status,
    } = req.body;


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

    if (description !== undefined) workoutPlan.description = description;
    if (image !== undefined) workoutPlan.image = image;

    if (goal !== undefined) {
      workoutPlan.goal = goal;
    }

    if (duration !== undefined) {
      workoutPlan.duration = duration;
    }

    if (difficulty !== undefined) workoutPlan.difficulty = difficulty;
    if (targetAudience !== undefined) workoutPlan.targetAudience = targetAudience;
    if (daysPerWeek !== undefined) workoutPlan.daysPerWeek = daysPerWeek;
    if (estimatedSessionTime !== undefined) {
      workoutPlan.estimatedSessionTime = estimatedSessionTime;
    }
    if (equipment !== undefined) workoutPlan.equipment = equipment;

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

    // Trainers can only delete their own plans.
    if (req.user?.role === "trainer") {
      const own = await getOwnTrainerProfile(req);
      if (!own || String(workoutPlan.trainerId) !== String(own._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own workout plans.",
        });
      }
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