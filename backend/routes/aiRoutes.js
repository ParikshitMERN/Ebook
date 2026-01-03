const express = require("express");
const router = express.Router();
const {
  generateOutline,
  generateChapterContent,
} = require("../controller/aiController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/generate-outline", protect, generateOutline);
router.post("/generate-chapter-content", protect, generateChapterContent);

module.exports = router;
