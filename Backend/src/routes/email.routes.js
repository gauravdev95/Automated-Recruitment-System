const express = require("express");
const router = express.Router();
const ApplicationProgress = require('../models/applicationProgress.model.js');
const User = require('../models/user.model.js');
const Job = require('../models/job.model.js');
const Question = require("../models/question.model.js");
const { transporter } = require("../config/email.config.js");
const { generateTestEmailTemplate } = require("../controllers/email.controller.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const authenticate = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");





// Send Test Email Route
router.post("/send-test-email/:jobId", authenticate, requireRole("hr"), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { startTime, endTime, description, email } = req.body;
    let { jobTitle } = req.body;
    
    let applications;

    if (!process.env.TEST_SECRET) {
      return res.status(500).json({ error: "TEST_SECRET is not configured" });
    }

    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({ error: "FRONTEND_URL is not configured" });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "startTime and endTime are required" });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return res.status(400).json({ message: "A valid future test window is required" });
    }

    const questionCount = await Question.countDocuments({ jobId });
    if (questionCount === 0) {
      return res.status(400).json({ message: "Create at least one coding question before sending test links" });
    }

    if (!jobTitle) {
      const job = await Job.findById(jobId).select("title");
      jobTitle = job?.title || "Coding Test";
    }

    // If specific email/userId provided, send only to that user
    if (email) {
      // Try to find by email first, then by userId
      const userQuery = mongoose.Types.ObjectId.isValid(email)
        ? { $or: [{ email }, { _id: email }] }
        : { email };
      const user = await User.findOne(userQuery);

      const applicationQuery = user
        ? { jobId, userId: user._id, currentStage: "coding" }
        : { jobId, email, currentStage: "coding" };

      applications = await ApplicationProgress
        .find(applicationQuery)
        .populate("userId", "name email");

      if (!applications.length && !user) {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      // Send to all students in coding stage
      applications = await ApplicationProgress
        .find({ jobId, currentStage: "coding" })
        .populate("userId", "name email");
    }

    if (!applications.length) {
      return res.status(404).json({ message: "No students found for this email/job combination in coding stage" });
    }

    const sent = [];

    for (let app of applications) {
      const token = jwt.sign(
        {
          jobId,
          userId: app.userId._id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        },
        process.env.TEST_SECRET,
        { expiresIn: "12h" }
      );

      const testLink = `${process.env.FRONTEND_URL}/test/start/${token}`;

      app.testToken = token;
      app.testLink = testLink;
      app.testStartTime = startDate;
      app.testEndTime = endDate;
      app.testEmailSentAt = new Date();
      await app.save();

      const emailContent = generateTestEmailTemplate({
        name: app.userId.name,
        email: app.userId.email,
        description,
        jobTitle,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        testLink,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: app.userId.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      sent.push({
        name: app.userId.name,
        email: app.userId.email,
        testLink,
      });
    }

    res.json({
      message: "Test links sent successfully",
      sent,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Send Test Email to Specific User
router.post("/send-test-email/:jobId/:userId", authenticate, requireRole("hr"), async (req, res) => {
  try {
    const { jobId, userId } = req.params;
    const { startTime, endTime, description, jobTitle } = req.body || {};

    if (!process.env.TEST_SECRET) {
      return res.status(500).json({ error: "TEST_SECRET is not configured" });
    }

    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({ error: "FRONTEND_URL is not configured" });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (!startTime || !endTime || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return res.status(400).json({ message: "A valid future test window is required" });
    }

    const questionCount = await Question.countDocuments({ jobId });
    if (questionCount === 0) {
      return res.status(400).json({ message: "Create at least one coding question before sending test links" });
    }

    const application = await ApplicationProgress
      .findOne({ jobId, userId, currentStage: "coding" })
      .populate("userId", "name email");

    if (!application) {
      return res.status(404).json({
        message: "Application not found for this user and job"
      });
    }

    const token = jwt.sign(
      {
        jobId,
        userId: application.userId._id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      },
      process.env.TEST_SECRET,
      { expiresIn: "12h" }
    );

    const testLink = `${process.env.FRONTEND_URL}/test/start/${token}`;

    application.testToken = token;
    application.testLink = testLink;
    application.testStartTime = startDate;
    application.testEndTime = endDate;
    application.testEmailSentAt = new Date();
    await application.save();

    const emailContent = generateTestEmailTemplate({
      name: application.userId.name,
      email: application.userId.email,
      description,
      jobTitle,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      testLink,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: application.userId.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    res.json({
      message: "Test email sent successfully to user",
      sent: {
        name: application.userId.name,
        email: application.userId.email,
        testLink,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
