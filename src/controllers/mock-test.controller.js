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
    // Fetch 20 random questions for the course
    const questions = await Question.aggregate([
      { $match: { course } }, // Match questions by course
      { $sample: { size: 20 } }, // Randomly sample 20 questions
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


module.exports = { getMockTestQuestions, submitMockTest };
