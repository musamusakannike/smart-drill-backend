const Question = require("../models/question.model");
const User = require("../models/user.model");
const { questionValidation } = require("../utils/validation");

// Add a new question
const addQuestion = async (req, res) => {
  const { error } = questionValidation.addQuestion.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "error", message: error.message, data: null });

  try {
    const question = new Question({ ...req.body, addedBy: req.user._id });
    await question.save();
    res.success({ question }, "Question added successfully.");
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

// Add questions from a list of questions
const addQuestionsFromJson = async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "Invalid input. Provide an array of questions.",
      });
  }

  try {
    // Validate and transform input
    const validQuestions = questions.map((q) => {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !q.correctOption ||
        !q.tags ||
        !q.course ||
        !q.explanation
      ) {
        throw new Error("Invalid question structure.");
      }

      return {
        question: q.question,
        options: q.options,
        correctOption: q.correctOption, // Ensure this is a 1-based index
        tags: q.tags,
        course: q.course,
        explanation: q.explanation,
        addedBy: req.user._id, // Automatically assign the authenticated user's ID
      };
    });

    // Save all questions to the database
    const savedQuestions = await Question.insertMany(validQuestions);

    res.success(
      { savedQuestions },
      `${savedQuestions.length} questions added successfully.`
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: error.message || "Server error." });
  }
};

// Update a question
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res
        .status(404)
        .json({ status: "error", message: "Question not found.", data: null });

    Object.assign(question, req.body);
    await question.save();
    res.success({ question }, "Question updated successfully.");
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question)
      return res
        .status(404)
        .json({ status: "error", message: "Question not found.", data: null });

    res.success(null, "Question deleted successfully.");
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

// Get all questions
const getQuestions = async (req, res) => {
  const { page = 1, limit = 10, search, tags, course } = req.query;

  try {
    const skip = (page - 1) * limit;

    // Create a filter object based on query parameters
    const filter = {};

    if (search) {
      filter.question = { $regex: search, $options: "i" }; // Case-insensitive search in 'question' field
    }

    if (tags) {
      filter.tags = { $in: tags.split(",") }; // Match any tag in the comma-separated list
    }

    if (course) {
      filter.course = course; // Exact match for course
    }

    const totalQuestions = await Question.countDocuments(filter); // Count documents matching filter
    const questions = await Question.find(filter)
      .skip(skip)
      .limit(Number(limit));

    res.success(
      {
        questions,
        totalQuestions,
        totalPages: Math.ceil(totalQuestions / limit),
        currentPage: Number(page),
      },
      "Questions retrieved successfully."
    );
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

// Toggle favorite question (User only)
const toggleFavoriteQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    // Validate if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ status: "error", message: "Question not found.", data: null });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found.", data: null });
    }

    // Check if the question is already in favorites
    const isFavorited = user.favoriteQuestions.includes(questionId);

    if (isFavorited) {
      // Remove from favorites
      user.favoriteQuestions = user.favoriteQuestions.filter(
        (id) => id.toString() !== questionId
      );
    } else {
      // Add to favorites
      user.favoriteQuestions.push(questionId);
    }

    await user.save();

    res.success(
      { isFavorited: !isFavorited },
      isFavorited
        ? "Question removed from favorites."
        : "Question added to favorites."
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

// GET favorite questions
const getFavoriteQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "favoriteQuestions"
    );
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found.", data: null });
    }

    res.success(
      { favoriteQuestions: user.favoriteQuestions },
      "Favorite questions retrieved successfully."
    );
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Server error.", data: null });
  }
};

module.exports = {
  addQuestion,
  addQuestionsFromJson,
  updateQuestion,
  deleteQuestion,
  getQuestions,
  toggleFavoriteQuestion,
  getFavoriteQuestions,
};
