const mongoose = require("mongoose");
const Trainer = require("../models/Trainer");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getAllTrainer

const getAllTrainers = async (req, res) => {
  try {
    const trainer = await Trainer.find();

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
    const trainer = await Trainer.findById(req.params.id);

    // find trainer exits or not
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
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
      trainer.specialization = specialization;
    }

    if (experience !== undefined) {
      trainer.experience = experience;
    }

    if (certifications !== undefined) {
      trainer.certifications = certifications;
    }

    if (availableDays !== undefined) {
      trainer.availableDays = availableDays;
    }

    if (availableTime !== undefined) {
      trainer.availableTime = availableTime;
    }

    if (monthlyFee !== undefined) {
      trainer.monthlyFee = monthlyFee;
    }

    if (personalTrainingFee !== undefined) {
      trainer.personalTrainingFee = personalTrainingFee;
    }

    if (facebook !== undefined) {
      trainer.socialLinks.facebook = facebook;
    }

    if (instagram !== undefined) {
      trainer.socialLinks.instagram = instagram;
    }

    if (linkedin !== undefined) {
      trainer.socialLinks.linkedin = linkedin;
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

module.exports = {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
};
