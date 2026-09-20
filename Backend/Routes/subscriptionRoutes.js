const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");
const {
 createMembershipSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateMembershipSubscription,
  deleteMembershipSubscription,
} = require("../controllers/membershipSubscription");

// create subscription

router.post("/", protect, createMembershipSubscription);

// get all subscription

router.get("/", protect, isAdmin, getAllSubscriptions);

// get subscription by Id

router.get("/:id", protect, isAdmin, getSubscriptionById);

// update subscription by Id
router.put("/:id", protect, isAdmin, updateMembershipSubscription);

// delete subscription by Id

router.delete("/:id", protect, isAdmin, deleteMembershipSubscription);
module.exports = router;
