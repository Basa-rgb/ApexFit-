const { default: mongoose } = require("mongoose");
const MembershipPlan = require("../models/MembershipPlan");

const createMembershipPlan = async (req, res) => {
  try {
    const { name, description, duration, price, features, planType } = req.body;

    // validate these fields
    if (!name || !description || !duration || !price || !planType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // validate the price and duration

    if (price < 0 || duration < 1) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be less than 0 and duration must be at least 1",
      });
    }

    const existingName = await MembershipPlan.findOne({
      name: name.trim(),
    });

    // find plan exits or not
    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "MembershipPlan already exist",
      });
    }

    const plan = new MembershipPlan({
      name: name.trim(),
      description: description.trim(),
      duration,
      price,
      features,
      planType,
    });

    await plan.save();

    // return successful response

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.log("Error while creating", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get All Membership Plans

const getAllMembershipPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true });

    // find plans exits or not
    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No plans found",
      });
    }

    // Send successful return

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.log("Get all membership plans error", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get plans by Id

const getMembershipPlanById = async (req, res) => {
  try {
    // check id is valid or not
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership ID",
      });
    }

    const membership = await MembershipPlan.findById(req.params.id);
    // if membership not found

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // return res successfully
    return res.status(200).json({
      success: true,
      membership,
    });

    // return catch block
  } catch (error) {
    console.log("Error while getting membership by Id", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateMembershipPlan = async (req, res) => {
  try {
    // Validate Membership ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership ID",
      });
    }

    // Find membership plan
    const membership = await MembershipPlan.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    const { name, description, duration, price, features, planType, isActive } =
      req.body;

    // Validate name
    if (name !== undefined) {
      if (name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      // Check duplicate name
      const existingPlan = await MembershipPlan.findOne({
        name: name.trim(),
      });

      if (
        existingPlan &&
        existingPlan._id.toString() !== membership._id.toString()
      ) {
        return res.status(409).json({
          success: false,
          message: "Membership plan already exists",
        });
      }

      membership.name = name.trim();
    }

    // Validate description
    if (description !== undefined) {
      if (description.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }

      membership.description = description.trim();
    }

    // Validate duration
    if (duration !== undefined) {
      if (duration < 1) {
        return res.status(400).json({
          success: false,
          message: "Duration must be at least 1 month",
        });
      }

      membership.duration = duration;
    }

    // Validate price
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be less than 0",
        });
      }

      membership.price = price;
    }

    // Update optional fields
    if (features !== undefined) {
      membership.features = features;
    }

    if (planType !== undefined) {
      membership.planType = planType;
    }

    if (isActive !== undefined) {
      membership.isActive = isActive;
    }

    // Save updated membership
    await membership.save();

    return res.status(200).json({
      success: true,
      message: "Membership plan updated successfully",
      membership,
    });
  } catch (error) {
    console.log("Update Membership Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete membership plan

const deleteMembershipPlan = async (req, res) => {
  try {

    // find Id is valid or not
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership Id",
      });
    }

    const membership = await MembershipPlan.findById(req.params.id);

    // find membership exits or not

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "membership not found",
      });
    }

    await membership.deleteOne();

    // return successful res
    return res.status(200).json({
      success: true,
      message: "Membership plan deleted successfully",
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
  createMembershipPlan,
  getAllMembershipPlans,
  getMembershipPlanById,
  updateMembershipPlan,
  deleteMembershipPlan
};
