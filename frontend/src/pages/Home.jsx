import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import {
  FaBrain,
  FaCode,
  FaEnvelope,
  FaTasks,
  FaTrophy,
  FaUserShield,
  FaCheckCircle,
  FaArrowRight,
  FaFileAlt,
  FaGraduationCap,
  FaPaperPlane,
  FaRobot,
  FaUserTie,
} from "react-icons/fa";

import homeImage from "../assets/images/home.png";
import studentDashboard from "../assets/images/student_dashboard.png";
import hrDashboard from "../assets/images/hr_dashboard.png";

// shared fade-in animation for scroll reveals
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" },
  }),
};

const sectionViewport = { once: true, amount: 0.25 };

const steps = [
  {
    title: "Post a job",
    desc: "Add the role, skills and description. Candidates apply with a PDF resume.",
    icon: FaPaperPlane,
  },
  {
    title: "AI screens resumes",
    desc: "Every resume is scored against the job — keyword match plus semantic similarity.",
    icon: FaRobot,
  },
  {
    title: "Test & shortlist",
    desc: "HR picks the ranked shortlist and runs a timed coding test for the rest.",
    icon: FaFileAlt,
  },
];

const features = [
  {
    icon: FaBrain,
    title: "AI Resume Scoring",
    desc: "Semantic + keyword match on every application, tuned to each job description.",
  },
  {
    icon: FaCode,
    title: "Live Coding Tests",
    desc: "Monaco editor with a timer, and code judged automatically per test case.",
  },
  {
    icon: FaTrophy,
    title: "Ranked Shortlist",
    desc: "The best match is always at the top of your applicant list.",
  },
  {
    icon: FaTasks,
    title: "Stage Tracking",
    desc: "Resume → coding → interview → final, all visible on one board.",
  },
  {
    icon: FaEnvelope,
    title: "Test Invitations",
    desc: "One-click email links with a start and end time for each candidate.",
  },
  {
    icon: FaUserShield,
    title: "Role-based Access",
    desc: "Separate HR and student accounts keep both flows clean and safe.",
  },
];

const scoreBars = [
  { label: "Semantic match", value: 92 },
  { label: "Keyword match", value: 82 },
];

const studentPoints = [
  "Apply to jobs with a PDF resume",
  "Take timed coding tests in-browser",
  "Track your application stage live",
];

