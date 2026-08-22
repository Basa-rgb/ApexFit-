const mongoose = require("mongoose");
const Trainer = require("../models/Trainer");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// FormData sends these as JSON strings - accept both strings and real values.
const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const parseAvailableTime = (value) => {
  const empty = { start: "", end: "" };
  if (!value) return empty;
  if (typeof value === "object") return { start: value.start || "", end: value.end || "" };
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? { start: parsed.start || "", end: parsed.end || "" }
      : empty;
  } catch {
    return empty;
  }
};

const validationMessage = (error) =>
  Object.values(error.errors || {})
    .map((item) => item.message)
    .join(", ") || "Invalid trainer data.";

const createTrainer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      bio,
      specialization,
      experience,
      certifications,
      availableDays,
      availableTime,
      monthlyFee,
      personalTrainingFee,
      facebook,
      instagram,
      linkedin,
    } = req.body;

    // validate the input

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check the duplicate email

    const existingTrainer = await Trainer.findOne({ email });

    if (existingTrainer) {
      return res.status(409).json({
        success: false,
        message: "Trainer already exists",
      });
    }
    let profileImage = "";
    let profileImagePublicId = "";

    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "apexfit/trainers",
      );

      profileImage = uploaded.url;
      profileImagePublicId = uploaded.public_id;
    }

    // create Trainer obj

    const trainer = new Trainer({
      fullName,
      email,
      phone,
      gender,
      profileImage,
      profileImagePublicId,
      bio,
      specialization: parseJsonArray(specialization),
      experience: Number(experience) || 0,
      certifications: parseJsonArray(certifications),
      availableDays: parseJsonArray(availableDays),
      availableTime: parseAvailableTime(availableTime),
      monthlyFee: Number(monthlyFee) || 0,
      personalTrainingFee: Number(personalTrainingFee) || 0,
      socialLinks: {
        facebook: facebook || "",
        instagram: instagram || "",
        linkedin: linkedin || "",
      },
    });

    // save trainer

    await trainer.save();

    return res.status(201).json({
      success: true,
      message: "Trainer created successfully.",
      trainer,
    });
  } catch (error) {
    console.error("Create Trainer Error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: validationMessage(error),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getAllTrainer

const getAllTrainers = async (req, res) => {
  try {
    const trainer = await Trainer.find({ isActive: true });

    if (trainer.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    // get all

    return res.status(200).json({
      success: true,
      count: trainer.length,
      trainer,
    });
  } catch (error) {
    console.log("Get All Trainers Error", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Trainer by ID

const getTrainerById = async (req, res) => {
  try {
    // find the id is valid or not
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trainer ID",
      });
    }
    const trainer = await Trainer.findOne({
      _id: req.params.id,
      isActive: true,
    });

    // find trainer exits or not
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found or is not active",
      });
    }

    // successful response

    return res.status(200).json({
      success: true,
      trainer,
    });
  } catch (error) {
    console.log("Get Trainer by id error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update the Trainer

const updateTrainer = async (req, res) => {
  try {
    // Validate the user id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trainer ID",
      });
    }

    //
    const trainer = await Trainer.findById(req.params.id);

    // find trainer exits or not
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }
    if (req.file) {
      // Delete old image
      if (trainer.profileImagePublicId) {
        await cloudinary.uploader.destroy(trainer.profileImagePublicId);
      }

      // Upload new image
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "apexfit/trainers",
      );

      trainer.profileImage = uploaded.url;
      trainer.profileImagePublicId = uploaded.public_id;
    }

    const {
      fullName,
      email,
      phone,
      gender,
      bio,
      specialization,
      experience,
      certifications,
      availableDays,
      availableTime,
      monthlyFee,
      personalTrainingFee,
      facebook,
      instagram,
      linkedin,
    } = req.body;

    if (experience !== undefined && experience < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience cannot be less than 0",
      });
    }

    if (monthlyFee !== undefined && monthlyFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly fee cannot be less than 0",
      });
    }

    if (personalTrainingFee !== undefined && personalTrainingFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Personal training fee cannot be less than 0",
      });
    }

    // Update only the fields provided in req.body

    if (fullName !== undefined) {
      if (fullName.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty ",
        });
      }

      trainer.fullName = fullName.trim();
    }

    if (email !== undefined) {
      if (email.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      const existingTrainer = await Trainer.findOne({
        email: email.trim().toLowerCase(),
      });

      if (
        existingTrainer &&
        existingTrainer._id.toString() !== trainer._id.toString()
      ) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      trainer.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) {
      if (phone.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Phone cannot be empty",
        });
      }

      trainer.phone = phone.trim();
    }

    if (gender !== undefined) {
      trainer.gender = gender;
    }

    if (bio !== undefined) {
      trainer.bio = bio;
    }

    if (specialization !== undefined) {
      trainer.specialization = parseJsonArray(specialization);
    }

    if (experience !== undefined) {
      trainer.experience = Number(experience) || 0;
    }

    if (certifications !== undefined) {
      trainer.certifications = parseJsonArray(certifications);
    }

    if (availableDays !== undefined) {
      trainer.availableDays = parseJsonArray(availableDays);
    }

    if (availableTime !== undefined) {
      trainer.availableTime = parseAvailableTime(availableTime);
    }

    if (monthlyFee !== undefined) {
      trainer.monthlyFee = Number(monthlyFee) || 0;
    }

    if (personalTrainingFee !== undefined) {
      trainer.personalTrainingFee = Number(personalTrainingFee) || 0;
    }

    if (facebook !== undefined) {
      trainer.socialLinks = { ...(trainer.socialLinks || {}), facebook };
    }

    if (instagram !== undefined) {
      trainer.socialLinks = { ...(trainer.socialLinks || {}), instagram };
    }

    if (linkedin !== undefined) {
      trainer.socialLinks = { ...(trainer.socialLinks || {}), linkedin };
    }

    // Save updated trainer
    await trainer.save();

    return res.status(200).json({
      success: true,
      message: "Trainer updated successfully",
      trainer,
    });
  } catch (error) {
    console.log("Error while Updating", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: validationMessage(error),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete the Trainer

const deleteTrainer = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trainer ID",
      });
    }
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    // Delete image from Cloudinary
    if (trainer.profileImagePublicId) {
      await cloudinary.uploader.destroy(trainer.profileImagePublicId);
    }

    await trainer.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Signed-in trainer edits their own profile (matched by account email).
