import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Wand2, ExternalLink, User, Loader2 } from "lucide-react";

import BASE_URL from "../../../apiConfig";
import {
  btn,
  card,
  sectionTitle,
  scorePill,
  initials,
  avatarGradient,
} from "./StageUI";

const ResumeScreening = ({ job, onStageUpdate }) => {
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!job) return;

    const fetchApplicants = async () => {
      try {
        setLoadingApplicants(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/job/students/${job._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplicants(res.data || []);
      } catch (err) {
        console.error("Error fetching applicants:", err);
        alert("Failed to fetch applicants");
      } finally {
        setLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, [job]);

  const handleProcessResumes = async () => {
    if (!job) return;
    setProcessing(true);

    try {
      const token = localStorage.getItem("token");

      // Resume screening also moves the job to profile when the backend completes.
      const scoreRes = await axios.post(
        `${BASE_URL}/job/${job._id}/resume-screen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplicants(scoreRes.data.results || []);
      alert(
        `Resume screening completed. Scored: ${scoreRes.data.scoredCount || 0}, skipped/failed: ${scoreRes.data.skippedOrFailedCount || 0}.`
      );
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error("Error processing resumes:", err);
      alert(err.response?.data?.message || "Failed to process resumes.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className={sectionTitle}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Wand2 className="h-4 w-4" />
          </span>
          Resume Screening
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Processing resumes for{" "}
          <span className="font-semibold text-slate-700">{job?.title}</span> —
          the AI engine scores every applicant against the job description.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleProcessResumes}
          disabled={processing}
          className={btn.primary}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing resumes…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Process Resumes
            </>
          )}
        </button>
        {applicants.length > 0 && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <User className="h-4 w-4 text-indigo-400" />
          Applicants
        </h4>

        {loadingApplicants ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading applicants…
          </div>
        ) : applicants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            No applicants yet — hit <span className="font-semibold text-indigo-500">Process Resumes</span> to start.
          </div>
        ) : (
          <ul className="space-y-3">
            {applicants.map((student, i) => (
              <li
                key={student._id}
                className={`${card} flex flex-wrap items-center justify-between gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100`}
                style={{ animation: `tf-fadeUp .4s ease-out both`, animationDelay: `${i * 60}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md ${avatarGradient(
                      student.userId?.name
                    )}`}
                  >
                    {initials(student.userId?.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">
                      {student.userId?.name || "Candidate"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {student.userId?.email || student.email}
                    </p>
                    {student.status && (
                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {student.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={scorePill(student.resumeScore ?? student.score)}>
                    {student.resumeScore ?? student.score ?? "N/A"}
                    {student.resumeScore != null && "%"}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/student/${student.userId?._id}`)}
                    className={btn.outline}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Profile
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResumeScreening;