const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: [
        (options) => options.length === 4,
        "Four options are required.",
      ],
      required: true,
    },
    correctOption: { type: Number, required: true, min: 1, max: 4 },
    explanation: { type: String, required: true },
    tags: { type: [String], default: [] },
    course: { type: String, required: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
