const express = require("express");
const router = express.Router();

const {
  applyToJob,
  fetchAllJob,
  calculateResumeScore,
  getStudentsByJobId,
  getJobsByHRId,
  stageChange,
  stageChangeInStudent,
  getJobById,
  getCurrentStageofStudent,
  getJobStudents,
  markApplicantContacted,
  shortlistTopByResume,
  shortlistTopByTest
} = require("../controllers/job.controller");

const authenticate = require("../middlewares/auth.middleware");

// Apply to a Job
router.post("/apply/:jobId", authenticate, applyToJob);

// Stage Change
router.post("/:jobId/stageChange", authenticate, stageChange);
router.post("/:jobId/stageChangeInStudent", authenticate, stageChangeInStudent);

// Fetch Jobs
router.get("/alljob", fetchAllJob);
router.get("/getjobs", authenticate, getJobsByHRId);

// Fetch Students
router.get("/students/:jobId", authenticate, getStudentsByJobId);
router.get("/test/:jobId", authenticate, getJobStudents);
router.post("/applicants/:applicationId/mark-contacted", authenticate, markApplicantContacted);
router.post("/:jobId/shortlist/resume", authenticate, shortlistTopByResume);
router.post("/:jobId/shortlist/test", authenticate, shortlistTopByTest);

// Resume Screening
router.post("/:jobId/resume-screen", authenticate, calculateResumeScore);

router.get("/my-applications-stages", authenticate, getCurrentStageofStudent);

// Get Job by ID
router.get("/:id", getJobById);

module.exports = router;
