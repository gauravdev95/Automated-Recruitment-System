const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const HrProfile = require("../models/hrProfile.model");
const StudentProfile = require("../models/studentProfile.model");

const {
  HrSignupSchema,
  studentRegisterSchema,
  loginSchema,
} = require("../config/schema.config");

const { JWT_EXPIRES_IN } = require("../config/env.config");

/**
 * SINGLE SIGNUP API (HR + STUDENT)
 */
exports.signup = async (req, res, next) => {
  try {
    const { role } = req.body;
    console.log(role)

    // Validate based on role
    let validation;
    if (role === "hr") {
      validation = HrSignupSchema.validate(req.body);
    } else if (role === "student") {
      validation = studentRegisterSchema.validate(req.body);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (validation.error) {
      return res
        .status(400)
        .json({ message: validation.error.details[0].message });
    }

    const { name, email, password } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create USER
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Create ROLE PROFILE
    if (role === "hr") {
      const { companyName, position, contact } = req.body;

      await HrProfile.create({
        userId: user._id,
        companyName,
        position,
        contact,
      });
    }

    if (role === "student") {
      const {
        college,
        degree,
        branch,
        graduationYear,
        skills,
        projects,
        experience,
        certifications,
        socialLinks,
        resume,
        location,
      } = req.body;

      await StudentProfile.create({
        userId: user._id,
        college,
        degree,
        branch,
        graduationYear,
        skills,
        projects,
        experience,
        certifications,
        socialLinks,
        resume,
        location,
      });
    }

    res.status(201).json({
      message: `${role.toUpperCase()} registered successfully`,
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};




// Login for both Student and HR
exports.login = async (req, res) => {
  // Validate request body
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Authenticate user
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};