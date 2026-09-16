import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarCheck,
  Handshake,
  Loader2,
  Phone,
  User,
  Mail,
  BadgeCheck,
} from "lucide-react";

import BASE_URL from "../../../apiConfig";
import {
  btn,
  card,
  sectionTitle,
  scorePill,
  initials,
  avatarGradient,
} from "./StageUI";

export default function Interview({ job }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contacting, setContacting] = useState(null);

  useEffect(() => {
    if (!job) return;

    const fetchInterviewStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/job/students/${job._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const interviewStudents = (res.data || []).filter(
          (student) => student.currentStage === "interview"
        );

        setStudents(interviewStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
        alert("Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewStudents();
  }, [job]);

  const markAsContacted = async (studentId) => {
    setContacting(studentId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/job/applicants/${studentId}/mark-contacted`,
        { jobId: job._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStudents((prev) =>
        prev.map((student) =>
          student._id === studentId
            ? { ...student, contacted: true }
            : student
        )
      );
    } catch (err) {
      console.error("Error marking student as contacted:", err);
      alert("Failed to mark as contacted.");
    } finally {
      setContacting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className={sectionTitle}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <CalendarCheck className="h-4 w-4" />
          </span>
          Interview
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">
            {students.length}
          </span>{" "}
          {students.length === 1 ? "candidate is" : "candidates are"} waiting —
          reach out to schedule the final round.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading candidates…
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <Handshake className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            No students at the interview stage yet
          </p>
          <p className="text-xs text-slate-400">
            Move top test scorers here from Test Evaluation.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {students.map((student, i) => (
            <li
              key={student._id}
              className={`${card} flex flex-wrap items-center justify-between gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 ${
                student.contacted ? "border-emerald-200 bg-emerald-50/40" : ""
              }`}
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
                  <p className="flex items-center gap-2 truncate font-bold text-slate-800">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {student.userId?.name}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                    {student.userId?.email}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Phone className="h-3 w-3" />
                    Test score
                    <span className={scorePill(student.testScore ?? student.score ?? 0)}>
                      {student.testScore ?? student.score ?? 0}%
                    </span>
                  </span>
                </div>
              </div>

              {student.contacted ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <BadgeCheck className="h-4 w-4" />
                  Contacted
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => markAsContacted(student._id)}
                  disabled={contacting === student._id}
                  className={btn.primary}
                >
                  {contacting === student._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  Mark as Contacted
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}