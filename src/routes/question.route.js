const express = require("express");
const {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestions,
  toggleFavoriteQuestion,
  getFavoriteQuestions
} = require("../controllers/question.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Routes
router.post("/", authenticate, authorize("admin"), addQuestion);
router.put("/:id", authenticate, authorize("admin"), updateQuestion);
router.delete("/:id", authenticate, authorize("admin"), deleteQuestion);
router.get("/", authenticate, getQuestions);
router.patch("/favourite/:questionId", authenticate, toggleFavoriteQuestion);
router.get("/favourite", authenticate, getFavoriteQuestions);

module.exports = router;
