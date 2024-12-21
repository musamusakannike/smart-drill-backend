const express = require("express");
const { getMockTestQuestions, submitMockTest } = require("../controllers/mock-test.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Fetch random questions for the mock test
router.get("/", authenticate, getMockTestQuestions);

// Submit mock test answers
router.post("/submit", authenticate, submitMockTest);

module.exports = router;
