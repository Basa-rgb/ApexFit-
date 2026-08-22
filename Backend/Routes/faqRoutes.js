const express = require("express");
const { getFAQs, getAllFAQsAdmin, createFAQ, updateFAQ, deleteFAQ } = require("../controllers/faqController");
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

const router = express.Router();

// Public FAQ list used by the Contact page.
router.get("/", getFAQs);

// Admin: full FAQ list for management.
router.get("/admin/all", protect, isAdmin, getAllFAQsAdmin);
router.post("/", protect, isAdmin, createFAQ);
router.put("/:id", protect, isAdmin, updateFAQ);
router.delete("/:id", protect, isAdmin, deleteFAQ);

module.exports = router;
