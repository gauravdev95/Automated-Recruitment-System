import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Plus, Loader2, Mail, Clock, Send, Flag, FileQuestion, CheckCircle2 } from "lucide-react";
import CreateQuestion from "../CreateQuestion";

import BASE_URL from "../../../apiConfig";
import { btn, card, input, label } from "./StageUI";

const CodingTest = ({ job, onStageUpdate }) => {
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [email, setEmail] = useState("");
  const [emailDescription, setEmailDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoadingQuestions(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/questions/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      alert("Failed to fetch questions");
    } finally {
      setLoadingQuestions(false);
    }
  }, [job]);

  useEffect(() => {
    if (!job) return;
    fetchQuestions();
  }, [job, fetchQuestions]);

  const handleAddQuestion = () => setShowCreateQuestion(true);

  const handleQuestionCreated = () => {
    setShowCreateQuestion(false);
    fetchQuestions();
  };

  const handleSendEmail = async () => {
    if (questions.length === 0) {
      alert("Create at least one coding question before sending test links.");
      return;
    }

    if (!emailDescription || !startTime || !endTime) {
      alert("Please fill in description, start time, and end time.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      alert("End time must be after start time.");
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/email/send-test-email/${job._id}`,
        {
          email: email.trim() || undefined,
          description: emailDescription,
          jobTitle: job.title,
          startTime,
          endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Email sent successfully!");
    } catch (err) {
      console.error("Error sending email:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to send email.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalizeTest = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/job/${job._id}/stageChange`,
        { stage: "evaluation" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Test finalized and stage updated!");
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error("Error finalizing test:", err);
      alert(err.response?.data?.message || "Failed to finalize test.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* questions */}
      <section className={`${card} p-5`}>
        <h4 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <FileQuestion className="h-4 w-4 text-blue-500" />
          Coding Questions
        </h4>
        <p className="mb-4 text-xs text-slate-400">
          Students will solve these in the timed test editor.
        </p>

        {loadingQuestions ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading questions…
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <FileQuestion className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">No questions added yet.</p>
            <button type="button" onClick={handleAddQuestion} className={`${btn.success} mt-4`}>
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>
        ) : (
          <>
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {questions.map((q, index) => (
                <li
                  key={q._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                    {index + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                    {q.title}
                  </p>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                </li>
              ))}
            </ul>
            <button type="button" onClick={handleAddQuestion} className={`${btn.outline} mt-4`}>
              <Plus className="h-4 w-4" />
              Add More Questions
            </button>
          </>
        )}

        {showCreateQuestion && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <CreateQuestion jobId={job._id} onQuestionCreated={handleQuestionCreated} />
          </div>
        )}
      </section>

      {/* send test link */}
      <section className={`${card} p-5`}>
        <h4 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <Mail className="h-4 w-4 text-violet-500" />
          Send Test Link
        </h4>
        <p className="mb-4 text-xs text-slate-400">
          Email the timed test to a candidate (or let it go to everyone).
        </p>

        <div className="space-y-4">
          <div>
            <label className={label}>Student email (optional)</label>
            <input
              type="email"
              placeholder="Leave blank to send to all shortlisted"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>

          <div>
            <label className={label}>Test description</label>
            <textarea
              placeholder="e.g. Solve the 3 problems in 60 minutes. Good luck!"
              value={emailDescription}
              onChange={(e) => setEmailDescription(e.target.value)}
              rows={3}
              className={`${input} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={`${label} flex items-center gap-1`}>
                <Clock className="h-3.5 w-3.5" /> Start time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={`${label} flex items-center gap-1`}>
                <Clock className="h-3.5 w-3.5" /> End time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={input}
              />
            </div>
          </div>

          <button
            onClick={handleSendEmail}
            disabled={processing}
            className={`${btn.primary} w-full`}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Test Invite
          </button>
        </div>
      </section>

      {/* finalize */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4 lg:col-span-2">
        <div>
          <p className="text-sm font-bold text-slate-700">Finalize the test round?</p>
          <p className="text-xs text-slate-500">
            Moves the job to <span className="font-semibold text-rose-600">Test Evaluation</span> and
            locks in the current question set.
          </p>
        </div>
        <button
          onClick={handleFinalizeTest}
          disabled={processing}
          className={btn.danger}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Flag className="h-4 w-4" />
          )}
          Finalize Test
        </button>
      </div>
    </div>
  );
};

export default CodingTest;