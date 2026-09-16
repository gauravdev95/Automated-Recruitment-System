import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FileCheck2,
  Code2,
  MessageSquare,
  Award,
  XCircle,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Search,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import PipelineTracker from "../../components/common/PipelineTracker";
import API from "../../apiConfig";

const appStages = [
  { key: "resume", label: "Applied", tagline: "Application sent", icon: FileCheck2 },
  { key: "coding", label: "Coding Test", tagline: "Timed skills round", icon: Code2 },
  { key: "interview", label: "Interview", tagline: "Final candidate round", icon: MessageSquare },
  { key: "final", label: "Offered", tagline: "Offer extended", icon: Award },
  { key: "rejected", label: "Rejected", tagline: "Move on to the next", icon: XCircle },
];

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`${API}/job/my-applications-stages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    const interval = setInterval(fetchApplications, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const inProgress = applications.filter(
    (a) => !["final", "rejected"].includes(a.currentStage)
  ).length;
  const selected = applications.filter((a) => a.currentStage === "final").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/40 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            My Application <span className="text-indigo-600">Pipeline</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Track every application as it moves through the recruitment stages.
          </p>

          {applications.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                {applications.length} applied
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                {inProgress} in progress
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {selected} offered
              </span>
            </div>
          )}
        </header>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
            <p className="text-base font-semibold text-slate-600">
              No applications yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Apply to a job and track its progress right here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Search className="h-4 w-4" />
              Find jobs
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.applicationId}>
                <PipelineTracker
                  stages={appStages}
                  currentKey={app.currentStage}
                  title={app.jobTitle}
                  subtitle={`${app.company} · ${app.location || "Remote"}`}
                  terminalKey="rejected"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;