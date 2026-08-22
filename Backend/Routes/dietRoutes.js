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
const { isAdmin, isTrainerOrAdmin } = require("../middlewares/adminMiddleware");


// Create Diet Plan (admin or trainer)
router.post("/", protect, isTrainerOrAdmin, createDietPlan);


// Get All Diet Plans (public)
router.get("/", getAllDietPlans);


// Get Single Diet Plan By ID (public)
router.get("/:id", getDietPlanById);


// Update Diet Plan (admin or owning trainer)
router.put("/:id", protect, isTrainerOrAdmin, updateDietPlanById);


// Delete Diet Plan (admin or owning trainer)
router.delete("/:id", protect, isTrainerOrAdmin, deleteDietPlanById);


module.exports = router;