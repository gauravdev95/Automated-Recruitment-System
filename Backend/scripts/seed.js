/**
 * seed.js — wipes and reseeds the talentforge database with realistic demo data.
 *
 *   node scripts/seed.js
 *
 * Creates:
 *   5 HR accounts  (one per company) + HR profiles
 *   10 student accounts + student profiles
 *   15 job postings across 5 companies
 *   15 applications at various pipeline stages
 *
 * Password for every account:  TalentForge@123
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── models ──────────────────────────────────────────────────────────
const User = require("../src/models/user.model");
const HrProfile = require("../src/models/hrProfile.model");
const StudentProfile = require("../src/models/studentProfile.model");
const Job = require("../src/models/job.model");
const ApplicationProgress = require("../src/models/applicationProgress.model");
const Question = require("../src/models/question.model");
const TestCaseResult = require("../src/models/TestCase.model");

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

// ── constants ───────────────────────────────────────────────────────
const PASSWORD_HASH = bcrypt.hashSync("TalentForge@123", 10);
const TODAY = new Date();
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt; };

// ── HR data ─────────────────────────────────────────────────────────
const hrAccounts = [
  {
    name: "Neha Kapoor",
    email: "tcs@talentforge.com",
    companyName: "Tata Consultancy Services",
    position: "Technical Lead – Talent Acquisition",
    contact: "9876543201",
  },
  {
    name: "Vikram Desai",
    email: "freshworks@talentforge.com",
    companyName: "Freshworks Inc.",
    position: "Senior Engineering Manager",
    contact: "9876543202",
  },
  {
    name: "Ritu Malhotra",
    email: "razorpay@talentforge.com",
    companyName: "Razorpay",
    position: "Head of People Operations",
    contact: "9876543203",
  },
  {
    name: "Aditya Rao",
    email: "phonepe@talentforge.com",
    companyName: "PhonePe",
    position: "Engineering Director",
    contact: "9876543204",
  },
  {
    name: "Meera Iyer",
    email: "zerodha@talentforge.com",
    companyName: "Zerodha",
    position: "CTO Office – Hiring",
    contact: "9876543205",
  },
];

// ── student data ────────────────────────────────────────────────────
const studentAccounts = [
  {
    name: "Aarav Mehta",
    email: "aarav@talentforge.com",
    college: "IIT Bombay",
    degree: "B.Tech",
    branch: "Computer Science",
    graduationYear: 2025,
    skills: ["Python", "TensorFlow", "SQL", "Pandas", "NLP"],
    projects: [
      { title: "Movie Recommender System", description: "Collaborative filtering using cosine similarity on 100k MovieLens ratings", githubLink: "https://github.com/aaravm/movie-recommender" },
      { title: "Sentiment Analyzer", description: "LSTM model trained on Twitter data for real-time sentiment classification", githubLink: "https://github.com/aaravm/sentiment-analyzer" },
    ],
    experience: [{ company: "Sprinklr", role: "ML Intern", duration: "3 months" }],
    certifications: [{ title: "AWS Machine Learning Specialty", issuer: "AWS", year: "2024" }],
    socialLinks: { linkedin: "https://linkedin.com/in/aaravmehta", github: "https://github.com/aaravm", portfolio: "https://aaravmehta.dev" },
    resume: "https://example.com/aarav-resume.pdf",
    location: "Mumbai",
  },
  {
    name: "Priya Sharma",
    email: "priya@talentforge.com",
    college: "NIT Trichy",
    degree: "B.Tech",
    branch: "Information Technology",
    graduationYear: 2024,
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "Tailwind"],
    projects: [
      { title: "QuickMart E-commerce", description: "Full-stack MERN app with Stripe integration and real-time inventory", githubLink: "https://github.com/priyash/quickmart" },
      { title: "LiveChat App", description: "WebSocket-based chat with rooms, typing indicators and read receipts", githubLink: "https://github.com/priyash/livechat" },
    ],
    experience: [{ company: "Freshworks", role: "Frontend Intern", duration: "6 months" }],
    certifications: [{ title: "Meta Frontend Developer", issuer: "Meta / Coursera", year: "2023" }],
    socialLinks: { linkedin: "https://linkedin.com/in/priyasharma", github: "https://github.com/priyash" },
    resume: "https://example.com/priya-resume.pdf",
    location: "Trichy",
  },
  {
    name: "Rohan Gupta",
    email: "rohan@talentforge.com",
    college: "VIT Vellore",
    degree: "B.Tech",
    branch: "Computer Science",
    graduationYear: 2025,
    skills: ["Java", "Spring Boot", "AWS", "MySQL", "Docker"],
    projects: [
      { title: "Inventory Management System", description: "Spring Boot REST API with role-based access and JUnit testing", githubLink: "https://github.com/rohang/inventory" },
      { title: "URL Shortener", description: "Distributed URL shortener with Redis caching and analytics dashboard", githubLink: "https://github.com/rohang/url-shortener" },
    ],
    experience: [{ company: "Infosys", role: "Java Intern", duration: "2 months" }],
    certifications: [{ title: "Oracle Java SE 17", issuer: "Oracle", year: "2024" }],
    socialLinks: { linkedin: "https://linkedin.com/in/rohangupta", github: "https://github.com/rohang" },
    resume: "https://example.com/rohan-resume.pdf",
    location: "Vellore",
  },
  {
    name: "Ananya Patel",
    email: "ananya@talentforge.com",
    college: "DTU – Delhi Technological University",
    degree: "B.Tech",
    branch: "Electronics & Communication",
    graduationYear: 2024,
    skills: ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
    projects: [
      { title: "DevBlog Platform", description: "Markdown-based blog with comments, tags and SEO metadata", githubLink: "https://github.com/ananyap/devblog" },
      { title: "TaskFlow Manager", description: "Kanban-style task manager with drag-and-drop and team workspaces", githubLink: "https://github.com/ananyap/taskflow" },
    ],
    experience: [{ company: "Publicis Sapient", role: "Backend Intern", duration: "4 months" }],
    certifications: [{ title: "Docker Essentials", issuer: "Udemy", year: "2024" }],
    socialLinks: { linkedin: "https://linkedin.com/in/ananyapatel", github: "https://github.com/ananyap", portfolio: "https://ananyapatel.dev" },
    resume: "https://example.com/ananya-resume.pdf",
    location: "New Delhi",
  },
  {
    name: "Kavya Singh",
    email: "kavya@talentforge.com",
    college: "IIIT Hyderabad",
    degree: "B.Tech",
    branch: "Computer Science",
    graduationYear: 2025,
    skills: ["Go", "React", "Redis", "Kafka", "gRPC"],
    projects: [
      { title: "Real-time Chat Engine", description: "Go microservices with Kafka pub/sub, WebSocket gateway, Redis sessions", githubLink: "https://github.com/kavyasingh/chat-engine" },
      { title: "URL Shortener", description: "High-performance shortener using Go + BoltDB with rate limiting", githubLink: "https://github.com/kavyasingh/gourl" },
    ],
    experience: [{ company: "Paytm", role: "Backend Intern", duration: "3 months" }],
    certifications: [{ title: "Go: The Complete Developer's Guide", issuer: "Udemy", year: "2024" }],
    socialLinks: { linkedin: "https://linkedin.com/in/kavyasingh", github: "https://github.com/kavyasingh" },
    resume: "https://example.com/kavya-resume.pdf",
    location: "Hyderabad",
  },
  {
    name: "Arjun Nair",
    email: "arjun@talentforge.com",
    college: "BITS Pilani",
    degree: "B.E.",
    branch: "Computer Science",
    graduationYear: 2024,
    skills: ["C++", "Data Structures", "Algorithms", "Operating Systems", "Linux"],
    projects: [
      { title: "Cache Simulator", description: "L1/L2 cache simulator with LRU and LFU eviction policies, traces from SPEC benchmarks", githubLink: "https://github.com/arjunair/cache-sim" },
      { title: "In-memory File System", description: "FUSE-based in-memory FS with mkdir, cp, ls, chmod and permission checking", githubLink: "https://github.com/arjunair/inmem-fs" },
    ],
    experience: [],
    certifications: [{ title: "CS50", issuer: "Harvard / edX", year: "2022" }],
    socialLinks: { linkedin: "https://linkedin.com/in/arjunnair", github: "https://github.com/arjunair" },
    resume: "https://example.com/arjun-resume.pdf",
    location: "Pilani",
  },
  {
    name: "Sneha Reddy",
    email: "sneha@talentforge.com",
    college: "SRM University",
    degree: "B.Tech",
    branch: "Computer Science",
    graduationYear: 2025,
    skills: ["Flutter", "Firebase", "Dart", "Figma", "REST APIs"],
    projects: [
      { title: "ExpenseWise", description: "Cross-platform expense tracker with charts, budgets and CSV export", githubLink: "https://github.com/snehareddy/expensewise" },
      { title: "FoodBox Delivery", description: "Food delivery app clone with real-time order tracking and payment", githubLink: "https://github.com/snehareddy/foodbox" },
    ],
    experience: [{ company: "Zoho", role: "UI/UX Intern", duration: "2 months" }],
    certifications: [{ title: "Google UX Design", issuer: "Google / Coursera", year: "2024" }],
    socialLinks: { linkedin: "https://linkedin.com/in/snehareddy", github: "https://github.com/snehareddy" },
    resume: "https://example.com/sneha-resume.pdf",
    location: "Chennai",
  },
  {
    name: "Manish Kumar",
    email: "manish@talentforge.com",
    college: "NIT Warangal",
    degree: "B.Tech",
    branch: "Computer Science",
    graduationYear: 2025,
    skills: ["React", "Python", "FastAPI", "PostgreSQL", "Docker"],
    projects: [
      { title: "QuizMaster Live", description: "Real-time quiz platform with leaderboards, timed rounds and WebSockets", githubLink: "https://github.com/manishk/quizmaster" },
      { title: "JobBoard Lite", description: "Job board with AI resume scoring, email notifications and admin dashboard", githubLink: "https://github.com/manishk/jobboard" },
    ],
    experience: [],
    certifications: [{ title: "AWS Cloud Practitioner", issuer: "AWS", year: "2024" }],
    socialLinks: { linkedin: "https://linkedin.com/in/manishkumar", github: "https://github.com/manishk" },
    resume: "https://example.com/manish-resume.pdf",
    location: "Warangal",
  },
  {
    name: "Tanvi Joshi",
    email: "tanvi@talentforge.com",
    college: "Savitribai Phule Pune University",
    degree: "BCS",
    branch: "Computer Science",
    graduationYear: 2024,
    skills: ["PHP", "Laravel", "MySQL", "JavaScript", "Bootstrap"],
    projects: [
      { title: "Campus CMS", description: "College content management system with role-based pages and media library", githubLink: "https://github.com/tanvij/campus-cms" },
      { title: "QuickPoll", description: "Real-time polling app with chart results and QR code sharing", githubLink: "https://github.com/tanvij/quickpoll" },
    ],
    experience: [{ company: "TCS", role: "Web Dev Intern", duration: "3 months" }],
    certifications: [{ title: "Laravel from Scratch", issuer: "Udemy", year: "2023" }],
    socialLinks: { linkedin: "https://linkedin.com/in/tanvijoshi", github: "https://github.com/tanvij" },
    resume: "https://example.com/tanvi-resume.pdf",
    location: "Pune",
  },
  {
    name: "Deepak Verma",
    email: "deepak@talentforge.com",
    college: "JIIT Noida",
    degree: "B.Tech",
    branch: "Information Technology",
    graduationYear: 2025,
    skills: ["Java", "Kotlin", "Android", "Firebase", "Jetpack Compose"],
    projects: [
      { title: "FitTrack", description: "Fitness tracking Android app with step counter, calorie log and workout plans", githubLink: "https://github.com/deepakv/fittrack" },
      { title: "NoteVault", description: "Offline-first notes app with Markdown, labels and cloud sync via Firestore", githubLink: "https://github.com/deepakv/notevault" },
    ],
    experience: [{ company: "Paytm", role: "Android Intern", duration: "2 months" }],
    certifications: [{ title: "Android Developer nanodegree", issuer: "Udacity", year: "2024" }],
    socialLinks: { linkedin: "https://linkedin.com/in/deepakverma", github: "https://github.com/deepakv" },
    resume: "https://example.com/deepak-resume.pdf",
    location: "Noida",
  },
];

// ── jobs data ───────────────────────────────────────────────────────
// Each job has: title, company, location, type, level, description,
// responsibilities, requirements, skills, salary (LPA), deadlineDays, stage

const jobsData = [
  // ── TCS ──────────────────────────────────────
  {
    title: "Full Stack Developer",
    company: "Tata Consultancy Services",
    location: "Pune",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    description: "Build and maintain client-facing web applications across the banking and retail vertical. Work closely with product teams to deliver high-impact features on tight timelines.",
    responsibilities: [
      "Design and implement REST APIs for core business workflows",
      "Build responsive React frontends and integrate with backend services",
      "Write unit and integration tests, participate in code reviews",
      "Troubleshoot production issues and contribute to on-call rotations",
    ],
    requirements: ["3+ years web development experience", "Strong fundamentals in JavaScript, React, and Node.js", "Familiarity with MongoDB or PostgreSQL", "Good written and verbal communication"],
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "Git"],
    salary: { min: 12, max: 22, currency: "INR" },
    deadlineDays: 30,
    stage: "resume",
    testSection: false,
  },
  {
    title: "Data Analyst",
    company: "Tata Consultancy Services",
    location: "Bangalore",
    employmentType: "Full-Time",
    experienceLevel: "Junior",
    description: "Analyze large datasets to uncover trends that drive business decisions. Partner with product and marketing teams to build dashboards and automated reporting pipelines.",
    responsibilities: [
      "Clean, transform and validate large datasets using SQL and Python",
      "Build interactive dashboards in Power BI or Tableau",
      "Run ad-hoc analyses and present findings to stakeholders",
      "Document data definitions and maintain data quality checks",
    ],
    requirements: ["1–2 years in analytics or BI roles", "Proficiency in SQL and at least one language (Python/R)", "Experience with BI tools (Power BI, Tableau)", "Strong analytical thinking and attention to detail"],
    skills: ["SQL", "Python", "Power BI", "Excel", "Statistics"],
    salary: { min: 6, max: 11, currency: "INR" },
    deadlineDays: 21,
    stage: "resume",
    testSection: false,
  },
  {
    title: "Cloud Engineer",
    company: "Tata Consultancy Services",
    location: "Hyderabad",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    description: "Design and manage cloud infrastructure on AWS for enterprise clients. Automate deployments, monitor systems and enforce security best practices across environments.",
    responsibilities: [
      "Provision and maintain AWS infrastructure using Terraform and CloudFormation",
      "Set up CI/CD pipelines and container orchestration (ECS / EKS)",
      "Monitor system health with CloudWatch and Datadog",
      "Implement IAM policies and conduct security audits",
    ],
    requirements: ["3+ years working with AWS or Azure", "Strong Linux and networking knowledge", "Experience with IaC tools (Terraform, Ansible)", "AWS certification preferred"],
    skills: ["AWS", "Terraform", "Docker", "Linux", "CI/CD"],
    salary: { min: 14, max: 26, currency: "INR" },
    deadlineDays: 25,
    stage: "coding",
    testSection: true,
  },

  // ── Freshworks ───────────────────────────────
  {
    title: "Frontend Engineer (React)",
    company: "Freshworks Inc.",
    location: "Chennai",
    employmentType: "Full-Time",
    experienceLevel: "Junior",
    description: "Own the frontend of Freshdesk's ticketing experience. Ship pixel-perfect UI that loads fast and is accessible to all users.",
    responsibilities: [
      "Build reusable React components and maintain the design system",
      "Write unit and snapshot tests to prevent regressions",
      "Optimise Core Web Vitals (LCP, CLS, TTI) across pages",
      "Collaborate with designers and backend engineers on feature specs",
    ],
    requirements: ["1–3 years of frontend development", "Hands-on with React, Redux or Zustand", "Comfortable with CSS-in-JS or Tailwind CSS", "Basic understanding of REST APIs and GraphQL"],
    skills: ["React", "Redux", "JavaScript", "CSS", "Jest"],
    salary: { min: 8, max: 16, currency: "INR" },
    deadlineDays: 18,
    stage: "resume",
    testSection: false,
  },
  {
    title: "DevOps Engineer",
    company: "Freshworks Inc.",
    location: "Remote",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    description: "Build and maintain the deployment pipeline for Freshworks' SaaS products serving millions of users. Automate everything from provisioning to release.",
    responsibilities: [
      "Design Kubernetes-based deployment architectures",
      "Maintain CI/CD pipelines (GitHub Actions, Jenkins)",
      "Manage PostgreSQL and Redis infrastructure on AWS",
      "Implement monitoring, alerting and incident-response tooling",
    ],
    requirements: ["3–5 years in DevOps or SRE roles", "Strong Kubernetes and Docker experience", "Proficiency with AWS services (EC2, RDS, S3, ECS)", "Experience writing Terraform or CloudFormation"],
    skills: ["Kubernetes", "AWS", "Terraform", "GitHub Actions", "PostgreSQL"],
    salary: { min: 16, max: 30, currency: "INR" },
    deadlineDays: 22,
    stage: "resume",
    testSection: false,
  },
  {
    title: "Technical Writer",
    company: "Freshworks Inc.",
    location: "Remote",
    employmentType: "Part-Time",
    experienceLevel: "Fresher",
    description: "Write clear, developer-friendly documentation for Freshworks' public APIs and SDKs. Turn rough product specs into guides that engineers love.",
    responsibilities: [
      "Write and maintain API reference docs and getting-started guides",
      "Work with engineers to understand new features and document them",
      "Create code samples in multiple languages (Python, JS, Ruby)",
      "Review community-submitted docs and keep the knowledge base current",
    ],
    requirements: ["Excellent written English", "Basic understanding of REST APIs and HTTP", "Ability to read and understand code in at least one language", "Portfolio of technical writing samples"],
    skills: ["Markdown", "API Documentation", "REST", "Git", "Technical Writing"],
    salary: { min: 3, max: 6, currency: "INR" },
    deadlineDays: 14,
    stage: "resume",
    testSection: false,
  },

  // ── Razorpay ─────────────────────────────────
  {
    title: "Backend Engineer (Node.js)",
    company: "Razorpay",
    location: "Bangalore",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    description: "Build high-throughput payment APIs that handle millions of transactions daily. Work on the core settlement engine that processes bank transfers in real time.",
    responsibilities: [
      "Design and implement Node.js microservices handling payment flows",
      "Write idempotent, fault-tolerant APIs with proper error handling",
      "Collaborate with banking partners on integration and reconciliation",
      "Participate in on-call rotations and incident triage",
    ],
    requirements: ["3+ years backend experience with Node.js", "Strong understanding of database transactions and ACID", "Experience with message queues (Kafka / RabbitMQ)", "Familiarity with payment systems or fintech a plus"],
    skills: ["Node.js", "PostgreSQL", "Kafka", "Redis", "Microservices"],
    salary: { min: 18, max: 32, currency: "INR" },
    deadlineDays: 20,
    stage: "resume",
    testSection: false,
  },
  {
    title: "Product Designer",
    company: "Razorpay",
    location: "Bangalore",
    employmentType: "Full-Time",
    experienceLevel: "Senior",
    description: "Lead design for Razorpay's merchant dashboard — a product used by millions of businesses. Define UX strategy and ensure visual consistency across the platform.",
    responsibilities: [
      "Conduct user research, interviews and usability testing",
      "Create wireframes, high-fidelity prototypes and design specs in Figma",
      "Work closely with engineering on feasibility and implementation fidelity",
      "Maintain and evolve the Razorpay design system",
    ],
    requirements: ["5+ years of product design experience", "Strong portfolio demonstrating end-to-end design process", "Expert-level Figma and prototyping skills", "Experience designing B2B or dashboard interfaces"],
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
    salary: { min: 22, max: 40, currency: "INR" },
    deadlineDays: 28,
    stage: "resume",
    testSection: false,
  },
  {
    title: "QA Engineer",
    company: "Razorpay",
    location: "Remote",
    employmentType: "Full-Time",
    experienceLevel: "Junior",
    description: "Ensure every Razorpay release meets quality standards before hitting production. Build automated test suites and find edge cases before users do.",
    responsibilities: [
      "Write and maintain automated test suites (API + UI)",
      "Perform exploratory testing on new features",
      "Report and track bugs through Jira with clear reproduction steps",
      "Collaborate with developers on testability and regression prevention",
    ],
    requirements: ["1–2 years QA experience", "Hands-on with Selenium, Cypress or Playwright", "Basic knowledge of REST API testing (Postman)", "Familiarity with Git and CI pipelines"],
    skills: ["Cypress", "Selenium", "Postman", "Git", "Jira"],
    salary: { min: 7, max: 13, currency: "INR" },
    deadlineDays: 16,
    stage: "resume",
    testSection: false,
  },

  // ── PhonePe ──────────────────────────────────
  {
    title: "Android Developer",
    company: "PhonePe",
    location: "Bangalore",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    description: "Build features for one of India's most-used fintech apps. Work on the payments flow that processes billions of UPI transactions.",
    responsibilities: [
      "Develop and maintain Android features using Kotlin and Jetpack Compose",
      "Integrate UPI SDKs and third-party payment libraries",
      "Optimise app performance (cold start, ANR rate, crash rate)",
      "Write unit and integration tests for critical payment flows",
    ],
    requirements: ["3+ years Android development", "Strong Kotlin and Jetpack Compose skills", "Experience with MVVM or MVI architecture", "Understanding of Android internals and performance profiling"],
    skills: ["Kotlin", "Jetpack Compose", "Android SDK", "Retrofit", "Coroutines"],
    salary: { min: 16, max: 30, currency: "INR" },
    deadlineDays: 24,
    stage: "coding",
    testSection: true,
  },
  {
    title: "Site Reliability Engineer",
    company: "PhonePe",
    location: "Hyderabad",
    employmentType: "Full-Time",
    experienceLevel: "Senior",
    description: "Keep PhonePe's critical payment infrastructure running at 99.99% uptime. Design resilient systems that handle festival-scale traffic spikes.",
    responsibilities: [
      "Define SLOs, SLIs and error budgets for core payment services",
      "Build and maintain Kubernetes clusters and service meshes",
      "Automate incident response with runbooks and chat-ops",
      "Lead post-mortems and drive reliability improvements",
    ],
    requirements: ["5+ years in SRE or infrastructure roles", "Deep expertise with Kubernetes and Linux internals", "Proficiency in at least one scripting language (Python/Go)", "Experience managing high-availability production systems"],
    skills: ["Kubernetes", "Go", "Prometheus", "Terraform", "Linux"],
    salary: { min: 25, max: 45, currency: "INR" },
    deadlineDays: 30,
    stage: "resume",
    testSection: false,
  },
  {
    title: "Data Engineer",
    company: "PhonePe",
    location: "Bangalore",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    description: "Build and operate the data pipelines that power PhonePe's analytics and reporting platform. Process billions of events daily with reliability.",
    responsibilities: [
      "Design and build Spark/Airflow pipelines for batch and streaming data",
      "Model data in Hive and Presto for downstream analytics teams",
      "Optimise query performance on petabyte-scale datasets",
      "Ensure data quality through validation frameworks and monitoring",
    ],
    requirements: ["3+ years in data engineering", "Strong SQL and PySpark skills", "Experience with Airflow or similar orchestration tools", "Familiarity with data warehouse concepts"],
    skills: ["PySpark", "Airflow", "SQL", "Hive", "AWS EMR"],
    salary: { min: 14, max: 28, currency: "INR" },
    deadlineDays: 20,
    stage: "resume",
    testSection: false,
  },

  // ── Zerodha ──────────────────────────────────
  {
    title: "Trading Systems Developer",
    company: "Zerodha",
    location: "Bangalore",
    employmentType: "Full-Time",
    experienceLevel: "Senior",
    description: "Build low-latency trading infrastructure that executes orders in microseconds. Work on the systems that power India's largest retail brokerage.",
    responsibilities: [
      "Design and implement order routing and matching engine components",
      "Profile and optimise critical-path code for sub-millisecond latency",
      "Build market data ingestion pipelines handling millions of ticks per second",
      "Collaborate with quants on execution strategies and risk controls",
    ],
    requirements: ["5+ years systems programming (C++ or Python/C)", "Deep knowledge of OS internals, memory management and networking", "Experience with low-latency or high-frequency systems", "Strong grasp of data structures and algorithms"],
    skills: ["C++", "Python", "Linux", "Redis", "Systems Programming"],
    salary: { min: 30, max: 55, currency: "INR" },
    deadlineDays: 35,
    stage: "resume",
    testSection: false,
  },
  {
    title: "Quantitative Analyst",
    company: "Zerodha",
    location: "Bangalore",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    description: "Develop statistical models and trading strategies for Zerodha's proprietary trading desk. Turn market data into alpha.",
    responsibilities: [
      "Build and backtest quantitative strategies using historical market data",
      "Analyse order-book dynamics and microstructure patterns",
      "Implement risk models and portfolio optimisation algorithms",
      "Present research findings to the trading team weekly",
    ],
    requirements: ["2–5 years in quant research or trading", "Strong Python and statistics background", "Experience with time-series analysis and modelling", "Masters or PhD in Maths, Physics, CS or related field preferred"],
    skills: ["Python", "Pandas", "NumPy", "Statistics", "Time-Series"],
    salary: { min: 18, max: 38, currency: "INR" },
    deadlineDays: 28,
    stage: "resume",
    testSection: false,
  },
  {
    title: "iOS Developer",
    company: "Zerodha",
    location: "Remote",
    employmentType: "Full-Time",
    experienceLevel: "Junior",
    description: "Build Kite iOS — the trading app used by millions of Indian investors. Ship fast, beautiful and reliable features that users trust with their money.",
    responsibilities: [
      "Develop features using SwiftUI and UIKit",
      "Write unit and UI tests for critical trading flows",
      "Optimise memory usage and frame rates for smooth scrolling",
      "Collaborate with the design team on pixel-perfect implementation",
    ],
    requirements: ["1–3 years iOS development", "Strong Swift and SwiftUI skills", "Experience with REST API integration and CoreData", "Published apps on the App Store"],
    skills: ["Swift", "SwiftUI", "UIKit", "CoreData", "REST"],
    salary: { min: 8, max: 18, currency: "INR" },
    deadlineDays: 18,
    stage: "resume",
    testSection: false,
  },
];

// ── application plan ────────────────────────────────────────────────
// Maps student index → array of { jobIndex, currentStage }
const applicationPlan = [
  /* 0 Aarav  */ { jobs: [{ jobIndex: 0, stage: "coding" }, { jobIndex: 13, stage: "final" }] },
  /* 1 Priya  */ { jobs: [{ jobIndex: 3, stage: "resume" }, { jobIndex: 6, stage: "interview" }] },
  /* 2 Rohan  */ { jobs: [{ jobIndex: 0, stage: "interview" }, { jobIndex: 2, stage: "coding" }] },
  /* 3 Ananya */ { jobs: [{ jobIndex: 6, stage: "resume" }, { jobIndex: 9, stage: "coding" }] },
  /* 4 Kavya  */ { jobs: [{ jobIndex: 3, stage: "final" }, { jobIndex: 12, stage: "resume" }] },
  /* 5 Arjun  */ { jobs: [{ jobIndex: 0, stage: "resume" }, { jobIndex: 13, stage: "resume" }] },
  /* 6 Sneha  */ { jobs: [{ jobIndex: 1, stage: "resume" }, { jobIndex: 4, stage: "rejected" }] },
  /* 7 Manish */ { jobs: [{ jobIndex: 1, stage: "coding" }, { jobIndex: 8, stage: "rejected" }] },
  /* 8 Tanvi  */ { jobs: [{ jobIndex: 8, stage: "resume" }, { jobIndex: 9, stage: "resume" }] },
  /* 9 Deepak */ { jobs: [{ jobIndex: 2, stage: "resume" }, { jobIndex: 4, stage: "resume" }] },
];

