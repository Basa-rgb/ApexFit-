import { Routes, Route } from "react-router-dom";
import Home from '../Features/Home/Home'
import LoginForm from '../Features/Auth/Login'
import Register from '../Features/Auth/Register'
import VerifyOtp from '../Features/Auth/VerifyOtp'
import ForgotPassword from '../Features/Auth/ForgotPassword'
import ResetPassword from '../Features/Auth/ResetPassword'
import PaymentForm from '../../pages/Payment/PaymentForm'
import PaymentSuccess from '../../pages/Payment/PaymentSuccess'
import PaymentFailed from '../../pages/Payment/Failure'
import AboutSection from "../Features/Home/AboutSection";
import TrainerSection from "../Features/Home/TrainerSection";
import TrainerProfile from "../../pages/TrainerProfile/TrainerProfile";
import Membership from "../Features/membership/Membership";
import Booking from "../Features/Booking/Booking";
import MyBookings from "../Features/Booking/MyBookings";
import WorkoutPlans from "../Features/workout/WorkoutPlans";
import WorkoutDetails from "../Features/workout/WorkoutDetails";
import Dashboard from "../Features/Dashboard/Dashboard";
import Gallery from "../Features/gallery/Gallery";
import BlogList from "../Features/Blog/BlogList";
import BlogDetails from "../Features/Blog/BlogDetails";
import AdminTrainers from "../Features/Admin/AdminTrainers";
import AdminMembershipPlans from "../Features/Admin/AdminMembershipPlans";
import AdminBookings from "../Features/Admin/AdminBookings";
import AdminPayments from "../Features/Admin/AdminPayments";
import AdminSubscriptions from "../Features/Admin/AdminSubscriptions";
import AdminBlogs from "../Features/Admin/AdminBlogs";
import AdminGallery from "../Features/Admin/AdminGallery";
import AdminDietPlans from "../Features/Admin/AdminDietPlans";
import AdminWorkoutPlans from "../Features/Admin/AdminWorkoutPlans";
import AdminFAQs from "../Features/Admin/AdminFAQs";
import AdminContacts from "../Features/Admin/AdminContacts";
import AdminNewsletters from "../Features/Admin/AdminNewsletters";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../Common/NotFound";
import ManagementPlaceholder from "../Common/ManagementPlaceholder";
import Profile from "../Features/Dashboard/Profile";
import UserManagement from "../Features/Dashboard/UserManagement";
import Contact from "../Features/Contact/Contact";
import DietPlans from "../Features/diet/DietPlans";
import DietDetails from "../Features/diet/DietDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element ={<AboutSection />} />
      <Route path="/trainers" element ={<TrainerSection />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/payment-form" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path= "/trainers/:id" element ={<TrainerProfile />}/>
      <Route path="/membership" element ={<Membership />} />
      {/* Booking requires an account — you cannot book a session without logging in. */}
      <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/workouts" element={<WorkoutPlans />} />
      <Route path="/workouts/:id" element={<WorkoutDetails />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/blogs" element={<BlogList />} />
      <Route path="/blogs/:id" element={<BlogDetails />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/trainers" element={<ProtectedRoute adminOnly><AdminTrainers /></ProtectedRoute>} />
      <Route path="/admin/membership-plans" element={<ProtectedRoute adminOnly><AdminMembershipPlans /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute adminOnly><AdminSubscriptions /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/blogs" element={<ProtectedRoute adminOnly><AdminBlogs /></ProtectedRoute>} />
      <Route path="/admin/gallery" element={<ProtectedRoute adminOnly><AdminGallery /></ProtectedRoute>} />
      <Route path="/admin/diet-plans" element={<ProtectedRoute adminOnly><AdminDietPlans /></ProtectedRoute>} />
      <Route path="/admin/workout-plans" element={<ProtectedRoute adminOnly><AdminWorkoutPlans /></ProtectedRoute>} />
      <Route path="/admin/faqs" element={<ProtectedRoute adminOnly><AdminFAQs /></ProtectedRoute>} />
      <Route path="/admin/contacts" element={<ProtectedRoute adminOnly><AdminContacts /></ProtectedRoute>} />
      <Route path="/admin/newsletters" element={<ProtectedRoute adminOnly><AdminNewsletters /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin/:section" element={<ProtectedRoute adminOnly><ManagementPlaceholder /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/dietplans" element={<DietPlans />} />
      <Route path="/dietplans/:id" element={<DietDetails />} />

    </Routes>
  )
}

export default AppRoutes
