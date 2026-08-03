const express = require("express");
const router = express.Router();

const {
  createGallery,
  getAllGallery,
  getGalleryById,
  updateGallery,
  deleteGallery,
} = require("../controllers/galleryController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// Create Gallery
router.post("/", protect, upload.single("image"), createGallery);

// Get All Gallery
router.get("/", getAllGallery);

// Get Gallery By ID
router.get("/:id", getGalleryById);

// Update Gallery
router.put("/:id", protect, upload.single("image"), updateGallery);

// Delete Gallery
router.delete("/:id", protect, deleteGallery);

module.exports = router;
