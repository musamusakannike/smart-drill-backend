const Question = require("../models/question.model");
const MockTestSession = require("../models/mockTestSession.model");

// Fetch Random Questions for Mock Test
const getMockTestQuestions = async (req, res) => {
  const { course } = req.query;
  if (!course) {
    return res
      .status(400)
      .json({ status: "error", message: "Course is required." });
  }

  try {
    // Determine the number of questions to fetch
    const questionCount = course === "GST111" ? 60 : 20;

    // Fetch random questions based on the course
    const questions = await Question.aggregate([
      { $match: { course } }, // Match questions by course
      { $sample: { size: questionCount } }, // Randomly sample questions
      {
        $project: {
          correctOption: 0, // Exclude the correctOption field
        },
      },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No questions found for this course.",
      });
    }

    // Save test session to the database
    const testSession = new MockTestSession({
      userId: req.user._id,
      course,
      questions: questions.map((q) => q._id),
      startTime: new Date(),
    });
    await testSession.save();

    // Include sessionId in the response
    res.json({
      status: "success",
      message: "Mock test questions retrieved successfully.",
      data: {
        sessionId: testSession._id, // Return the session ID
        questions,
      },
    });
  } catch (error) {
    console.error("Error fetching mock test questions:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

// Submit Mock Test Answers
const submitMockTest = async (req, res) => {
  const { sessionId, answers } = req.body;
  if (!sessionId || !answers) {
    return res.status(400).json({ status: "error", message: "Invalid input." });
  }

  try {
    // Find the mock test session
    const testSession = await MockTestSession.findById(sessionId).populate(
      "questions"
    );
    if (!testSession) {
      return res
        .status(404)
        .json({ status: "error", message: "Test session not found." });
    }

    // Calculate the score
    let score = 0;
    const corrections = testSession.questions.map((question, index) => {
      const isCorrect = question.correctOption === answers[index];
      if (isCorrect) score += 1;

      return {
        question: question.question,
        options: question.options,
        correctOption: question.correctOption,
        userAnswer: answers[index],
        isCorrect,
        explanation: question.explanation,
      };
    });

    // Save the test completion time and score
    testSession.endTime = new Date();
    testSession.score = score;
    await testSession.save();

    res.json({
      status: "success",
      message: "Test submitted successfully.",
      data: {
        score,
        total: testSession.questions.length,
        percentage: ((score / testSession.questions.length) * 100).toFixed(2),
        corrections, // Include correction details
      },
    });
  } catch (error) {
    console.error("Error submitting mock test:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

const getMockTestHistory = async (req, res) => {
  try {
    // Find all mock test sessions for the authenticated user
    const mockTests = await MockTestSession.find({ userId: req.user._id })
      .populate("questions") // Populate question details if needed
      .sort({ startTime: -1 }); // Sort by most recent first

    if (mockTests.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No mock test history found.",
      });
    }

    // Format the response
    const mockTestDetails = mockTests.map((test) => ({
      sessionId: test._id,
      course: test.course,
      score: test.score,
      totalQuestions: test.questions.length,
      percentage: ((test.score / test.questions.length) * 100).toFixed(2),
      startTime: test.startTime,
      endTime: test.endTime,
      questions: test.questions.map((question) => ({
        question: question.question,
        options: question.options,
        explanation: question.explanation,
      })),
    }));

    res.json({
      status: "success",
      message: "Mock test history retrieved successfully.",
      data: mockTestDetails,
    });
  } catch (error) {
    console.error("Error fetching mock test history:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

const getMockTestDetails = async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Find the mock test session by its ID
    const testSession = await MockTestSession.findById(sessionId).populate(
      "questions"
    );

    if (!testSession) {
      return res
        .status(404)
        .json({ status: "error", message: "Mock test session not found." });
    }

    // Format the response
    const mockTestDetails = {
      sessionId: testSession._id,
      course: testSession.course,
      score: testSession.score,
      totalQuestions: testSession.questions.length,
      percentage: (
        (testSession.score / testSession.questions.length) *
        100
      ).toFixed(2),
      startTime: testSession.startTime,
      endTime: testSession.endTime,
      corrections: testSession.questions.map((question) => ({
        question: question.question,
        options: question.options,
        correctOption: question.correctOption,
        explanation: question.explanation,
      })),
    };

    res.json({
      status: "success",
      message: "Mock test details retrieved successfully.",
      data: mockTestDetails,
    });
  } catch (error) {
    console.error("Error fetching mock test details:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};


module.exports = { getMockTestQuestions, submitMockTest, getMockTestHistory, getMockTestDetails };
