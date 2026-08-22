const userModel = require("../models/User");
const OTP = require("../models/OTP");
const {
  forgotPasswordTemplate,
  otpTemplate,
} = require("../utils/emailTemplates");
const { validateEmail, validatePassword } = require("../utils/validators");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const generateOtp = require("../utils/generateOtp");
const axios = require("axios");
const User = require("../models/User");
const { generate } = require("otp-generator");

// REGISTER USER

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name email and password are required",
      });
    }

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: emailError,
      });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // check if the user already exists

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // hash the password and create a new user

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    //  generate a JWT token

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // send the response with the token

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });

    // error handling
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// send Registration Otp
const sendRegistrationOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Role must be a valid value (defaults to "user")
    const role = ["user", "trainer"].includes(req.body.role)
      ? req.body.role
      : "user";

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: emailError,
      });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOtp();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Remove previous registration OTP
    await OTP.deleteMany({
      email,
      action: "register",
    });

    // Save temporary registration data
    await OTP.create({
      name,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      action: "register",
      role,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "Registration OTP",
      html: otpTemplate(otp),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Send Registration OTP:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// OTP VERIFICATION
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find registration OTP
    const otpData = await OTP.findOne({
      email,
      action: "register",
    });

    if (!otpData) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
      });
    }

    // Check expiry
    if (otpData.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, otpData.otp);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Double-check user doesn't already exist
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      await OTP.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name: otpData.name,
      email: otpData.email,
      password: otpData.password,
      isVerified: true,
      role: ["user", "trainer"].includes(otpData.role) ? otpData.role : "user",
    });

    // Delete OTP record
    await OTP.deleteOne({
      _id: otpData._id,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify Registration OTP:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otpData = await OTP.findOne({ email, action: "register" });

    if (!otpData) {
      return res.status(404).json({
        success: false,
        message: "Registration session not found. Please register again.",
      });
    }

    const otp = generateOtp();
    otpData.otp = await bcrypt.hash(otp, 10);
    otpData.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpData.save();

    await sendEmail({
      to: email,
      subject: "Registration OTP",
      html: otpTemplate(otp),
    });

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent successfully.",
    });
  } catch (error) {
    console.error("Resend Registration OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: emailError,
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact an administrator.",
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    // Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GOOGLE LOGIN
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify the ID token with Google
    let profile;
    try {
      const googleRes = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      profile = googleRes.data;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token",
      });
    }

    // Make sure the token was issued for our app and the email is verified
    if (
      profile.aud !== process.env.GOOGLE_CLIENT_ID ||
      profile.email_verified !== "true"
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account is not verified for this app",
      });
    }

    const email = profile.email.toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      // First time Google sign-in -> create the account automatically
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: profile.name || "Google User",
        email,
        password: hashedPassword,
        isVerified: true,
        role: "user",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been deactivated. Please contact an administrator.",
      });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGOUT USER

const logoutUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//  FORGOT PASSWORD

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: emailError,
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate random token for password reset

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving to database

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // save hashed token and expiration time

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; //10 min

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: forgotPasswordTemplate(resetUrl),
    });

    return res.status(200).json({
      success: true,
      message: `Password reset link sent to ${user.email}`,
      
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// SEND OTP

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check the email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: emailError,
      });
    }
    // check the user exit or not

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate the OTP

    const otp = generateOtp();

    // hashed Otp

    const hashedOtp = await bcrypt.hash(otp, 10);

    // Remove old Otp

    await OTP.deleteMany({ email });

    // Save new OTP

    await OTP.create({
      email,
      otp: hashedOtp,
      action: "forgot_password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send Email
    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: otpTemplate(otp),
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset Password

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // validate input

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    // check the password

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }
    // Hash received  token

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update  password

    user.password = hashedPassword;

    // clear the reset fields

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // save

    await user.save();

    // Response the success

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Reset Password Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// CHANGE PASSWORD

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate the input

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        Message: "All fields are required",
      });
    }

    // Check password confirmation

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // prevent using the same password

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }
    // find logged -in user

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify the current password

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hashed new password

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password

    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  sendRegistrationOtp,
  loginUser,
  googleLogin,
  logoutUser,
  forgotPassword,
  sendOtp,
  changePassword,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  resetPassword,
};
