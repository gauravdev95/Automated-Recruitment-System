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
const requireRole = require("../middlewares/role.middleware");

// Apply to a Job
router.post("/apply/:jobId", authenticate, applyToJob);

// HR only: advance the pipeline
router.post("/:jobId/stageChange", authenticate, requireRole("hr"), stageChange);
router.post("/:jobId/stageChangeInStudent", authenticate, requireRole("hr"), stageChangeInStudent);

// Fetch Jobs
router.get("/alljob", fetchAllJob);
router.get("/getjobs", authenticate, requireRole("hr"), getJobsByHRId);

// Fetch Students (HR views the applicant pipeline)
router.get("/students/:jobId", authenticate, requireRole("hr"), getStudentsByJobId);
router.get("/test/:jobId", authenticate, requireRole("hr"), getJobStudents);
router.post("/applicants/:applicationId/mark-contacted", authenticate, requireRole("hr"), markApplicantContacted);
router.post("/:jobId/shortlist/resume", authenticate, requireRole("hr"), shortlistTopByResume);
router.post("/:jobId/shortlist/test", authenticate, requireRole("hr"), shortlistTopByTest);

// Resume Screening (run by HR)
router.post("/:jobId/resume-screen", authenticate, requireRole("hr"), calculateResumeScore);

router.get("/my-applications-stages", authenticate, getCurrentStageofStudent);

// Get Job by ID
router.get("/:id", getJobById);

module.exports = router;
