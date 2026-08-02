const mongoose = require("mongoose");
const DietPlan = require("../models/DietPlan");
const User = require("../models/User");
const Trainer = require("../models/Trainer");


// Create Diet Plan
const createDietPlan = async (req, res) => {
  try {
    console.log("Headers:", req.headers["content-type"]);
    console.log("Body:", req.body);
    const {
      userId,
      trainerId,
      title,
      goal,
      duration,
      meals
    } = req.body;


    // Required fields
    if (
      !userId ||
      !trainerId ||
      !title ||
      !goal ||
      !duration ||
      !meals
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    // Validate Object ID
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


    // Create Diet Plan

    const dietPlan = await DietPlan.create({
      userId,
      trainerId,
      title,
      goal,
      duration,
      meals,
    });


    return res.status(201).json({
      success: true,
      message: "Diet plan created successfully",
      dietPlan,
    });


  } catch (error) {

    console.log("Create Diet Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get All Diet Plans
const getAllDietPlans = async (req, res) => {
  try {

    const dietPlans = await DietPlan.find()
      .populate("userId", "fullName email")
      .populate("trainerId", "name email");


    if (dietPlans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No diet plans found",
      });
    }


    return res.status(200).json({
      success: true,
      count: dietPlans.length,
      dietPlans,
    });


  } catch (error) {

    console.log("Get All Diet Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Get Diet Plan By ID
const getDietPlanById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Diet Plan ID",
      });
    }


    // Find diet plan
    const dietPlan = await DietPlan.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("trainerId", "name email");


    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }


    return res.status(200).json({
      success: true,
      dietPlan,
    });


  } catch (error) {

    console.log("Get Diet Plan By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Update Diet Plan By ID
const updateDietPlanById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Diet Plan ID",
      });
    }


    // Find diet plan
    const dietPlan = await DietPlan.findById(req.params.id);


    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }


    const {
      title,
      goal,
      duration,
      meals,
      status
    } = req.body;


    // Validate goal
    if (
      goal !== undefined &&
      ![
        "Weight Loss",
        "Muscle Gain",
        "Maintenance",
        "Healthy Lifestyle"
      ].includes(goal)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid diet goal",
      });
    }


    // Validate status
    if (
      status !== undefined &&
      ![
        "Active",
        "Completed"
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid diet status",
      });
    }


    // Update fields

    if (title !== undefined) {
      dietPlan.title = title;
    }

    if (goal !== undefined) {
      dietPlan.goal = goal;
    }

    if (duration !== undefined) {
      dietPlan.duration = duration;
    }

    if (meals !== undefined) {
      dietPlan.meals = meals;
    }

    if (status !== undefined) {
      dietPlan.status = status;
    }


    await dietPlan.save();


    return res.status(200).json({
      success: true,
      message: "Diet plan updated successfully",
      dietPlan,
    });


  } catch (error) {

    console.log("Update Diet Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Delete Diet Plan By ID
const deleteDietPlanById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Diet Plan ID",
      });
    }


    // Find diet plan
    const dietPlan = await DietPlan.findById(req.params.id);


    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }


    // Delete diet plan
    await dietPlan.deleteOne();


    return res.status(200).json({
      success: true,
      message: "Diet plan deleted successfully",
    });


  } catch (error) {

    console.log("Delete Diet Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  createDietPlan,
  getAllDietPlans,
  getDietPlanById,
  updateDietPlanById,
  deleteDietPlanById
};