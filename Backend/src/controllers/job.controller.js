require("dotenv").config();
const mongoose = require("mongoose");
const ApplicationProgress = require('../models/applicationProgress.model.js');
const Job = require('../models/job.model.js');
const axios = require("axios");
const FormData = require("form-data");

const VALID_JOB_STAGES = ["resume", "profile", "coding", "evaluation", "interview"];
const VALID_APPLICATION_STAGES = ["resume", "coding", "interview", "final", "rejected"];

// AI resume-scoring service base URL. Prefers the env var (ML_API_URL), and
// in production defaults to the hosted AI service so screening works even if
// env injection is unavailable; local dev keeps the local FastAPI instance.
const AI_BASE_URL =
  process.env.ML_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talentforge-ai-nse9.onrender.com"
    : "http://127.0.0.1:8000");



//student apply for job
const applyToJob = async (req, res) => {
  const { jobId } = req.params;
  const { resumeLink } = req.body;
  // Identity comes from the authenticated user, never from client-supplied
  // body fields (prevents a student applying under a fake name/email).
  const { userId, name, email } = req.user;


  try {
    const jobData = await Job.findById(jobId);
    if (!jobData) return res.status(404).json({ message: "Job not found" });
    if (!resumeLink) return res.status(400).json({ message: "Resume link is required" });

    const existingProgress = await ApplicationProgress.findOne({ userId, jobId });
    if (existingProgress) return res.status(400).json({ message: "You have already applied for this job" });


    const progress = new ApplicationProgress({
      name,
      email,
      userId,
      jobId,
      resumeLink,
      currentStage: "resume"
    });

    await progress.save();
    res.status(201).json({ message: "Applied successfully!" });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
    res.status(500).json({ message: "Error applying for job" });
  }
};



//student get all applied job
const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.userId; 
   
    const applications = await ApplicationProgress.find({ userId })
      .populate("jobId", "title company location description");

    if (!applications || applications.length === 0) return res.status(404).json({ message: "No applied jobs found" });
    
    const formatted = applications.map(app => ({
      jobId: app.jobId._id,
      title: app.jobId.title,
      company: app.jobId.company,
      location: app.jobId.location,
      description: app.jobId.description,
      currentStage: app.currentStage,
      allStages: VALID_APPLICATION_STAGES,
    }));

    return res.status(200).json(formatted);

  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return res.status(500).json({ message: error.message });
  }
};


