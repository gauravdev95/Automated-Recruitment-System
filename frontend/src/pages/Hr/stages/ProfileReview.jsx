import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ListChecks,
  ExternalLink,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Award,
} from "lucide-react";

import BASE_URL from "../../../apiConfig";
import {
  btn,
  card,
  input,
  label,
  sectionTitle,
  scorePill,
  initials,
  avatarGradient,
} from "./StageUI";

const ProfileReview = ({ job, onStageUpdate }) => {
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectCount, setSelectCount] = useState(0);
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

        // Sort applicants by resume score in descending order.
        const sortedApplicants = (res.data || []).sort(
          (a, b) => (b.resumeScore || 0) - (a.resumeScore || 0)
        );

        setApplicants(sortedApplicants);
      } catch (err) {
        console.error("Error fetching applicants:", err);
        alert("Failed to fetch applicants");
      } finally {
        setLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, [job]);

  const handleSelectTopStudents = () => {
    const count = Math.min(Number(selectCount), applicants.length);
    if (!count || count <= 0) {
      alert("Enter a valid number of students to select.");
      return;
    }
    const topStudents = applicants.slice(0, count).map((s) => s._id);
    setSelectedStudents(topStudents);
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleConfirmSelection = async () => {
    if (!job || selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/job/${job._id}/stageChangeInStudent`,
        { studentIds: selectedStudents, stage: "coding" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.post(
        `${BASE_URL}/job/${job._id}/stageChange`,
        { stage: "coding" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Selection confirmed and stages updated!");
      setSelectedStudents([]);
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error("Error confirming selection:", err);
      alert("Failed to update stages.");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTopSelection = async () => {
    const count = Math.min(Number(selectCount), applicants.length);
    if (!count || count <= 0) {
      alert("Enter a valid number of students to select.");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/job/${job._id}/shortlist/resume`,
        { topN: count },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Top ${count} students moved to coding round.`);
      setSelectedStudents([]);
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error("Error selecting top students:", err);
      alert(err.response?.data?.message || "Failed to select top students.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className={sectionTitle}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <Users className="h-4 w-4" />
          </span>
          Profile Review
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {applicants.length} applicant{applicants.length === 1 ? "" : "s"} — pick
          the profiles that match best and move them into the coding round.
        </p>
      </div>

      {/* bulk shortlist */}
      <div className={`${card} relative overflow-hidden p-5`}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-100/70 blur-2xl" />
        <div className="relative">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <Award className="h-4 w-4 text-violet-500" />
            Bulk shortlist by score
          </h4>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <label className={label}>Top N candidates</label>
              <input
                type="number"
                min="1"
                max={applicants.length}
                value={selectCount}
                onChange={(e) => setSelectCount(Number(e.target.value))}
                placeholder="e.g. 5"
                className={input}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleSelectTopStudents} className={btn.outline}>
                <ListChecks className="h-4 w-4" />
                Preview Top Students
              </button>
              <button
                type="button"
                onClick={handleConfirmTopSelection}
                disabled={processing || applicants.length === 0}
                className={btn.success}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Move Top To Coding
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* manual selection */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <ListChecks className="h-4 w-4 text-indigo-400" />
          Or select manually
        </h4>

        {loadingApplicants ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading applicants…
          </div>
        ) : applicants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            No applicants found for this job yet.
          </div>
        ) : (
          <ul className="max-h-[27rem] space-y-2.5 overflow-y-auto pr-1">
            {applicants.map((student, i) => {
              const checked = selectedStudents.includes(student._id);
              const score = student.resumeScore;
              return (
                <li key={student._id}>
                  <button
                    type="button"
                    onClick={() => handleToggleStudent(student._id)}
                    className={`group w-full rounded-xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      checked
                        ? "border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-300"
                        : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                          checked
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 bg-white group-hover:border-indigo-300"
                        }`}
                      >
                        {checked && <CheckCircle2 className="h-4 w-4" />}
                      </span>

                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow ${avatarGradient(
                          student.userId?.name
                        )}`}
                      >
                        {initials(student.userId?.name)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {student.userId?.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {student.userId?.email}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                              style={{ width: `${score || 0}%` }}
                            />
                          </div>
                          <span className={scorePill(score)}>
                            {score ?? "N/A"}
                            {score != null && "%"}
                          </span>
                        </div>
                      </div>

                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/${student.userId?._id}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/student/${student.userId?._id}`);
                          }
                        }}
                        className={btn.outline}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Profile
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* confirm bar */}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-lg shadow-slate-200/50 backdrop-blur">
        <span className="text-sm font-semibold text-slate-600">
          <span className="text-indigo-600">{selectedStudents.length}</span>{" "}
          selected
        </span>
        <button
          type="button"
          onClick={handleConfirmSelection}
          disabled={processing || selectedStudents.length === 0}
          className={btn.primary}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Confirm Selection → Coding
        </button>
      </div>
    </div>
  );
};

export default ProfileReview;