const updateMyTrainerProfile = async (req, res) => {
  try {
    const user = await require("../models/User").findById(req.user.id);
    if (!user || user.role !== "trainer") {
      return res.status(403).json({ success: false, message: "Trainer accounts only." });
    }

    const trainer = await Trainer.findOne({ email: user.email });
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "No trainer profile is linked to your account yet. Ask an admin to create one using your email.",
      });
    }

    if (req.file) {
      if (trainer.profileImagePublicId) {
        await cloudinary.uploader.destroy(trainer.profileImagePublicId);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, "apexfit/trainers");
      trainer.profileImage = uploaded.url;
      trainer.profileImagePublicId = uploaded.public_id;
    }

    const {
      fullName,
      phone,
      gender,
      bio,
      specialization,
      certifications,
      experience,
      availableDays,
      availableTime,
      monthlyFee,
      personalTrainingFee,
      facebook,
      instagram,
      linkedin,
    } = req.body;

    // Name is editable and synced to the login account (not derived from email).
    if (fullName && fullName.trim()) {
      trainer.fullName = fullName.trim();
      await require("../models/User").findByIdAndUpdate(
        req.user.id,
        { name: fullName.trim() },
        { new: true },
      );
    }

    if (phone !== undefined) trainer.phone = phone;
    if (gender !== undefined) trainer.gender = gender;
    if (bio !== undefined) trainer.bio = bio;
    if (experience !== undefined) trainer.experience = Number(experience) || 0;
    if (monthlyFee !== undefined) trainer.monthlyFee = Number(monthlyFee) || 0;
    if (personalTrainingFee !== undefined) trainer.personalTrainingFee = Number(personalTrainingFee) || 0;

    // Array fields arrive as JSON strings when sent through FormData.
    const parseMaybeJson = (value, fallback) => {
      if (value === undefined) return fallback;
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed.filter(Boolean) : fallback;
      } catch {
        return String(value)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    };

    trainer.specialization = parseMaybeJson(specialization, trainer.specialization);
    trainer.certifications = parseMaybeJson(certifications, trainer.certifications);
    trainer.availableDays = parseMaybeJson(availableDays, trainer.availableDays);

    if (availableTime !== undefined) {
      try {
        const parsed = typeof availableTime === "string" ? JSON.parse(availableTime) : availableTime;
        if (parsed && typeof parsed === "object") {
          trainer.availableTime = { start: parsed.start || "", end: parsed.end || "" };
        }
      } catch {
        // ignore malformed availability payload
      }
    }

    trainer.socialLinks = {
      facebook: facebook ?? trainer.socialLinks?.facebook,
      instagram: instagram ?? trainer.socialLinks?.instagram,
      linkedin: linkedin ?? trainer.socialLinks?.linkedin,
    };

    await trainer.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      trainer,
    });
  } catch (error) {
    console.error("Update my trainer profile error:", error);
    return res.status(500).json({ success: false, message: "Could not update your profile." });
  }
};

module.exports = {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  updateMyTrainerProfile,
};
