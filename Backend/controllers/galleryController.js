const Gallery = require("../models/Gallery");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const mongoose = require("mongoose");
// Create the gallery

const createGallery = async (req, res) => {
  try {
    //  req body

    const { title, category, date } = req.body;
    // Validate the field
    if (!title || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // check img exits or not
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required in Gallery",
      });
    }

    const existingGallery = await Gallery.findOne({ title: title.trim() });

    // Duplicate check
    if (existingGallery) {
      return res.status(400).json({
        success: false,
        message: "Gallery already exits",
      });
    }

    // Upload to cloudinary
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      "apexfit/gallery",
    );
    const images = uploaded.url;

    // creating the gallery again

    const newGallery = await Gallery.create({
      title: title.trim(),
      image: uploaded.url,
      category,
      date,
    });

    // return successful res
    return res.status(201).json({
      success: true,
      message: "Gallery created successfully",
      gallery: newGallery,
    });

    // Catch blog
  } catch (error) {
    console.error("Error while creating Gallery ", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all Gallery

const getAllGallery = async (req, res) => {
  try {
    // find and sort (It's show fron new to old)
    const galleries = await Gallery.find().sort({ createdAt: -1 });

    // check imgaes found or not
    if (galleries.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No gallery images found",
        count: 0,
        galleries: [],
      });
    }

    // return successfull response

    return res.status(200).json({
      success: true,
      count: galleries.length,
      galleries,
    });

    // Catch block
  } catch (error) {
    console.error("Error while getting gallery:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GEt Gallery By Id

const getGalleryById = async (req, res) => {
  try {
    // Validate Gallery ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gallery ID",
      });
    }

    const { id } = req.params;

    // Find gallery
    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    return res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    console.error("Error while getting gallery:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update the Gallery



const updateGallery = async (req, res) => {
  try {
    // Validate Gallery ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gallery ID",
      });
    }

    const { id } = req.params;

    // Find gallery
    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    const { title, category, date } = req.body;

    // Check duplicate title
    if (title !== undefined && title.trim() !== gallery.title) {
      const existingGallery = await Gallery.findOne({
        title: title.trim(),
      });

      if (
        existingGallery &&
        existingGallery._id.toString() !== gallery._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Gallery title already exists",
        });
      }

      gallery.title = title.trim();
    }

    // Update fields
    if (category !== undefined) {
      gallery.category = category;
    }

    if (date !== undefined) {
      gallery.date = date;
    }

    // Update image if provided
    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "apexfit/gallery",
      );

      gallery.image = uploaded.url;
    }

    await gallery.save();

    return res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      gallery,
    });
  } catch (error) {
    console.error("Error while updating gallery:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete the Gallery



const deleteGallery = async (req, res) => {
  try {
    // Validate Gallery ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gallery ID",
      });
    }

    const { id } = req.params;

    // Find gallery
    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    // Delete gallery
    await gallery.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Gallery deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting gallery:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createGallery,
  getAllGallery,
  getGalleryById,
  updateGallery,
  deleteGallery,
};
