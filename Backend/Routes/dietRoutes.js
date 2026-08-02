const express = require("express");
const router = express.Router();

const {
  createDietPlan,
  getAllDietPlans,
  getDietPlanById,
  updateDietPlanById,
  deleteDietPlanById,
} = require("../controllers/dietController");

const { protect } = require("../middlewares/authMiddleware");


// Create Diet Plan
router.post("/", protect, createDietPlan);


// Get All Diet Plans
router.get("/", protect, getAllDietPlans);


// Get Single Diet Plan By ID
router.get("/:id", protect, getDietPlanById);


// Update Diet Plan
router.put("/:id", protect, updateDietPlanById);


// Delete Diet Plan
router.delete("/:id", protect, deleteDietPlanById);


module.exports = router;