const hrPoints = [
  "Post jobs with skills and salary",
  "See applicants ranked by AI score",
  "Move candidates one click at a time",
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0E19] text-gray-200 overflow-x-hidden">
      {/* background glow blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-500/15 blur-[160px]" />
      </div>

      {/* ================= HERO ================= */}
      <section className="px-6 lg:px-20 pt-20 pb-16 bg-gradient-to-b from-[#12182b] to-[#0A0E19]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/25 text-sm text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              AI-Powered Hiring Platform
            </span>

            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Hire smarter.{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Get hired faster.
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-300 max-w-xl">
              TalentForge scores every resume against the job, runs timed coding
              tests, and hands HR one ranked shortlist — no more sorting CVs by
              hand.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => navigate("/jobs")}
                className="group inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-7 py-3 font-semibold rounded-xl transition-colors active:scale-[0.98]"
              >
                Find Jobs
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <ScrollLink
                to="about"
                smooth
                duration={600}
                offset={-70}
                className="cursor-pointer border border-purple-300/40 text-purple-300 hover:bg-purple-400/10 px-7 py-3 rounded-xl font-semibold transition-colors"
              >
                How it works
              </ScrollLink>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-3 mt-12 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                AI score on every resume
              </span>
              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                Coding tests in 5+ languages
              </span>
              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                4 pipeline stages tracked
              </span>
            </div>
          </motion.div>

          {/* hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative justify-self-center lg:justify-self-end"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src={homeImage}
                alt="TalentForge dashboard preview"
                className="w-[440px] max-w-full rounded-2xl shadow-2xl border border-white/10"
              />

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 0.4 }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-sm text-purple-200 shadow-xl"
              >
                Resume scored 87 / 100
              </motion.div>

              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-sm text-purple-200 shadow-xl">
                Semantic 92 · Keyword 82
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= PIPELINE STRIP ================= */}
      <div className="bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-purple-600/90 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white">
          <span className="px-3 py-1 rounded-full bg-white/15">Job posted</span>
          <FaArrowRight className="opacity-80" />
          <span className="px-3 py-1 rounded-full bg-white/15">AI resume screen</span>
          <FaArrowRight className="opacity-80" />
          <span className="px-3 py-1 rounded-full bg-white/15">Coding test</span>
          <FaArrowRight className="opacity-80" />
          <span className="px-3 py-1 rounded-full bg-white/15">Interview</span>
          <FaArrowRight className="opacity-80" />
          <span className="px-3 py-1 rounded-full bg-white/15">Hired</span>
        </div>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <section id="about" className="px-6 lg:px-20 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              How TalentForge works
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              One pipeline from job posting to offer letter — each step feeds
              the next.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-14">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                className="group p-7 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1.5 hover:border-purple-400/40 hover:shadow-[0_16px_40px_-16px_rgba(168,85,247,0.4)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                  <step.icon className="w-5 h-5" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-widest text-purple-400 font-semibold">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BEHIND THE SCORE ================= */}
      <section className="px-6 lg:px-20 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
              AI scoring
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">
              Two scores.{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                One verdict.
              </span>
            </h2>
            <p className="mt-5 text-gray-400 text-lg leading-relaxed">
              Every resume is measured two ways against the job description:
            </p>
            <ul className="mt-6 space-y-4 text-gray-300">
              <li className="flex gap-3">
                <FaCheckCircle className="mt-1 text-green-400 shrink-0" />
                <span>
                  <strong className="text-white">Keyword match</strong> — the
                  share of required terms present in the resume.
                </span>
              </li>
              <li className="flex gap-3">
                <FaCheckCircle className="mt-1 text-green-400 shrink-0" />
                <span>
                  <strong className="text-white">Semantic similarity</strong> —
                  embeddings of the resume and the job, compared by cosine
                  similarity.
                </span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-gray-500">
              The two scores are averaged into the final 0–100 score that drives
              your shortlist.
            </p>
          </motion.div>

          {/* sample scorecard */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="rounded-2xl bg-white/5 border border-white/10 p-7 shadow-xl hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Sample result</h3>
              <span className="text-xs text-gray-500">resume vs. job</span>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">Final score</p>
              <p className="text-6xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                87
              </p>
            </div>

            <div className="mt-8 space-y-5">
              {scoreBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300">{bar.label}</span>
                    <span className="text-white font-semibold">{bar.value}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <p className="text-xs text-gray-500 mb-2">
                Missing keywords (suggested):
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-sm text-amber-300">
                  react
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-sm text-amber-300">
                  mongodb
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="services" className="px-6 lg:px-20 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Everything hiring teams need
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              Built around the job you post and the people who apply to it.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                className="group p-7 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1.5 hover:border-purple-400/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STUDENTS & HR ================= */}
      <section id="students" className="px-6 lg:px-20 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Built for both sides
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              One platform, two clean experiences.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mt-14">
            {/* student card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1.5 hover:border-purple-400/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-300">
                  <FaGraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">For Students</h3>
              </div>

              <ul className="mt-6 space-y-3">
                {studentPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>

              <img
                src={studentDashboard}
                alt="Student dashboard preview"
                className="mt-6 rounded-xl border border-white/10"
              />

              <button
                onClick={() => navigate("/student/signup")}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors active:scale-[0.99]"
              >
                Join as Student
              </button>
            </motion.div>

            {/* hr card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1.5 hover:border-blue-400/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300">
                  <FaUserTie className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">For Hiring Teams</h3>
              </div>

              <ul className="mt-6 space-y-3">
                {hrPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>

              <img
                src={hrDashboard}
                alt="HR dashboard preview"
                className="mt-6 rounded-xl border border-white/10"
              />

              <button
                onClick={() => navigate("/hr/create")}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors active:scale-[0.99]"
              >
                Post a Job
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        id="contact"
        className="bg-gradient-to-r from-purple-700 to-blue-600 text-white text-center px-6 lg:px-20 py-20"
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Ready to build your team?
          </h2>
          <p className="mt-4 text-lg text-purple-100">
            Create an account and hire or apply — the first job posting is free.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/student/signup")}
              className="bg-white text-purple-700 font-semibold px-10 py-3 rounded-xl hover:bg-purple-50 transition-colors active:scale-[0.98]"
            >
              Create Student Account
            </button>
            <button
              onClick={() => navigate("/hr/signup")}
              className="border-2 border-white px-10 py-3 rounded-xl hover:bg-white hover:text-purple-700 font-semibold transition-colors active:scale-[0.98]"
            >
              Create HR Account
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;