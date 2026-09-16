const express = require("express");
const router = express.Router();
const ApplicationProgress = require("../models/applicationProgress.model");

router.get("/verify/:jobId/:studentId/:token", async (req, res) => {
  const { jobId, studentId, token } = req.params;
  const progress = await ApplicationProgress.findOne({ jobId, userId: studentId });
  if (!progress) return res.status(404).json({ error: "Not found" });
  if (progress.testToken !== token) return res.status(401).json({ error: "Invalid token" });
  res.json({ ok: true, testLink: progress.testLink });
});

module.exports = router;
