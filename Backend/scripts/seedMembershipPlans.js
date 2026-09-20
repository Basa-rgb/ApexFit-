require("dotenv").config();

const mongoose = require("mongoose");
const MembershipPlan = require("../models/MembershipPlan");

// Demo-ready plans. Re-running this script refreshes these named packages
// without creating duplicates, and they can still be edited in the admin UI.
const membershipPlans = [
  {
    name: "Starter Fit",
    planType: "Basic",
    description: "A simple start for building a consistent gym routine.",
    duration: 1,
    price: 2500,
    features: [
      "Full gym access",
      "Fitness assessment",
      "Locker access",
      "Standard support",
    ],
    isActive: true,
  },
  {
    name: "Progress Plus",
    planType: "Standard",
    description: "The complete plan for members working toward visible progress.",
    duration: 3,
    price: 6500,
    features: [
      "Everything in Starter Fit",
      "One personal-training session each month",
      "Custom workout plan",
      "Monthly progress review",
      "Priority booking",
    ],
    isActive: true,
  },
  {
    name: "Apex Elite",
    planType: "Premium",
    description: "High-touch coaching and recovery support for serious goals.",
    duration: 6,
    price: 12000,
    features: [
      "Everything in Progress Plus",
      "Two personal-training sessions each month",
      "Personalized diet plan",
      "Body-composition check-ins",
      "Priority trainer support",
    ],
    isActive: true,
  },
];

const seedMembershipPlans = async () => {
  if (!process.env.MONGOOSE_URL || /<[^>]+>/.test(process.env.MONGOOSE_URL)) {
    throw new Error("Set a valid MONGOOSE_URL in Backend/.env first.");
  }

  await mongoose.connect(process.env.MONGOOSE_URL, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  for (const plan of membershipPlans) {
    await MembershipPlan.findOneAndUpdate(
      { name: plan.name },
      { $set: plan },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  console.log(`${membershipPlans.length} membership plans are ready.`);
};

seedMembershipPlans()
  .catch((error) => {
    console.error("Membership-plan seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
