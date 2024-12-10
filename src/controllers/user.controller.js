const User = require("../models/user.model");

// Get user details
const getUserDetails = async (req, res) => {
  res.success({ user: req.user }, "User details retrieved successfully.");
};

// Update user details
const updateUserDetails = async (req, res) => {
  const id = req.params.id || req.user._id;
  const { fullname, email, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found.", data: null });
    }

    if (req.user.role !== "admin" && req.user._id !== id) {
      return res
        .status(403)
        .json({ status: "error", message: "Access denied.", data: null });
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (role && req.user.role === "admin") user.role = role;

    await user.save();

    res.success({ user }, "User details updated successfully.");
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

// Get paginated list of all users (Admin only)
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  try {
    const skip = (page - 1) * limit;

    // Create a filter object for searching users
    const filter = {};
    if (search) {
      filter.$or = [
        { fullname: { $regex: search, $options: "i" } }, // Case-insensitive search by fullname
        { email: { $regex: search, $options: "i" } }, // Case-insensitive search by email
      ];
    }

    const totalUsers = await User.countDocuments(filter); // Count matching users
    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .select("-password") // Exclude the password field from the results
      .sort({ createdAt: -1 }); // Sort by most recently created users

    res.success(
      {
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: Number(page),
      },
      "Users retrieved successfully."
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

module.exports = { getUserDetails, updateUserDetails, getAllUsers };
