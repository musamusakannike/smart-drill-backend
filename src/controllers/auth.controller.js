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
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
        data: null,
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Send refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond with access token
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Get the refresh token from the cookie

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token not provided.",
        data: null,
      });
    }

    // Verify the refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            status: "error",
            message: "Invalid or expired refresh token.",
            data: null,
          });
        }

        // Find the user
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found.",
            data: null,
          });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.status(200).json({
          status: "success",
          message: "Access token refreshed successfully",
          data: { accessToken: newAccessToken },
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
    data: null,
  });
};

module.exports = { signup, login, refreshAccessToken, logout };