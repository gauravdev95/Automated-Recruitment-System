import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { jwtDecode } from "jwt-decode";
import API from "../../apiConfig";

const languages = [
  { name: "JavaScript", id: 63, editorLanguage: "javascript", starter: "// JS\n" },
  { name: "Python 3", id: 71, editorLanguage: "python", starter: "# Python\n" },
];

const CodeEditor = () => {
  const { jobId, studentId, token } = useParams();
  const { state } = useLocation();
  let decodedToken = {};
  try {
    decodedToken = token ? jwtDecode(token) : {};
  } catch (err) {
    decodedToken = {};
  }
  const endTime = state?.endTime || decodedToken.endTime;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [language, setLanguage] = useState(languages[0]);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (auto = false) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const submissions = questions.map((question) =>
        axios.post(`${API}/questions/submit`, {
          userId: studentId,
          jobId,
          questionId: question._id,
          code: answers[question._id] || question.starterCode || language.starter,
          languageId: language.id,
          token,
        })
      );

      await Promise.all(submissions);

      if (!auto) alert("Test submitted!");
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Failed to submit test.");
    } finally {
      setSubmitting(false);
    }
  };

  // Keep the latest handleSubmit available to the timer without restarting it
  const handleSubmitRef = useRef();
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // Countdown timer — auto-submits when time runs out
  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const diff = Math.floor((new Date(endTime) - new Date()) / 1000);
      if (diff <= 0) {
        clearInterval(timer);
        handleSubmitRef.current(true);
        setTimeLeft(0);
        return;
      }
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${API}/questions/${jobId}`);
        const formatted = res.data.map((q) => ({
          ...q,
          testCases: q.testCases || q.testcases || [],
        }));
        setQuestions(formatted);
      } catch (err) {
        console.error("Error loading questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [jobId]);

  const currentQ = questions[currentIndex];

  const runCode = async () => {
    if (!currentQ || runLoading) return;

    try {
      setRunLoading(true);
      setResults([]);

      const res = await axios.post(`${API}/questions/run`, {
        userId: studentId,
        jobId,
        questionId: currentQ._id,
        code: answers[currentQ._id] || currentQ.starterCode || language.starter,
        languageId: language.id,
        token,
      });

      setResults(res.data.results || []);
    } catch (err) {
      console.error("Error running code:", err);
      alert(err.response?.data?.error || "Failed to run code.");
    } finally {
      setRunLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!currentQ) return <p>No questions available for this test.</p>;

  return (
    <div className="flex h-screen">
      {/* LEFT */}
      <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
        <h2 className="text-2xl font-bold">{currentQ.title}</h2>
        <p className="mt-4">{currentQ.description}</p>

        <h3 className="mt-6 font-semibold">Test Cases</h3>
        {currentQ.testCases.map((tc, i) => (
          <div key={i} className="bg-gray-100 p-2 mt-2 text-sm">
            <p><b>Input:</b> {tc.input}</p>
            <p><b>Output:</b> {tc.output}</p>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="w-1/2 flex flex-col">
        {/* Top */}
        <div className="p-3 bg-gray-100 flex items-center justify-between gap-3">
          <select
            value={language.name}
            onChange={(e) =>
              setLanguage(languages.find(l => l.name === e.target.value))
            }
          >
            {languages.map(l => <option key={l.id}>{l.name}</option>)}
          </select>

          <span className="text-red-600 font-bold">
            {timeLeft == null
              ? "--:--"
              : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
          </span>
        </div>

        <div className="px-3 py-2 bg-white border-b flex flex-wrap gap-2">
          {questions.map((question, index) => (
            <button
              key={question._id}
              onClick={() => {
                setCurrentIndex(index);
                setResults([]);
              }}
              className={`px-3 py-1 text-sm border rounded ${
                currentIndex === index
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Q{index + 1}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="h-[55%]">
          <Editor
            theme="vs-dark"
            language={language.editorLanguage}
            value={answers[currentQ._id] || currentQ.starterCode || language.starter}
            onChange={(v) =>
              setAnswers({ ...answers, [currentQ._id]: v })
            }
          />
        </div>

        {/* Output */}
        <div className="h-[25%] bg-black text-white p-3 overflow-auto">
          <h4 className="font-semibold mb-2">Output</h4>
          {results.length === 0 ? (
            <p className="text-gray-400">Run code to see output</p>
          ) : (
            results.map((r, i) => (
              <div key={i} className={r.status === "PASSED" ? "text-green-400" : "text-red-400"}>
                Test {i + 1}: {r.status === "PASSED" ? "Passed" : "Failed"}
                <br />
                Expected: {r.expectedOutput}
                <br />
                Actual: {r.actualOutput}
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="p-3 flex justify-between bg-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCurrentIndex((idx) => Math.max(0, idx - 1));
                setResults([]);
              }}
              disabled={currentIndex === 0}
              className="bg-gray-600 px-4 py-2 text-white disabled:bg-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => {
                setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1));
                setResults([]);
              }}
              disabled={currentIndex === questions.length - 1}
              className="bg-gray-600 px-4 py-2 text-white disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
          <button
            onClick={runCode}
            disabled={runLoading}
            className="bg-yellow-500 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {runLoading ? "Running..." : "Run Code"}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="bg-green-600 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
