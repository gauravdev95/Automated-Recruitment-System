const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const {
  createQuestion,
  getQuestionsByJob,
  runQuestion,
  submitQuestion,
} = require("../controllers/question.controller");

// Create a new question (HR only)
router.post("/create", authenticate, requireRole("hr"), createQuestion);

// Get questions by jobId (Student)
// auth is handled inside the controller — students access via the test page
router.get("/:jobId", getQuestionsByJob);

// Run / submit a solution (Student)
// Both validate the coding-test token (TEST_SECRET) issued per application,
// so no JWT middleware here.
router.post("/run", runQuestion);
router.post("/submit", submitQuestion);

module.exports = router;
