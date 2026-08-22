const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");
const {
  createMembershipPlan,
  getAllMembershipPlans,
  getMembershipPlanById,
  updateMembershipPlan,
  deleteMembershipPlan
} = require("../controllers/membershipController");

// create membership plan (Admin only)
router.post("/", protect, isAdmin, createMembershipPlan);

// get all membership plans (public so visitors can browse plans)

router.get("/", getAllMembershipPlans);


// get membership plan by Id

router.get("/:id", getMembershipPlanById);

// update membership plan by Id (Admin only)

router.put("/:id", protect, isAdmin, updateMembershipPlan);

// delete membership plan by Id (Admin only)

router.delete("/:id", protect, isAdmin, deleteMembershipPlan);



module.exports = router;
