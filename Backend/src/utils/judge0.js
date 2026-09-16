const axios = require("axios");

const JUDGE0_HOST = process.env.JUDGE0_HOST; // e.g., judge0-ce.p.rapidapi.com
const JUDGE0_KEY = process.env.JUDGE0_KEY;

async function runSingleTest(sourceCode, languageId, stdin) {
  // Use the configured instance URL; fall back to the RapidAPI-style URL
  // only when JUDGE0_URL is not set.
  const JUDGE0_BASE = process.env.JUDGE0_URL || `https://${JUDGE0_HOST}`;
  const url = `${JUDGE0_BASE}/submissions?base64_encoded=false&wait=true`;
  const payload = {
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin
  };

  // RapidAPI-hosted Judge0 requires these headers; self-hosted Judge0 CE
  // ignores them, so only send them when a host/key are configured.
  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_HOST && JUDGE0_KEY) {
    headers["X-RapidAPI-Host"] = JUDGE0_HOST;
    headers["X-RapidAPI-Key"] = JUDGE0_KEY;
  }

  const res = await axios.post(url, payload, { headers, timeout: 120000 });
  return res.data; // contains stdout, stderr, status
}

module.exports = { runSingleTest };