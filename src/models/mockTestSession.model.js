const mongoose = require("mongoose");

const mockTestSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: String, required: true },
  questions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  ],
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  score: { type: Number, default: 0 },
});

module.exports = mongoose.model("MockTestSession", mockTestSessionSchema);
