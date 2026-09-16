import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  Users,
  Loader2,
  ListChecks,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import BASE_URL from "../../../apiConfig";
import {
  btn,
  card,
  input,
  label,
  sectionTitle,
  initials,
  avatarGradient,
} from "./StageUI";

const rankBadge = {
  1: "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md shadow-amber-400/40",
  2: "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md shadow-slate-300/40",
  3: "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-md shadow-orange-400/40",
};

const trackColor = (score) => {
  const s = Number(score) || 0;
  if (s >= 75) return "from-emerald-500 to-teal-500";
  if (s >= 60) return "from-lime-500 to-emerald-500";
  if (s >= 40) return "from-amber-400 to-orange-500";
  return "from-rose-500 to-red-500";
};

export default function TestEvaluation({ job, onStageUpdate }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectCount, setSelectCount] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/job/test/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = (res.data || []).sort(
        (a, b) => (b.testScore || b.score || 0) - (a.testScore || a.score || 0)
      );
      setStudents(sorted);
    } catch (err) {
      console.error("Error fetching students:", err);
      alert("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  }, [job]);

  useEffect(() => {
    if (!job) return;
    fetchStudents();
  }, [job, fetchStudents]);

  const handleSelectTop = () => {
    const count = Math.min(Number(selectCount), students.length);
    if (!count || count <= 0) {
      alert("Enter a valid number of students to select.");
      return;
    }
    const top = students.slice(0, count).map((s) => s._id);
    setSelectedStudents(top);
  };

  const handleToggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleConfirmTopSelection = async () => {
    const count = Math.min(Number(selectCount), students.length);
    if (!count || count <= 0) {
      alert("Enter a valid number of students to select.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/job/${job._id}/shortlist/test`,
        { topN: count },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Top ${count} students moved to interview.`);
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error("Error selecting top test scores:", err);
      alert(err.response?.data?.message || "Failed to select top students.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Update job stage to interview
      await axios.post(
        `${BASE_URL}/job/${job._id}/stageChange`,
        { stage: "interview" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update selected students' stage to interview
      await axios.post(
        `${BASE_URL}/job/${job._id}/stageChangeInStudent`,
        { studentIds: selectedStudents, stage: "interview" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Interview stage updated for selected students.");
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error("Error updating stages:", err);
      alert("Failed to update stages.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className={sectionTitle}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Trophy className="h-4 w-4" />
          </span>
          Test Evaluation
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {students.length} candidate{students.length === 1 ? "" : "s"} finished the
          coding round — ranked by test score.
        </p>
      </div>

      {/* bulk select */}
      <div className={`${card} relative overflow-hidden p-5`}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/70 blur-2xl" />
        <div className="relative">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Shortlist by top score
          </h4>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <label className={label}>Top N candidates</label>
              <input
                type="number"
                min="1"
                max={students.length}
                value={selectCount}
                onChange={(e) => setSelectCount(Number(e.target.value))}
                placeholder="e.g. 4"
                className={input}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleSelectTop} className={btn.outline}>
                <ListChecks className="h-4 w-4" />
                Preview Top Students
              </button>
              <button
                type="button"
                onClick={handleConfirmTopSelection}
                disabled={loading || students.length === 0}
                className={btn.success}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Move Top To Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* leaderboard */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <Users className="h-4 w-4 text-indigo-400" />
          Ranked candidates
        </h4>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading results…
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            No completed tests found yet.
          </div>
        ) : (
          <ul className="max-h-[27rem] space-y-2.5 overflow-y-auto pr-1">
            {students.map((student, i) => {
              const checked = selectedStudents.includes(student._id);
              const score = student.testScore ?? student.score ?? 0;
              return (
                <li key={student._id}>
                  <button
                    type="button"
                    onClick={() => handleToggleStudent(student._id)}
                    className={`group w-full rounded-xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      checked
                        ? "border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-300"
                        : "border-slate-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                          checked
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white group-hover:border-emerald-300"
                        }`}
                      >
                        {checked && <CheckCircle2 className="h-4 w-4" />}
                      </span>

                      {/* rank */}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          rankBadge[i + 1] ||
                          "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {i + 1}
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
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${trackColor(
                                score
                              )}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-black ${
                          selectedStudents.includes(student._id)
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {score}%
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
          <span className="text-emerald-600">{selectedStudents.length}</span>{" "}
          selected
        </span>
        <button
          type="button"
          onClick={handleConfirmSelection}
          disabled={loading || selectedStudents.length === 0}
          className={btn.primary}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Confirm Selection → Interview
        </button>
      </div>
    </div>
  );
}