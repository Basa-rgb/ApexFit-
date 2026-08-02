const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createMembershipPlan,
  getAllMembershipPlans,
  getMembershipPlanById,
  updateMembershipPlan,
  deleteMembershipPlan
} = require("../controllers/membershipController");

// create membership plan
router.post("/", protect, createMembershipPlan);

// get all membership plan

router.get("/", protect, getAllMembershipPlans);


// get all membership plan by Id

router.get("/:id", protect , getMembershipPlanById)

//  update all membership plan by Id

router.put("/:id",protect ,updateMembershipPlan);

// delete all membership plan by Id

router.delete("/:id", protect ,deleteMembershipPlan);



module.exports = router;
