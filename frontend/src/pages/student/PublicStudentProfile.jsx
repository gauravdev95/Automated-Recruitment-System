import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Wrench,
  User,
  FolderGit2,
  Link as LinkIcon,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Calendar,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import API from "../../apiConfig";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
  }),
};

const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

const bgMap = {
  indigo: "bg-indigo-50",
  violet: "bg-violet-50",
  emerald: "bg-emerald-50",
  amber: "bg-amber-50",
  rose: "bg-rose-50",
  cyan: "bg-cyan-50",
};

const SectionHeader = ({ icon, title, color }) => (
  <div className="flex items-center gap-2.5">
    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgMap[color] || "bg-slate-50"}`}>
      {icon}
    </span>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
  </div>
);

const EmptyState = ({ text }) => (
  <p className="mt-3 text-sm text-slate-400 italic">{text}</p>
);

const SkillChip = ({ skill, index }) => (
  <motion.span
    variants={fadeUp}
    custom={index * 0.3}
    className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-700"
  >
    {skill}
  </motion.span>
);

const SocialPill = ({ href, icon, label, color }) => {
  const colorMap = {
    indigo: "hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600",
    slate: "hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700",
    violet: "hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${colorMap[color] || colorMap.slate}`}
    >
      {icon}
      {label}
      <ExternalLink className="h-3 w-3 opacity-40" />
    </a>
  );
};

const PublicStudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/students/getProfile/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error("Public profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 text-lg">Profile not found.</p>
      </div>
    );
  }

  const initials = getInitials(student.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* ===== HERO HEADER ===== */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-xl shadow-indigo-500/5 mb-8"
        >
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600" />

          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
            <div className="relative shrink-0">
              <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-xl shadow-indigo-500/30 ring-4 ring-white">
                {student.profilePhoto ? (
                  <img src={student.profilePhoto} alt={student.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{student.name}</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">{student.email}</p>
              {student.location && (
                <p className="mt-1 text-sm text-slate-500">{student.location}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ===== TWO-COLUMN LAYOUT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-8">

            {/* About */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-md shadow-indigo-500/5 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <SectionHeader icon={<User className="h-5 w-5 text-indigo-600" />} title="About" color="indigo" />
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {student.about || "No information provided."}
              </p>
            </motion.div>

            {/* Education */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-md shadow-indigo-500/5 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <SectionHeader icon={<GraduationCap className="h-5 w-5 text-violet-600" />} title="Education" color="violet" />
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
                    <BookOpen className="h-5 w-5 text-violet-600" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {student.degree} — {student.branch}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{student.college}</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                      <Calendar className="h-3 w-3" />
                      Graduated {student.graduationYear}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Projects */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-md shadow-indigo-500/5 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <SectionHeader icon={<FolderGit2 className="h-5 w-5 text-emerald-600" />} title="Projects" color="emerald" />
              {student.projects?.length ? (
                <div className="mt-4 space-y-3">
                  {student.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="group rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {proj.title}
                        </p>
                        {proj.githubLink && (
                          <a
                            href={proj.githubLink}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-all hover:border-emerald-300 hover:text-emerald-600 hover:shadow-sm"
                          >
                            <Github className="h-3.5 w-3.5" />
                            Code
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No projects added yet." />
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* Skills */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-md shadow-indigo-500/5 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <SectionHeader icon={<Wrench className="h-5 w-5 text-cyan-600" />} title="Skills" color="cyan" />
              {student.skills?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {student.skills.map((skill, i) => (
                    <SkillChip key={i} skill={skill} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState text="No skills added yet." />
              )}
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-md shadow-indigo-500/5 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <SectionHeader icon={<LinkIcon className="h-5 w-5 text-indigo-600" />} title="Social Links" color="indigo" />
              <div className="mt-4 flex flex-wrap gap-3">
                {student.socialLinks?.linkedin && (
                  <SocialPill href={student.socialLinks.linkedin} icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" color="indigo" />
                )}
                {student.socialLinks?.github && (
                  <SocialPill href={student.socialLinks.github} icon={<Github className="h-4 w-4" />} label="GitHub" color="slate" />
                )}
                {student.socialLinks?.portfolio && (
                  <SocialPill href={student.socialLinks.portfolio} icon={<Globe className="h-4 w-4" />} label="Portfolio" color="violet" />
                )}
                {!student.socialLinks?.linkedin &&
                  !student.socialLinks?.github &&
                  !student.socialLinks?.portfolio && (
                    <EmptyState text="No social links added yet." />
                  )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStudentProfile;
