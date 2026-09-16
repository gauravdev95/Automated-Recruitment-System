const Joi = require("joi");

/* ===========================
   STUDENT REGISTER VALIDATION
   =========================== */
const studentRegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  role: Joi.string()
    .valid("student")
    .required(), // ✅ ADDED

  // profilePhoto / resume may be empty at signup — students upload them from
  // their profile afterwards, so allow "" (blank) instead of rejecting it.
  profilePhoto: Joi.string().allow("").optional(),
  phone: Joi.string()
    .pattern(/^\+?[0-9][0-9\s-]{7,16}$/)
    .allow("")
    .optional(),

  // education
  college: Joi.string().allow("").optional(),
  degree: Joi.string().allow("").optional(),
  branch: Joi.string().allow("").optional(),
  graduationYear: Joi.alternatives()
    .try(Joi.number().integer().min(1900).max(2100), Joi.allow(""))
    .optional(),
  skills: Joi.array().items(Joi.string()).optional(),

  // projects
  projects: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      githubLink: Joi.string().uri().optional(),
    })
  ).optional(),

  // experience
  experience: Joi.array().items(
    Joi.object({
      company: Joi.string().required(),
      role: Joi.string().required(),
      duration: Joi.string().required(),
    })
  ).optional(),

  // certifications
  certifications: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      issuer: Joi.string().optional(),
      year: Joi.string().optional(),
    })
  ).optional(),

  about: Joi.string().allow("").optional(),

  // social links
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().allow("").optional(),
    github: Joi.string().uri().allow("").optional(),
    portfolio: Joi.string().uri().allow("").optional(),
  }).optional(),

  resume: Joi.string().uri().allow("").optional(),
  location: Joi.string().allow("").optional(),
  appliedJobs: Joi.array().items(Joi.string().hex().length(24)).optional(),
  savedJobs: Joi.array().items(Joi.string().hex().length(24)).optional(),
});


/* ===========================
   HR SIGNUP VALIDATION
   =========================== */
const HrSignupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  contact: Joi.string().required(),
  companyName: Joi.string().required(),
  position: Joi.string().required(),

  role: Joi.string()
    .valid("hr")
    .required(), // ✅ ADDED
});


/* ===========================
   LOGIN VALIDATION
   =========================== */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  studentRegisterSchema,
  HrSignupSchema,
  loginSchema,
};
