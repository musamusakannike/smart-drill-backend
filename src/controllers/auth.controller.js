const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { validateSignup, validateLogin } = require("../utils/validation");

const signup = async (req, res, next) => {
  try {
    // Validate request data
    const { error } = validateSignup(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    const { fullname, username, email, password, university, course, role } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
        data: null,
      });
    }

    // Create and save the new user
    const user = new User({
      fullname,
      username,
      email,
      password,
      university,
      course,
      role,
    });

    await user.save();

    // Respond with success
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error)
      return res
        .status(400)
        .json({
          status: "error",
          message: error.details[0].message,
          data: null,
        });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({
          status: "error",
          message: "Invalid email or password",
          data: null,
        });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "72h",
    });
    res.success({ token }, "Login successful");
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login };
