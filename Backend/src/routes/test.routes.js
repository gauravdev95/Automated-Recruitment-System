const express = require("express");
const router = express.Router();

// Middleware
const auth = require("../middlewares/auth.middleware");

// Controllers
const {
  enableTestSection,
  sendTestEmail,
  submitTest,
} = require("../controllers/test.controller");

// Submit a single test answer
router.post("/submit", auth, submitTest);

// Enable test section for a job
router.put("/enable/:jobId", auth, enableTestSection);

// Send test invitation emails
router.post("/email/:jobId", auth, sendTestEmail);

module.exports = router;