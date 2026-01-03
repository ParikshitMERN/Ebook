const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  contenr: {
    type: String,
    default: "",
  },
});

const BookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    chapters: [ChapterSchema],
    status: {
      type: String,
      Enumerator: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", BookSchema);
