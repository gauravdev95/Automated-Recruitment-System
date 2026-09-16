const express = require("express");
const router = express.Router();

// Middleware
const auth = require("../middlewares/auth.middleware");

// Controllers
const { enableTestSection, submitTest } = require("../controllers/test.controller");
const requireRole = require("../middlewares/role.middleware");

// Submit a single test answer
router.post("/submit", auth, submitTest);

// Enable test section for a job (HR only)
router.put("/enable/:jobId", auth, requireRole("hr"), enableTestSection);

module.exports = router;