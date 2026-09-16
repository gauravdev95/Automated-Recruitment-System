import axios from "axios";
import { useState } from "react";
import API from "../../apiConfig";

export default function CreateQuestion({ jobId, onQuestionCreated }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [marks, setMarks] = useState(100);
  const [testCases, setTestCases] = useState([{ input: "", output: "", hidden: false }]);

  const addTC = () =>
    setTestCases([...testCases, { input: "", output: "", hidden: false }]);

  const updateTC = (i, key, val) => {
    const copy = [...testCases];
    copy[i][key] = val;
    setTestCases(copy);
  };

  const handleSubmit = async () => {
  if (!jobId) return alert("JobId missing!");
  if (!title.trim() || !desc.trim()) return alert("Please add a title and description.");
  if (testCases.some((tc) => tc.output.trim() === "")) {
    return alert("Each test case must have an expected output.");
  }

  const payload = {
    jobId,
    title: title.trim(),
    description: desc.trim(),
    marks: Number(marks) || 100,
    testCases,
  };

  try {
    const token = localStorage.getItem("token");
    // Step 1: Create the question
    const res = await axios.post(
    `${API}/questions/create`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Question created: " + res.data._id);
    setTitle("");
    setDesc("");
    setMarks(100);
    setTestCases([{ input: "", output: "", hidden: false }]);
    if (onQuestionCreated) onQuestionCreated(res.data);
  } catch (err) {
    alert("Error: " + (err.response?.data?.error || err.message));
  }
};


  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">HR - Create Question</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Job ID</label>
        <input
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100"
          value={jobId || ""}
          readOnly
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-28 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Marks</label>
        <input
          type="number"
          className="w-32 border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
        />
      </div>

      <h4 className="text-lg font-semibold text-gray-800 mb-2">Test Cases</h4>
      {testCases.map((tc, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50 shadow-sm">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600">Input</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={tc.input}
              onChange={(e) => updateTC(i, "input", e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600">Output</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={tc.output}
              onChange={(e) => updateTC(i, "output", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tc.hidden}
              onChange={(e) => updateTC(i, "hidden", e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <label className="text-sm text-gray-700">Hidden</label>
          </div>
        </div>
      ))}

      <button
        onClick={addTC}
        className="bg-green-500 text-white px-4 py-2 rounded-xl shadow hover:bg-green-600 transition mb-4"
      >
        Add Test Case
      </button>

      <div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Create Question
        </button>
      </div>
    </div>
  );
}
