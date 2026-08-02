const User = require("../models/User");

// getting User profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    // Check user exits or not

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // get user profile

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Get profile error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update //profile

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    // chcek user exit or not

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get data form req body

    const { name } = req.body;

    // Update the allowed field
if (name !== undefined) {
  if (name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Name cannot be empty",
    });
  }

  user.name = name.trim();
}

    // Save update user

    await user.save();

    // return successful response

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Profile

const deleteAccount = async(req, res)=>{
  try {
    const user = await User.findById(req.user.id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }

    // delete user

    await user.deleteOne()

    // send delete response

    return res.status(200).json({
      success:true,
      message:"Account deleted successfully"
    });

  } catch (error) {
    console.log("Delete user error", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
}

module.exports = { getProfile, updateProfile , deleteAccount };
