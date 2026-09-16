// models/job.model.js
const mongoose = require('mongoose');

const VALID_STAGES = ["resume", "profile", "coding", "evaluation", "interview"];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    company: {
      type: String,
    },
    location: {
      type: String,
      default: "Remote",
    },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid-Level", "Senior", "Lead"],
      default: "Fresher",
    },
    description: {
      type: String,
    },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    skills: [{ type: String }],
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    testSection: { type: Boolean, default: false },
    currentStep: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: VALID_STAGES,
      default: "resume",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
