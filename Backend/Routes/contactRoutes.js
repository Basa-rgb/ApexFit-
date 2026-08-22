const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactById,
  deleteContactById,
} = require("../controllers/contactController");

const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

// Create Contact (Public)
router.post("/", createContact);

// Get All Contacts (Admin only)
router.get("/", protect, isAdmin, getAllContacts);

// Get Contact By ID (Admin only)
router.get("/:id", protect, isAdmin, getContactById);

// Update Contact (Admin only)
router.put("/:id", protect, isAdmin, updateContactById);

// Delete Contact (Admin only)
router.delete("/:id", protect, isAdmin, deleteContactById);

module.exports = router;