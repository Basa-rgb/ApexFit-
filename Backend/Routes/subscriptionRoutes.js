const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
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

router.get("/", protect, getAllSubscriptions);

// get subscription by Id

router.get("/:id", protect, getSubscriptionById);

// update subscription by Id
router.put("/:id", protect, updateMembershipSubscription);

// delete subscription by Id

router.delete("/:id", protect, deleteMembershipSubscription);
module.exports = router;
