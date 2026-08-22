const mongoose = require("mongoose");
const DietPlan = require("../models/DietPlan");
const User = require("../models/User");
const Trainer = require("../models/Trainer");

// Trainer profiles are linked to accounts by matching email.
const getOwnTrainerProfile = async (req) => {
  if (req.user?.role !== "trainer") return null;
  const account = await User.findById(req.user.id);
  if (!account) return null;
  return Trainer.findOne({ email: account.email });
};


// Create Diet Plan
const DIET_MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

// Meal types are an enum in the schema — accept any casing and validate up front
// so members' trainers get a helpful 400 instead of a blank 500.
const normalizeMeals = (rawMeals) =>
  (Array.isArray(rawMeals) ? rawMeals : [])
    .map((meal) => {
      const rawType = String(meal?.mealType || "").trim().toLowerCase();
      const matchedType = DIET_MEAL_TYPES.find((type) => type.toLowerCase() === rawType) || null;
      return {
        mealType: matchedType || String(meal?.mealType || "").trim(),
        foodItems: (meal?.foodItems || []).map((item) => String(item).trim()).filter(Boolean),
        calories: Number(meal?.calories) || 0,
      };
    });

const mealsValidationError = (meals) => {
  if (!meals.length) return "Add at least one meal.";
  const invalid = meals.find((meal) => !DIET_MEAL_TYPES.includes(meal.mealType));
  if (invalid) {
    return `Meal type "${invalid.mealType}" is not allowed. Use one of: ${DIET_MEAL_TYPES.join(", ")}.`;
  }
  const incomplete = meals.find((meal) => !meal.foodItems.length);
  if (incomplete) return `The ${incomplete.mealType} meal needs at least one food item.`;
  return null;
};

const validationErrorResponse = (res, error) => {
  if (error?.name === "ValidationError") {
    const details = Object.values(error.errors || {})
      .map((issue) => issue.message)
      .join(", ");
    return res.status(400).json({ success: false, message: details || "Invalid plan data." });
  }
  return null;
};

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

    // Trainers can only publish plans under their own profile.
    if (req.user?.role === "trainer") {
      const own = await getOwnTrainerProfile(req);
      if (!own || String(own._id) !== String(trainerId)) {
        return res.status(403).json({
          success: false,
          message: "You can only create diet plans under your own trainer profile.",
        });
      }
    }

    const normalizedMeals = normalizeMeals(meals);
    const mealsError = mealsValidationError(normalizedMeals);
    if (mealsError) {
      return res.status(400).json({ success: false, message: mealsError });
    }

    // Create Diet Plan

    const dietPlan = await DietPlan.create({
      userId,
      trainerId,
      title,
      goal,
      duration,
      meals: normalizedMeals,
    });


    return res.status(201).json({
      success: true,
      message: "Diet plan created successfully",
      dietPlan,
    });


  } catch (error) {

    console.log("Create Diet Plan Error:", error);

    const validationResponse = validationErrorResponse(res, error);
    if (validationResponse) return validationResponse;

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
      .populate("trainerId", "fullName email");


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
      .populate("trainerId", "fullName email");


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

    // Trainers can only manage their own plans.
    if (req.user?.role === "trainer") {
      const own = await getOwnTrainerProfile(req);
      if (!own || String(dietPlan.trainerId) !== String(own._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only manage your own diet plans.",
        });
      }
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

    const validationResponse = validationErrorResponse(res, error);
    if (validationResponse) return validationResponse;

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

    // Trainers can only delete their own plans.
    if (req.user?.role === "trainer") {
      const own = await getOwnTrainerProfile(req);
      if (!own || String(dietPlan.trainerId) !== String(own._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own diet plans.",
        });
      }
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