//calculate resume score basis of  job description
const calculateResumeScore = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // 2. Find applicants
    const applicants = await ApplicationProgress.find({ jobId });
    if (applicants.length === 0) return res.status(404).json({ message: "No applicants found" });
    

    // 3. Build job description text
    let jobDescriptionText = job.description || "";
    if (job.requirements?.length > 0) jobDescriptionText += "\nRequirements: " + job.requirements.join(", ");
    
    if (job.responsibilities?.length > 0) {
      jobDescriptionText +=
        "\nResponsibilities: " + job.responsibilities.join(", ");
    }

    const results = [];

    // 4. Iterate over applicants
    for (const applicant of applicants) {
      if (!applicant.resumeLink) {
        results.push({
          userId: applicant.userId,
          name: applicant.name,
          email: applicant.email,
          resumeLink: applicant.resumeLink,
          score: applicant.resumeScore ?? null,
          status: "skipped",
          error: "Resume link missing",
        });
        continue;
      }

      try {
        // Fetch the resume PDF from Cloudinary
        const resumePdf = await axios.get(applicant.resumeLink, {
          responseType: "arraybuffer",
        });

        // Create FormData (use Buffer, not Blob!)
        const formData = new FormData();
        formData.append("file", Buffer.from(resumePdf.data), {
          filename: "resume.pdf",
          contentType: "application/pdf",
        });
        formData.append("job_description", jobDescriptionText);

const response = await axios.post(
          `${AI_BASE_URL}/resume/score`,
          formData,
          { headers: formData.getHeaders() }
        );

        const scoreData = response.data;

        applicant.resumeScore = scoreData.final_score;
        await applicant.save();

        results.push({
          userId: applicant.userId,
          name: applicant.name,
          email: applicant.email,
          resumeLink: applicant.resumeLink,
          score: scoreData.final_score,
          status: "scored",
        });
      } catch (err) {
        console.error(
          "Error scoring resume:",
          applicant.resumeLink,
          err.message
        );
        results.push({
          userId: applicant.userId,
          name: applicant.name,
          email: applicant.email,
          resumeLink: applicant.resumeLink,
          score: applicant.resumeScore ?? null,
          status: "failed",
          error: err.message,
        });
      }
    }

    const scoredCount = results.filter((r) => r.status === "scored").length;

    await Job.findByIdAndUpdate(jobId, { stage: "profile" });

    // 5. Send response
    return res.json({
      message: "Resume scores calculated successfully",
      scoredCount,
      skippedOrFailedCount: results.length - scoredCount,
      results,
    });
  } catch (error) {
    console.error("Error in calculateResumeScore:", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


//state change in job after completed current state
const stageChange = async (req, res) => {
  try {
    const { jobId } = req.params;    
    const { stage } = req.body;       

    if (!stage) return res.status(400).json({ message: "Stage is required" });
    if (!VALID_JOB_STAGES.includes(stage)) {
      return res.status(400).json({ message: "Invalid job stage" });
    }
    

    // Find and update job
    const job = await Job.findByIdAndUpdate(
      jobId,
      { stage },
      { new: true }   
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    

    return res.json({ message: "Stage updated successfully",job,});
  } catch (error) {
    console.error("Error in stageChange:", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//state chnage in student dashboard
const stageChangeInStudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentIds, stage } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No student IDs provided" });
    }
    if (!stage) {
      return res.status(400).json({ message: "Stage is required" });
    }
    if (!VALID_APPLICATION_STAGES.includes(stage)) {
      return res.status(400).json({ message: "Invalid student stage" });
    }

    const ids = studentIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (ids.length === 0) {
      return res.status(400).json({ message: "No valid student IDs provided" });
    }

    const result = await ApplicationProgress.updateMany(
      {
        jobId: new mongoose.Types.ObjectId(jobId),
        $or: [{ _id: { $in: ids } }, { userId: { $in: ids } }],
      },
      { $set: { currentStage: stage } }
    );

    return res.json({
      message: "Student stages updated successfully",
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });

  } catch (error) {
    console.error("Error in stageChangeInStudent:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


//get all existing job of hr
const getJobsByHRId = async (req, res) => {
  try {
    const hrId = req.user.userId;
    const jobs = await Job.find({ postedBy: hrId }).sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get job by id
const getJobById = async (req, res) => {  
  const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
}


// fetch all jobs
const fetchAllJob = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};


//Get all job whose student applied
const getStudentsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applicants = await ApplicationProgress.find({ jobId })
      .populate("userId")
      .sort({ resumeScore: -1, testScore: -1, createdAt: 1 });

    res.json(applicants);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getCurrentStageofStudent = async(req,res) =>{
     try {
   const userId = req.user.userId;

    // 1️⃣ Find all applications for the user
    const applications = await ApplicationProgress.find({ userId }).sort({ createdAt: -1 });

    // 2️⃣ Fetch Job details for each application
    const result = await Promise.all(
      applications.map(async (app) => {
        const job = await Job.findById(app.jobId).select("title company location employmentType");

        return {
          applicationId: app._id,
          jobId: app.jobId,
          jobTitle: job?.title || "N/A",
          company: job?.company || "N/A",
          location: job?.location || "Remote",
          employmentType: job?.employmentType || "N/A",
          currentStage: app.currentStage
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

//Get top scores profile after calculate resume score
const shortlistTopByResume = async (req, res) => {
  const { jobId } = req.params;
  const { topN } = req.body;
  if (!topN || isNaN(topN) || topN <= 0) {
    return res.status(400).json({ message: "Invalid topN" });
  }

  try {
    const applications = await ApplicationProgress.find({
      jobId,
      currentStage: { $ne: "rejected" },
      resumeScore: { $type: "number" },
    })
      .populate("userId", "name email")
      .sort({ resumeScore: -1, createdAt: 1 });

    if (!applications.length) return res.status(404).json({ message: "No applications found" });

    const shortlisted = applications.slice(0, Number(topN));
    const rejected = applications.slice(Number(topN));

    for (const app of shortlisted) {
      app.isShortlisted = true;
      app.currentStage = "coding";
      await app.save();
    }
    for (const app of rejected) {
      app.isShortlisted = false;
      app.currentStage = "rejected";
      await app.save();
    }

    await Job.findByIdAndUpdate(jobId, { stage: "coding" });

    res.json({
      message: `Shortlisted top ${topN} candidates`,
      shortlisted: shortlisted.map(s => ({
        name: s.userId.name,
        email: s.userId.email,
        resumeScore: s.resumeScore,
      })),
      rejectedCount: rejected.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const shortlistTopByTest = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { topN } = req.body;

    if (!topN || isNaN(topN) || topN <= 0) {
      return res.status(400).json({ message: "Invalid topN" });
    }

    const completed = await ApplicationProgress.find({
      jobId,
      currentStage: "coding",
      testCompleted: true,
    })
      .populate("userId", "name email")
      .sort({ testScore: -1, score: -1, createdAt: 1 });

    if (!completed.length) {
      return res.status(404).json({ message: "No completed coding tests found" });
    }

    const shortlisted = completed.slice(0, Number(topN));
    const rejected = completed.slice(Number(topN));

    for (const app of shortlisted) {
      app.isShortlisted = true;
      app.currentStage = "interview";
      await app.save();
    }

    for (const app of rejected) {
      app.isShortlisted = false;
      app.currentStage = "rejected";
      await app.save();
    }

    await Job.findByIdAndUpdate(jobId, { stage: "interview" });

    res.json({
      message: `Selected top ${shortlisted.length} candidates for interview`,
      shortlisted: shortlisted.map((s) => ({
        applicationId: s._id,
        name: s.userId?.name || s.name,
        email: s.userId?.email || s.email,
        testScore: s.testScore ?? s.score ?? 0,
      })),
      rejectedCount: rejected.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getJobStudents = async (req, res) => {
try {
    const { jobId } = req.params;

    const students = await ApplicationProgress.find({
      jobId,
      testCompleted: true,
      currentStage: "coding"
    })
      .populate("userId", "name email")
      .sort({ testScore: -1, score: -1 });

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

const markApplicantContacted = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { jobId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: "Invalid applicant id" });
    }

    const query = { _id: applicationId };
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      query.jobId = jobId;
    }

    const applicant = await ApplicationProgress.findOneAndUpdate(
      query,
      { contacted: true },
      { new: true }
    ).populate("userId", "name email");

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({ message: "Applicant marked as contacted", applicant });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = {
  applyToJob,
  getJobsByHRId,
  fetchAllJob,
  getAppliedJobs,
  getStudentsByJobId,
  calculateResumeScore,
  stageChange,
  stageChangeInStudent,
  getJobById,
  shortlistTopByResume,
  shortlistTopByTest,
  getJobStudents,
  markApplicantContacted,
  getCurrentStageofStudent
}
