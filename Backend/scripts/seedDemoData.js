require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");
const Trainer = require("../models/Trainer");
const BookingOption = require("../models/BookingOption");
const Booking = require("../models/Bookings");
const MembershipPlan = require("../models/MembershipPlan");
const MembershipSubscription = require("../models/MembershipSubscription");
const Payment = require("../models/Payments");
const WorkoutPlan = require("../models/WorkoutPlan");
const DietPlan = require("../models/DietPlan");
const Blog = require("../models/Blog");
const Gallery = require("../models/Gallery");
const FAQ = require("../models/FAQ");
const Review = require("../models/Review");
const Newsletter = require("../models/Newsletter");
const Contact = require("../models/Contacts");

const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD || "ApexFitDemo2026!";

const membershipPlans = [
  {
    name: "Starter Fit",
    planType: "Basic",
    description: "A simple start for building a consistent gym routine.",
    duration: 1,
    price: 2500,
    features: ["Full gym access", "Fitness assessment", "Locker access", "Standard support"],
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

const trainerProfiles = [
  {
    fullName: "Maya Shrestha",
    email: "maya.trainer@apexfit.demo",
    phone: "9800000001",
    gender: "Female",
    bio: "Strength and mobility coach focused on sustainable progress and confidence.",
    specialization: ["Strength Training", "Mobility", "Women’s Fitness"],
    experience: 7,
    certifications: ["NASM Certified Personal Trainer", "Functional Movement Specialist"],
    availableDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: { start: "06:00 AM", end: "07:00 PM" },
    monthlyFee: 6500,
    personalTrainingFee: 1800,
    profileImage: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=720&q=85",
    rating: 4.9,
    totalReviews: 32,
    isActive: true,
  },
  {
    fullName: "Rohan Karki",
    email: "rohan.trainer@apexfit.demo",
    phone: "9800000002",
    gender: "Male",
    bio: "Performance coach helping members build muscle, improve conditioning, and move better.",
    specialization: ["Muscle Building", "HIIT", "Sports Conditioning"],
    experience: 6,
    certifications: ["ACE Certified Personal Trainer", "Strength and Conditioning Coach"],
    availableDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableTime: { start: "07:00 AM", end: "08:00 PM" },
    monthlyFee: 6000,
    personalTrainingFee: 1600,
    profileImage: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=720&q=85",
    rating: 4.8,
    totalReviews: 27,
    isActive: true,
  },
];

const futureDate = (daysFromNow) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const ensureUser = async ({ name, email, role }) => {
  const password = await bcrypt.hash(demoPassword, 12);
  return User.findOneAndUpdate(
    { email },
    { $set: { name, password, role, isVerified: true, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const upsertMany = async (Model, records, key) => {
  for (const record of records) {
    await Model.findOneAndUpdate(
      { [key]: record[key] },
      { $set: record },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
};

const seed = async () => {
  if (!process.env.MONGOOSE_URL || /<[^>]+>/.test(process.env.MONGOOSE_URL)) {
    throw new Error("Set a valid MONGOOSE_URL in Backend/.env first.");
  }

  await mongoose.connect(process.env.MONGOOSE_URL, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  // Accounts make the User and Trainer sections meaningful in the admin workspace.
  const arjun = await ensureUser({ name: "Arjun Thapa", email: "arjun.member@apexfit.demo", role: "user" });
  const nisha = await ensureUser({ name: "Nisha Gurung", email: "nisha.member@apexfit.demo", role: "user" });
  await Promise.all(
    trainerProfiles.map(({ fullName, email }) => ensureUser({ name: fullName, email, role: "trainer" })),
  );

  await upsertMany(MembershipPlan, membershipPlans, "name");
  await upsertMany(Trainer, trainerProfiles, "email");

  const maya = await Trainer.findOne({ email: "maya.trainer@apexfit.demo" });
  const rohan = await Trainer.findOne({ email: "rohan.trainer@apexfit.demo" });
  const progressPlus = await MembershipPlan.findOne({ name: "Progress Plus" });
  const starterFit = await MembershipPlan.findOne({ name: "Starter Fit" });

  const optionData = [
    {
      trainerId: maya._id,
      name: "Strength Foundations",
      price: 1800,
      timeSlots: [
        { label: "07:00 AM - 08:00 AM", startHour: 7 },
        { label: "05:00 PM - 06:00 PM", startHour: 17 },
      ],
      isActive: true,
    },
    {
      trainerId: rohan._id,
      name: "HIIT Performance",
      price: 1600,
      timeSlots: [
        { label: "08:00 AM - 09:00 AM", startHour: 8 },
        { label: "06:00 PM - 07:00 PM", startHour: 18 },
      ],
      isActive: true,
    },
  ];

  for (const option of optionData) {
    await BookingOption.findOneAndUpdate(
      { trainerId: option.trainerId, name: option.name },
      { $set: option },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const mayaSession = await BookingOption.findOne({ trainerId: maya._id, name: "Strength Foundations" });
  const rohanSession = await BookingOption.findOne({ trainerId: rohan._id, name: "HIIT Performance" });

  const activeSubscription = await MembershipSubscription.findOneAndUpdate(
    { userId: arjun._id, membershipPlanId: progressPlus._id },
    {
      $set: {
        userId: arjun._id,
        membershipPlanId: progressPlus._id,
        startDate: futureDate(-12),
        endDate: futureDate(78),
        status: "Active",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await MembershipSubscription.findOneAndUpdate(
    { userId: nisha._id, membershipPlanId: starterFit._id },
    {
      $set: {
        userId: nisha._id,
        membershipPlanId: starterFit._id,
        startDate: futureDate(1),
        endDate: futureDate(31),
        status: "Pending",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const arjunBooking = await Booking.findOneAndUpdate(
    { userId: arjun._id, trainerId: maya._id, bookingOptionId: mayaSession._id },
    {
      $set: {
        userId: arjun._id,
        trainerId: maya._id,
        bookingOptionId: mayaSession._id,
        bookingDate: futureDate(3),
        timeSlot: "07:00 AM - 08:00 AM",
        sessionType: mayaSession.name,
        amount: mayaSession.price,
        paymentMethod: "Cash",
        paymentStatus: "Paid",
        status: "Confirmed",
        notes: "Demo booking: strength assessment and programme review.",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Booking.findOneAndUpdate(
    { userId: nisha._id, trainerId: rohan._id, bookingOptionId: rohanSession._id },
    {
      $set: {
        userId: nisha._id,
        trainerId: rohan._id,
        bookingOptionId: rohanSession._id,
        bookingDate: futureDate(5),
        timeSlot: "06:00 PM - 07:00 PM",
        sessionType: rohanSession.name,
        amount: rohanSession.price,
        paymentMethod: "Cash",
        paymentStatus: "Pending",
        status: "Pending",
        notes: "Demo booking: first HIIT coaching session.",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Payment.findOneAndUpdate(
    { transactionUuid: "demo-membership-arjun" },
    {
      $set: {
        userId: arjun._id,
        subscriptionId: activeSubscription._id,
        membershipPlanId: progressPlus._id,
        transactionUuid: "demo-membership-arjun",
        transactionId: "DEMO-MEMBER-001",
        amount: progressPlus.price,
        paymentMethod: "Cash",
        status: "Completed",
        paymentDate: futureDate(-12),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Payment.findOneAndUpdate(
    { bookingId: arjunBooking._id, paymentMethod: "Cash" },
    {
      $set: {
        userId: arjun._id,
        bookingId: arjunBooking._id,
        amount: mayaSession.price,
        paymentMethod: "Cash",
        status: "Completed",
        paymentDate: futureDate(-1),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const workout = {
    userId: arjun._id,
    trainerId: maya._id,
    title: "Strength Foundations: 4 Weeks",
    description: "A progressive full-body routine for building strength with excellent technique.",
    goal: "Build strength and movement confidence",
    difficulty: "Beginner",
    duration: "4 weeks",
    targetAudience: "Members starting a consistent strength routine",
    daysPerWeek: 3,
    estimatedSessionTime: "45 minutes",
    equipment: ["Dumbbells", "Bench", "Resistance band"],
    exercises: [
      { name: "Goblet Squat", sets: 3, reps: 10, restTime: "60 sec", instructions: "Keep your chest tall and control the descent." },
      { name: "Dumbbell Bench Press", sets: 3, reps: 10, restTime: "60 sec", instructions: "Press smoothly and keep shoulders stable." },
      { name: "Seated Cable Row", sets: 3, reps: 12, restTime: "60 sec", instructions: "Pull elbows toward your ribs." },
    ],
    status: "Active",
  };
  await WorkoutPlan.findOneAndUpdate(
    { userId: arjun._id, title: workout.title },
    { $set: workout },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const diet = {
    userId: arjun._id,
    trainerId: maya._id,
    title: "Balanced Strength Nutrition",
    goal: "Muscle Gain",
    duration: "4 weeks",
    meals: [
      { mealType: "Breakfast", foodItems: ["Oats", "Greek yogurt", "Banana"], calories: 520 },
      { mealType: "Lunch", foodItems: ["Rice", "Grilled chicken", "Seasonal vegetables"], calories: 720 },
      { mealType: "Snacks", foodItems: ["Fruit", "Mixed nuts", "Protein milk"], calories: 330 },
      { mealType: "Dinner", foodItems: ["Roti", "Paneer or fish", "Salad"], calories: 620 },
    ],
    status: "Active",
  };
  await DietPlan.findOneAndUpdate(
    { userId: arjun._id, title: diet.title },
    { $set: diet },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await upsertMany(Blog, [
    {
      title: "Five Habits That Make Fitness Progress Stick",
      slug: "five-habits-that-make-fitness-progress-stick",
      excerpt: "Small, repeatable habits are the foundation of lasting results.",
      content: "Consistency beats intensity when you are building a sustainable routine. Start with realistic sessions, eat enough protein, sleep well, track your progress, and ask for help when you need it.",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85",
      category: "Motivation",
      tags: ["Consistency", "Fitness", "Habits"],
      author: "ApexFit Coaching Team",
      featured: true,
      status: "Published",
      publishedAt: futureDate(-7),
    },
    {
      title: "A Beginner’s Guide to Protein for Training",
      slug: "beginners-guide-to-protein-for-training",
      excerpt: "A practical way to plan protein-rich meals around your workouts.",
      content: "Protein supports recovery and muscle growth. Spread protein across meals, choose foods you enjoy, and pair your training plan with a balanced diet that fits your lifestyle.",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85",
      category: "Nutrition",
      tags: ["Nutrition", "Protein", "Recovery"],
      author: "ApexFit Nutrition Team",
      featured: false,
      status: "Published",
      publishedAt: futureDate(-3),
    },
  ], "slug");

  await upsertMany(Gallery, [
    { title: "Strength Training Floor", category: "Gym", date: futureDate(-25), image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85" },
    { title: "Coach-led Training Session", category: "Training", date: futureDate(-18), image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85" },
    { title: "Performance Equipment Zone", category: "Equipment", date: futureDate(-10), image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=85" },
  ], "title");

  await upsertMany(FAQ, [
    { question: "Can I try the gym before joining?", answer: "Yes. Contact us to arrange a gym tour and discuss the best plan for your goals.", order: 1, isActive: true },
    { question: "Do membership plans include personal training?", answer: "Progress Plus and Apex Elite include personal-training sessions. Starter Fit members can book sessions separately.", order: 2, isActive: true },
    { question: "How do I book a session with a trainer?", answer: "Sign in, choose a trainer, select an available session type and time slot, then confirm your booking.", order: 3, isActive: true },
    { question: "Can I change or cancel a booking?", answer: "Yes. Open My Bookings from your dashboard and manage an upcoming booking before its scheduled time.", order: 4, isActive: true },
  ], "question");

  await Review.findOneAndUpdate(
    { userId: arjun._id },
    { $set: { userId: arjun._id, trainerId: maya._id, name: arjun.name, rating: 5, comment: "The plan is clear, motivating, and easy to follow. I feel stronger every week.", isApproved: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await Review.findOneAndUpdate(
    { userId: nisha._id },
    { $set: { userId: nisha._id, trainerId: rohan._id, name: nisha.name, rating: 5, comment: "Great coaching and a welcoming gym environment. The sessions are challenging in the best way.", isApproved: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await upsertMany(Newsletter, [
    { name: "Suman Rai", email: "suman.newsletter@apexfit.demo", subscribed: true },
    { name: "Priya Shah", email: "priya.newsletter@apexfit.demo", subscribed: true },
  ], "email");
  await Contact.findOneAndUpdate(
    { email: "suman.contact@apexfit.demo" },
    { $set: { name: "Suman Rai", email: "suman.contact@apexfit.demo", phone: "9800000010", message: "I would like to arrange a gym tour this weekend.", status: "Pending" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log("Demo data is ready: users, trainers, packages, bookings, payments, plans, content, FAQs, gallery, contacts, and newsletter subscribers.");
  console.log(`Demo member and trainer password: ${demoPassword}`);
};

seed()
  .catch((error) => {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
