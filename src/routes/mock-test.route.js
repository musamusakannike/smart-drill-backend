const express = require("express");
const { getMockTestQuestions, submitMockTest, getMockTestHistory, getMockTestDetails } = require("../controllers/mock-test.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Fetch random questions for the mock test
router.get("/", authenticate, getMockTestQuestions);

// Submit mock test answers
router.post("/submit", authenticate, submitMockTest);

// Fetch all mock tests taken by the user
router.get("/history", authenticate, getMockTestHistory);

// Route to get a specific mock test details by sessionId
router.get("/history/:sessionId", getMockTestDetails);

module.exports = router;