// helper: random int in [min, max]
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── main ────────────────────────────────────────────────────────────
const main = async () => {
  console.log("Connecting to MongoDB...");
  const uri = process.env.MONGO_URL || process.env.MONGO_URI || "mongodb://localhost:27017/talentforge";
  await mongoose.connect(uri);
  console.log("Connected.\n");

  // 1. drop all collections
  console.log("Dropping all collections...");
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }
  console.log("All collections dropped.\n");

  // 2. create HR users + profiles
  console.log("Creating HR accounts...");
  const hrUsers = [];
  for (const hr of hrAccounts) {
    const user = await User.create({ name: hr.name, email: hr.email, password: PASSWORD_HASH, role: "hr" });
    await HrProfile.create({ userId: user._id, companyName: hr.companyName, position: hr.position, contact: hr.contact });
    hrUsers.push(user);
    console.log("  ✓ " + hr.email + "  (" + hr.companyName + ")");
  }
  console.log("");

  // 3. create student users + profiles
  console.log("Creating student accounts...");
  const stUsers = [];
  for (const st of studentAccounts) {
    const user = await User.create({ name: st.name, email: st.email, password: PASSWORD_HASH, role: "student" });
    await StudentProfile.create({
      userId: user._id, college: st.college, degree: st.degree, branch: st.branch,
      graduationYear: st.graduationYear, skills: st.skills, projects: st.projects,
      experience: st.experience, certifications: st.certifications,
      socialLinks: st.socialLinks, resume: st.resume, location: st.location,
    });
    stUsers.push(user);
    console.log("  ✓ " + st.email + "  (" + st.college + ")");
  }
  console.log("");

  // 4. create jobs — rotate companies: each HR posts 3 jobs
  console.log("Creating job postings...");
  const createdJobs = [];
  for (let i = 0; i < jobsData.length; i++) {
    const jd = jobsData[i];
    const hrUser = hrUsers[Math.floor(i / 3)]; // first 3 → HR[0], next 3 → HR[1], etc.
    const job = await Job.create({
      title: jd.title,
      company: jd.company,
      location: jd.location,
      employmentType: jd.employmentType,
      experienceLevel: jd.experienceLevel,
      description: jd.description,
      responsibilities: jd.responsibilities,
      requirements: jd.requirements,
      skills: jd.skills,
      salaryRange: jd.salary,
      postedBy: hrUser._id,
      deadline: addDays(TODAY, jd.deadlineDays),
      isActive: true,
      testSection: jd.testSection,
      stage: jd.stage,
      CurrentStep: 0,
    });
    createdJobs.push(job);
    console.log("  ✓ #" + (i + 1) + " " + jd.title.padEnd(34) + " | " + jd.company);
  }
  console.log("");

  // 5. create applications
  console.log("Creating applications...");
  let appCount = 0;
  for (let si = 0; si < applicationPlan.length; si++) {
    const stUser = stUsers[si];
    const stInfo = studentAccounts[si];
    for (const ap of applicationPlan[si].jobs) {
      const job = createdJobs[ap.jobIndex];
      const stageMap = { resume: 0, coding: 1, interview: 2, final: 3, rejected: 2 };
      const score = stageMap[ap.stage] >= 1 ? rand(45, 92) : 0;
      await ApplicationProgress.create({
        jobId: job._id,
        userId: stUser._id,
        name: stInfo.name,
        email: stInfo.email,
        resumeLink: stInfo.resume,
        resumeScore: score || undefined,
        testCompleted: ap.stage !== "resume",
        score: ap.stage !== "resume" ? rand(60, 95) : 0,
        correct: ap.stage !== "resume" ? rand(2, 5) : 0,
        total: 5,
        currentStage: ap.stage,
        isShortlisted: ap.stage === "final",
      });
      appCount++;
      console.log("  ✓ " + stInfo.name.padEnd(16) + " → " + job.title.padEnd(34) + " [" + ap.stage + "]");
    }
  }
  console.log("\n" + "=".repeat(60));
  console.log("Seed complete!");
  console.log("  HR users:         " + hrUsers.length);
  console.log("  Student users:    " + stUsers.length);
  console.log("  Jobs:             " + createdJobs.length);
  console.log("  Applications:     " + appCount);
  console.log("  Password (all):   TalentForge@123");
  console.log("=".repeat(60));

  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB.");
};

main().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
