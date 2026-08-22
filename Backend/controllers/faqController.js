const mongoose = require("mongoose");
const FAQ = require("../models/FAQ");

// Return active FAQs for the public contact page.
const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ success: true, faqs });
  } catch (error) {
    console.error("Get FAQs Error:", error);
    return res.status(500).json({ success: false, message: "Could not load FAQs." });
  }
};

// Admin: every FAQ including hidden ones for management.
const getAllFAQsAdmin = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ success: true, faqs });
  } catch (error) {
    console.error("Get All FAQs Error:", error);
    return res.status(500).json({ success: false, message: "Could not load FAQs." });
  }
};

// Allow administrators to add FAQ content from the admin API.
const createFAQ = async (req, res) => {
  try {
    const { question, answer, order = 0, isActive = true } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and answer are required." });
    }

    const faq = await FAQ.create({ question, answer, order, isActive });
    return res.status(201).json({ success: true, faq });
  } catch (error) {
    console.error("Create FAQ Error:", error);
    return res.status(500).json({ success: false, message: "Could not create FAQ." });
  }
};

// Update an FAQ (admin).
const updateFAQ = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid FAQ ID." });
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found." });

    const { question, answer, order, isActive } = req.body;
    if (question !== undefined) faq.question = String(question).trim();
    if (answer !== undefined) faq.answer = String(answer).trim();
    if (order !== undefined) faq.order = Number(order) || 0;
    if (isActive !== undefined) faq.isActive = Boolean(isActive);

    await faq.save();
    return res.status(200).json({ success: true, message: "FAQ updated successfully.", faq });
  } catch (error) {
    console.error("Update FAQ Error:", error);
    return res.status(500).json({ success: false, message: "Could not update FAQ." });
  }
};

// Delete an FAQ (admin).
const deleteFAQ = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid FAQ ID." });
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found." });

    await faq.deleteOne();
    return res.status(200).json({ success: true, message: "FAQ deleted successfully." });
  } catch (error) {
    console.error("Delete FAQ Error:", error);
    return res.status(500).json({ success: false, message: "Could not delete FAQ." });
  }
};

module.exports = { getFAQs, getAllFAQsAdmin, createFAQ, updateFAQ, deleteFAQ };
