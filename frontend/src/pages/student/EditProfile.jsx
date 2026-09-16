import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import API from "../../apiConfig";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
};

const EditProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/students/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(res.data);
    } catch (err) {
      console.error("Profile fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/students/updateProfile`, student, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/student/profile");
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

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
        <p className="text-slate-500 text-lg">No profile data found.</p>
      </div>
    );
  }

  const fields = [
    { name: "name", label: "Full Name", icon: User, type: "text", required: true },
    { name: "email", label: "Email", icon: Mail, type: "email", required: true },
    { name: "phone", label: "Phone", icon: Phone, type: "text", required: false },
    { name: "location", label: "Location", icon: MapPin, type: "text", required: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/student/profile")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your profile information below.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-xl shadow-indigo-500/5"
        >
          {/* Gradient strip */}
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600" />

          <div className="p-6 sm:p-8 space-y-6">

            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                  <User className="h-5 w-5 text-indigo-600" />
                </span>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ name, label, icon: Icon, type, required }) => (
                  <div key={name} className={name === "name" || name === "email" ? "" : ""}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {label}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Icon className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type={type}
                        name={name}
                        value={student[name] || ""}
                        onChange={handleChange}
                        required={required}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/70 bg-white/60 text-slate-900 placeholder-slate-400
                          focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                  <FileText className="h-5 w-5 text-violet-600" />
                </span>
                About
              </h2>

              <textarea
                name="about"
                value={student.about || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Write a short bio..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200/70 bg-white/60 text-slate-900 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-sm leading-relaxed resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <Loader />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => navigate("/student/profile")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default EditProfile;
