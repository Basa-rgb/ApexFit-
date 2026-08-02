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

// Create Contact (Public)
router.post("/", createContact);

// Get All Contacts
router.get("/", protect, getAllContacts);

// Get Contact By ID
router.get("/:id", protect, getContactById);

// Update Contact
router.put("/:id", protect, updateContactById);

// Delete Contact
router.delete("/:id", protect, deleteContactById);

module.exports = router;