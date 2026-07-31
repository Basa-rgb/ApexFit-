const mongoose = require("mongoose");
const Contact = require("../models/Contacts");

// Create Contact
const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Validate phone number
    if (phone.trim().length < 7) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Contact message sent successfully",
      contact,
    });

  } catch (error) {
    console.log("Create Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Get All Contacts
const getAllContacts = async (req, res) => {
  try {

    const contacts = await Contact.find().sort({ createdAt: -1 });

    if (contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No contact messages found",
      });
    }

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });

  } catch (error) {

    console.log("Get All Contacts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};



// Get Contact By ID
const getContactById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Contact ID",
      });
    }

    // Find contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });

  } catch (error) {

    console.log("Get Contact By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};



// Update Contact By ID
const updateContactById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Contact ID",
      });
    }

    // Find Contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    const { name, email, phone, message, status } = req.body;

    // Validate status
    if (
      status !== undefined &&
      !["Pending", "Replied"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact status",
      });
    }

    // Update fields
    if (name !== undefined) {
      contact.name = name;
    }

    if (email !== undefined) {
      contact.email = email;
    }

    if (phone !== undefined) {
      contact.phone = phone;
    }

    if (message !== undefined) {
      contact.message = message;
    }

    if (status !== undefined) {
      contact.status = status;
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      contact,
    });

  } catch (error) {

    console.log("Update Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Delete Contact By ID
const deleteContactById = async (req, res) => {
  try {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Contact ID",
      });
    }

    // Find Contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Delete Contact
    await contact.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });

  } catch (error) {

    console.log("Delete Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};






module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactById,
  deleteContactById
};