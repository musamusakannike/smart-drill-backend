const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

// Import custom middlewares
const responseHandler = require("./middlewares/response.middleware");
const errorHandler = require("./middlewares/error.middleware");

// Database connection and configuration
const connectDB = require("./config/db.config");

// Routes
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const questionRoutes = require("./routes/question.route");

const app = express();
connectDB();

// Middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Custom Response Middleware
app.use(responseHandler);

// Routes
app.get("/", (req, res) => {
  res.success({}, "SERVER IS RUNNING....");
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/questions", questionRoutes);

// Fallback for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    data: null,
  });
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
