const ApplicationProgress = require("../models/applicationProgress.model.js");
const Job = require("../models/job.model.js");
const Question = require("../models/question.model.js");
require("dotenv").config();

const { generateTestEmailTemplate } = require("../controllers/email.controller.js");
const { runCode } = require("../services/judge.service.js");

// Judge0 language id map (keyed by the language names the frontend sends)
const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  java: 62,

  // C / C++
  c: 50,
  cpp: 54,

  // Other popular languages
  csharp: 51,
  go: 60,
  kotlin: 78,
  rust: 73,
  php: 68,
  ruby: 72,

  // Scripting / misc
  bash: 46,
  typescript: 74,
  swift: 83,
};

// Enable the coding test section for a job (HR action)
const enableTestSection = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: { testSection: true } },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json({
      message: "Test section enabled successfully",
      job,
    });
  } catch (error) {
    console.error("Error in enableTestSection:", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Send test invitation emails to candidates currently in the coding stage
const sendTestEmail = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { description, startTime, endTime } = req.body || {};

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applicants = await ApplicationProgress.find({
      jobId,
      currentStage: "coding",
    }).populate("userId", "name email");

    if (!applicants.length) {
      return res.status(404).json({
        message: "No applicants found in coding stage",
      });
    }

    for (const applicant of applicants) {
      if (!applicant.userId) continue;

      const testLink = `${process.env.APP_BASE_URL}/test/${applicant.userId._id}/${job._id}?start=${encodeURIComponent(
        startTime
      )}&end=${encodeURIComponent(endTime)}`;

      const emailTemplate = generateTestEmailTemplate({
        name: applicant.userId.name,
        description,
        jobTitle: job.title,
        startTime,
        endTime,
        testLink,
      });

      await sendEmail({
        to: applicant.userId.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    res.json({ message: "Test emails sent successfully!" });
  } catch (error) {
    console.error("Error sending test emails:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Submit a single question answer and grade it against the test cases
const submitTest = async (req, res, next) => {
  try {
    const { code, language, questionId } = req.body || {};

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const { results, passedCount, total } = await runCode(
      code,
      languageId,
      question.testCases
    );

    res.status(200).json({
      success: true,
      passed: passedCount,
      total,
      testCaseResults: results,
    });
  } catch (error) {
    next(error); // goes to error.middleware.js
  }
};

module.exports = {
  enableTestSection,
  sendTestEmail,
  submitTest,
};