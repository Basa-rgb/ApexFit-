const express = require("express");
const dotenv = require("dotenv");
dotenv.config();


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

// Esewa Routes
const esewaRoutes = require("./Routes/esewaRoutes");

// Admin
const adminRoutes = require("./Routes/adminRoutes");



connectedDb();

const app = express();

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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}`);
});

// app.get("/", (req, res) => {
//   res.send("Server is working");
// });
