const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

// Fail loudly at boot when deployment-critical URLs are still localhost
// or eSewa credentials are missing — payments break silently otherwise.
const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1/;

["SUCCESS_URL", "FAILURE_URL", "CLIENT_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[config] Missing ${key} — payments/auth links will fail.`);
  } else if (LOCALHOST_PATTERN.test(process.env[key])) {
    console.warn(
      `[config] ${key} is "${process.env[key]}" — set it to your deployed frontend URL (e.g. https://your-app.vercel.app) or eSewa will redirect users to localhost.`
    );
  }
});

[
  "MERCHANT_ID",
  "SECRET",
  "ESEWAPAYMENT_URL",
  "ESEWAPAYMENT_STATUS_CHECK_URL",
  "MONGOOSE_URL",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
].forEach((key) => {
  if (!process.env[key]) {
    console.warn(
      `[config] Missing ${key} — features depending on it will not work.`
    );
  }
});


const connectedDb = require("./config/db");
const cors = require("cors");

const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const trainerRoutes = require("./Routes/trainerRoutes");
const membershipPlanRoutes = require("./Routes/membershipRoutes");
const membershipSubscription = require("./Routes/subscriptionRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const workoutPlanRoutes  = require("./Routes/workoutRoutes");
const dietRoutes = require("./Routes/dietRoutes")
const contactRoutes = require("./Routes/contactRoutes");
const blogRoutes =require("./Routes/blogRoutes");
const galleryRoutes = require("./Routes/galleryRoutes");
const newsletterRoutes = require("./Routes/newsletterRoutes");
const faqRoutes = require("./Routes/faqRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");

// Esewa Routes
const esewaRoutes = require("./Routes/esewaRoutes");

// Admin
const adminRoutes = require("./Routes/adminRoutes");



connectedDb();

const app = express();

// Render sits behind one reverse proxy hop — without this every visitor
// appears to share Render's proxy IP, which breaks rate limiting.
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

//  Auth routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Trainer routes
app.use("/api/trainers", trainerRoutes);

//  Membership routes
app.use("/api/membership-plans", membershipPlanRoutes);

//  Membership subscription routes
app.use("/api/subscriptions", membershipSubscription);

// Payment routes

app.use("/api/payments", paymentRoutes);

// Booking routes

app.use("/api/bookings", bookingRoutes);

// work-out plans routes

app.use("/api/workout-plans", workoutPlanRoutes);

// diet routes

app.use("/api/diet-plans", dietRoutes);

// contact routes

app.use("/api/contacts", contactRoutes);


// admin routes

app.use("/api/admin", adminRoutes);

// Esewa routes

app.use("/api/esewa", esewaRoutes);

// Blog Routes

app.use("/api/blog",blogRoutes)


// Gallery Routes

app.use("/api/gallery",galleryRoutes);


// Newsletter Routes

app.use("/api/newsletter", newsletterRoutes);

// Public FAQ routes
app.use("/api/faqs", faqRoutes);

// Review routes

app.use("/api/reviews", reviewRoutes);















const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}`);
});

// app.get("/", (req, res) => {
//   res.send("Server is working");
// });
