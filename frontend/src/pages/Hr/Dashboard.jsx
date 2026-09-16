import { useState, useEffect } from "react";
import axios from "axios";
import {
  FileSearch,
  UserSearch,
  Code2,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  Briefcase,
  MapPin,
  Banknote,
  CalendarDays,
  ChevronRight,
  Inbox,
  RefreshCw,
} from "lucide-react";

import ResumeScreening from "./stages/ResumeScreening";
import ProfileReview from "./stages/ProfileReview";
import CodingTest from "./stages/CodingTest";
import TestEvaluation from "./stages/TestEvaluation";
import Interview from "./stages/Interview";

import BASE_URL from "../../apiConfig";
import PipelineTracker from "../../components/common/PipelineTracker";
import { card, stageDot } from "./stages/StageUI";

const stages = [
  { key: "resume", label: "Resume Screening", tagline: "AI ranks every applicant", icon: FileSearch, component: ResumeScreening },
  { key: "profile", label: "Profile Review", tagline: "Shortlist the best profiles", icon: UserSearch, component: ProfileReview },
  { key: "coding", label: "Coding Test", tagline: "Timed technical round", icon: Code2, component: CodingTest },
  { key: "evaluation", label: "Test Evaluation", tagline: "Score & rank results", icon: ClipboardCheck, component: TestEvaluation },
  { key: "interview", label: "Interview", tagline: "Final candidate rounds", icon: MessageSquare, component: Interview },
];

const fmtSalary = (s) => {
  if (!s) return "N/A";
  return `${s.min || 0}–${s.max || 0} LPA`;
};

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const daysLeft = (d) => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - Date.now()) / 86400000);
  return diff;
};

const HRDashboard = () => {
  const [hrData, setHrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHrJobs = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/job/getjobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobs = res.data.jobs || [];
      setHrData(jobs);
      setSelectedJob((current) => {
        if (!current) return null;
        return jobs.find((job) => job._id === current._id) || current;
      });
    } catch (err) {
      console.error("Error fetching jobs:", err);
      alert("Failed to fetch jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHrJobs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHrJobs({ silent: true });
  };

  const handleJobSelect = (job) => setSelectedJob(job);

  const renderStageComponent = () => {
    if (!selectedJob) return null;
    const stageObj = stages.find((s) => s.key === selectedJob.stage);
    if (!stageObj) return <p>Unknown Stage</p>;

    const StageComponent = stageObj.component;
    return (
      <StageComponent
        job={selectedJob}
        onStageUpdate={() => fetchHrJobs({ silent: true })}
      />
    );
  };

  /* ── stage tracker : the recruitment pipeline ─────────────────── */
  const renderStageTracker = () => {
    if (!selectedJob) return null;
    return <PipelineTracker stages={stages} currentKey={selectedJob.stage} />;
  };

  /* ── sidebar jobs list ────────────────────────────────────────── */
  const renderSidebar = () => (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-800">Your Jobs</h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
          {hrData.length}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {hrData.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-slate-400">
            No jobs posted yet
          </p>
        ) : (
          hrData.map((job) => {
            const active = selectedJob?._id === job._id;
            return (
              <button
                key={job._id}
                type="button"
                onClick={() => handleJobSelect(job)}
                className={`group block w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                  active
                    ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-md ring-2 ring-indigo-500/50"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`truncate text-sm font-bold ${
                      active ? "text-indigo-700" : "text-slate-700"
                    }`}
                  >
                    {job.title}
                  </h3>
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${stageDot(
                      job.stage
                    )} ${active ? "animate-pulse" : ""}`}
                    title={`Stage: ${job.stage}`}
                  />
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {job.company}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {fmtSalary(job.salaryRange)}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 ${
                      active ? "text-indigo-500" : ""
                    }`}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center pt-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );

  /* ── main panel ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 pt-20">
      <div className="flex min-h-[calc(100vh-5rem)]">
        {renderSidebar()}

        <main className="flex-1 space-y-6 overflow-y-auto p-6 lg:p-8">
          {selectedJob ? (
            <>
              {/* job header banner */}
              <header
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 shadow-xl shadow-indigo-500/20 lg:p-8"
                style={{ animation: "tf-fadeUp .45s ease-out both" }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-14 -left-8 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" />
                        {selectedJob.isActive ? "Active posting" : "Closed"}
                      </div>
                      <h2 className="text-2xl font-bold text-white lg:text-3xl">
                        {selectedJob.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-indigo-100">
                        {selectedJob.company}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      title="Refresh job data"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-indigo-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                      />
                      Stage:{" "}
                      {stages.find((s) => s.key === selectedJob.stage)?.label}
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: Briefcase, label: "Type", value: selectedJob.employmentType },
                      { icon: MapPin, label: "Location", value: selectedJob.location },
                      { icon: Banknote, label: "Salary", value: fmtSalary(selectedJob.salaryRange) },
                      { icon: CalendarDays, label: "Deadline", value: `${fmtDate(selectedJob.deadline)} · ${daysLeft(selectedJob.deadline)}d left` },
                    ].map((m, i) => (
                      <div
                        key={m.label}
                        className="flex items-center gap-3 rounded-xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                        style={{ animation: `tf-fadeUp .45s ease-out both`, animationDelay: `${150 + i * 70}ms` }}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                          <m.icon className="h-5 w-5 text-white" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-indigo-100">
                            {m.label}
                          </span>
                          <span className="block truncate text-xs font-bold text-white">
                            {m.value}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </header>

              {/* stage tracker */}
              {renderStageTracker()}

              {/* stage workspace */}
              <section
                className={`${card} overflow-hidden`}
                style={{ animation: "tf-fadeUp .5s ease-out both", animationDelay: "120ms" }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      {(() => {
                        const Icon = stages.find((s) => s.key === selectedJob.stage)?.icon;
                        return Icon ? <Icon className="h-4 w-4" /> : null;
                      })()}
                    </span>
                    Stage Workspace
                  </h3>
                  <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                    {stages.find((s) => s.key === selectedJob.stage)?.tagline}
                  </span>
                </div>

                <div className="p-5 lg:p-6">{renderStageComponent()}</div>
              </section>
            </>
          ) : (
            <div className={card}>
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                  <Inbox className="h-8 w-8" />
                </span>
                <h3 className="text-lg font-bold text-slate-700">
                  Select a job to get started
                </h3>
                <p className="max-w-sm text-sm text-slate-400">
                  Pick a posting from the sidebar to review applicants, run the
                  pipeline and shortlist candidates.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;