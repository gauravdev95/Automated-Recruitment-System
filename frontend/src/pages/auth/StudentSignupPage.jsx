import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  GraduationCap,
  Wrench,
  FileText,
  Link as LinkIcon,
  Camera,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import { registerStudent } from "../../services/auth.service";
import Loader from "../../components/common/Loader";
import uploadToCloudinary from "../../services/cloudinary.service";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeOut" },
  }),
};

const StudentSignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    skills: "",
    about: "",
    socialLinks: { linkedin: "", github: "", portfolio: "" },
  });

  const [files, setFiles] = useState({ profilePhoto: null, resume: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const photoRef = useRef(null);
  const resumeRef = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setForm({
        ...form,
        socialLinks: { ...form.socialLinks, [key]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e, type) => {
    setFiles({ ...files, [type]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const [profilePhotoUrl, resumeUrl] = await Promise.all([
        files.profilePhoto ? uploadToCloudinary(files.profilePhoto, "image") : "",
        files.resume ? uploadToCloudinary(files.resume, "raw") : "",
      ]);

      const payload = {
        ...form,
        role: "student",
        profilePhoto: profilePhotoUrl,
        resume: resumeUrl,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
      };

      await registerStudent(payload);

      setMessage({ type: "success", text: "Registration successful!" });
      navigate("/login");
    } catch (err) {
      setMessage({ type: "error", text: "Signup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition";

  const labelClass = "block text-gray-300 mb-2 font-medium text-sm";

  const sectionTitle = (icon, text) => (
    <p className="flex items-center gap-2 text-gray-200 font-semibold text-sm uppercase tracking-wide mb-3">
      {icon}
      {text}
    </p>
  );

  const renderFileField = ({ type, label, icon, accept, hint }) => {
    const file = files[type];
    const hasFile = Boolean(file);
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <input
          ref={type === "profilePhoto" ? photoRef : resumeRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e, type)}
          className="hidden"
        />
        <div
          onClick={() => (type === "profilePhoto" ? photoRef : resumeRef).current?.click()}
          className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-dashed transition cursor-pointer ${
            hasFile
              ? "bg-purple-500/10 border-purple-500/40"
              : "bg-white/10 border-white/25 hover:border-purple-400/50 hover:bg-white/15"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
              {hasFile ? icon : <Upload className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {hasFile ? file.name : hint}
              </p>
              {!hasFile && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Click to browse or drag a file here
                </p>
              )}
            </div>
          </div>
          {hasFile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                setFiles({ ...files, [type]: null });
                if (type === "profilePhoto" && photoRef.current) photoRef.current.value = "";
                if (type === "resume" && resumeRef.current) resumeRef.current.value = "";
              }}
              className="shrink-0 rounded-full p-1 text-gray-400 hover:text-red-400 hover:bg-white/10 transition"
              aria-label={`Remove ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6 py-10 bg-gradient-to-br from-[#0A0F1F] via-[#1B2340] to-[#301A4A]">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/20 blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/20 blur-[150px]" />
      </div>

      <motion.form
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl p-6 sm:p-10 rounded-2xl shadow-2xl border border-white/10 bg-white/10 backdrop-blur-xl text-gray-200"
      >
        <h2 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-extrabold text-center text-white drop-shadow mb-2">
          <UserPlus className="h-8 w-8 text-purple-300" />
          Student Signup
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Create your account to start applying for jobs
        </p>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm text-center border ${
              message.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border-red-500/40"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ===== ACCOUNT ===== */}
        <div className="mb-6">
          {sectionTitle(<User className="h-4 w-4 text-purple-400" />, "Account")}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeUp} custom={1}>
              <label className={labelClass}>Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder="Your full name" className={inputClass} />
            </motion.div>
            <motion.div variants={fadeUp} custom={2}>
              <label className={labelClass}>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com" className={inputClass} />
            </motion.div>
            <motion.div variants={fadeUp} custom={3} className="sm:col-span-2">
              <label className={labelClass}>Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="Create a strong password" className={inputClass} />
            </motion.div>
          </div>
        </div>

        {/* ===== CONTACT ===== */}
        <div className="mb-6">
          {sectionTitle(<Phone className="h-4 w-4 text-purple-400" />, "Contact")}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeUp} custom={1}>
              <label className={labelClass}>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+91 98765 43210" className={inputClass} />
            </motion.div>
            <motion.div variants={fadeUp} custom={2}>
              <label className={labelClass}>Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange}
                placeholder="City, State" className={inputClass} />
            </motion.div>
          </div>
        </div>

        {/* ===== EDUCATION ===== */}
        <div className="mb-6">
          {sectionTitle(<GraduationCap className="h-4 w-4 text-purple-400" />, "Education")}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeUp} custom={1} className="sm:col-span-2">
              <label className={labelClass}>College / University</label>
              <input type="text" name="college" value={form.college} onChange={handleChange}
                placeholder="Your institution name" className={inputClass} />
            </motion.div>
            <motion.div variants={fadeUp} custom={2}>
              <label className={labelClass}>Degree</label>
              <input type="text" name="degree" value={form.degree} onChange={handleChange}
                placeholder="B.Tech, B.Sc, MCA..." className={inputClass} />
            </motion.div>
            <motion.div variants={fadeUp} custom={3}>
              <label className={labelClass}>Branch</label>
              <input type="text" name="branch" value={form.branch} onChange={handleChange}
                placeholder="Computer Science..." className={inputClass} />
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="sm:col-span-2">
              <label className={labelClass}>Graduation Year</label>
              <input type="number" name="graduationYear" value={form.graduationYear} onChange={handleChange}
                placeholder="2024" className={inputClass} />
            </motion.div>
          </div>
        </div>

        {/* ===== SKILLS & ABOUT ===== */}
        <div className="mb-6">
          {sectionTitle(<Wrench className="h-4 w-4 text-purple-400" />, "Skills & About")}
          <div className="space-y-4">
            <motion.div variants={fadeUp} custom={1}>
              <label className={labelClass}>Skills (comma separated)</label>
              <input type="text" name="skills" value={form.skills} onChange={handleChange}
                placeholder="React, Node.js, MongoDB" className={inputClass} />
            </motion.div>
            <motion.div variants={fadeUp} custom={2}>
              <label className={labelClass}>About</label>
              <textarea name="about" value={form.about} onChange={handleChange} rows={3}
                placeholder="A short intro about yourself..." className={inputClass + " resize-none"} />
            </motion.div>
          </div>
        </div>

        {/* ===== SOCIAL LINKS ===== */}
        <div className="mb-6">
          {sectionTitle(<LinkIcon className="h-4 w-4 text-purple-400" />, "Social Links")}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["linkedin", "github", "portfolio"].map((key, i) => (
              <motion.div key={key} variants={fadeUp} custom={i + 1}>
                <label className={labelClass}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input
                  type="url"
                  name={`socialLinks.${key}`}
                  value={form.socialLinks[key]}
                  onChange={handleChange}
                  placeholder={
                    key === "linkedin" ? "linkedin.com/in/..." :
                    key === "github" ? "github.com/..." :
                    "Portfolio URL"
                  }
                  className={inputClass}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ===== FILE UPLOADS ===== */}
        <div className="mb-8">
          {sectionTitle(<Camera className="h-4 w-4 text-purple-400" />, "Profile & Resume")}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeUp} custom={1}>
              {renderFileField({
                type: "profilePhoto",
                label: "Profile Photo",
                icon: <Camera className="h-4 w-4" />,
                accept: "image/*",
                hint: "Upload profile photo",
              })}
            </motion.div>
            <motion.div variants={fadeUp} custom={2}>
              {renderFileField({
                type: "resume",
                label: "Resume (PDF)",
                icon: <FileText className="h-4 w-4" />,
                accept: ".pdf",
                hint: "Upload resume PDF",
              })}
            </motion.div>
          </div>
        </div>

        {/* SUBMIT */}
        <motion.div variants={fadeUp} custom={3}>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-base shadow-md transition-all
              bg-purple-600 hover:bg-purple-700 active:scale-[0.98] flex items-center justify-center gap-2
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? <Loader /> : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            )}
          </button>
        </motion.div>

        {/* LOGIN LINK */}
        <motion.p variants={fadeUp} custom={4}
          className="text-center text-gray-300 mt-5 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-300 hover:underline font-medium">
            Login here
          </Link>
        </motion.p>
      </motion.form>
    </div>
  );
};

export default StudentSignupPage;