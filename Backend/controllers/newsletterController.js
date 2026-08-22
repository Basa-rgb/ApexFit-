const Newsletter = require("../models/Newsletter");

// Subscribe
const subscribeNewsletter = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      return res.status(409).json({
        success: false,
        message: "Email is already subscribed",
      });
    }

    const subscriber = await Newsletter.create({
      // Fall back to the signed-in user's name, then the email prefix.
      name: name || req.user?.name || String(email).split("@")[0],
      email,
    });

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      subscriber,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all subscribers
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: subscribers.length,
      subscribers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete subscriber
const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  subscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber,
};