/**
 * localJudge.js — self-contained fallback code executor.
 *
 * When the configured Judge0 instance cannot be reached (e.g. a hosted deploy
 * without a RapidAPI subscription), the grading endpoints fall back to this
 * lightweight runner so the coding-test demo still works. It executes
 * JavaScript with Node and Python with a temp file, mirroring the behavior of
 * the local Judge0 stub, and returns Judge0-shaped results so the existing
 * grading code path needs no changes.
 *
 * Supported language ids: 63 (JavaScript / Node), 71 (Python).
 * Anything else returns a Compilation Error result with a clear message.
 *
 * Spawn is used with explicit stdin.write() + end() because execFile's
 * `input` option leaves stdin open for scripts that read fd 0, which hangs
 * the child until the timeout.
 *
 * NOTE: this is an in-process executor aimed at a demo/submission. Long or
 * infinite loops are bounded by a timeout. For production-grade isolation,
 * run Judge0 CE (Docker) and point JUDGE0_URL at it instead.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const TIMEOUT_MS = 10000;

const PYTHON_BIN = process.platform === "win32" ? "python" : "python3";

/**
 * Spawn a command, feed stdin, and collect stdout/stderr until close.
 * @param {string[]} args
 * @param {string}  stdinData
 * @param {number}  timeout  ms
 * @returns {Promise<{kind:"done"|"tle"|"error", code:number|null, out:string, err:string}>}
 */
function runProcess(args, stdinData, timeout) {
  return new Promise((resolve) => {
    let out = "";
    let err = "";
    let settled = false;

    let kid;
    try {
      kid = spawn(args[0], args.slice(1));
    } catch (e) {
      return resolve({ kind: "error", code: null, out: "", err: String(e.message || e) });
    }

    const timer = setTimeout(() => {
      try { kid.kill("SIGKILL"); } catch (_) { /* gone */ }
      if (!settled) { settled = true; resolve({ kind: "tle", code: null, out, err }); }
    }, timeout);

    kid.stdout.on("data", (d) => { out += d; });
    kid.stderr.on("data", (d) => { err += d; });
    kid.on("error", (e) => {
      clearTimeout(timer);
      if (!settled) { settled = true; resolve({ kind: "error", code: null, out, err: String(e.message || e) }); }
    });
    kid.on("close", (code) => {
      clearTimeout(timer);
      if (!settled) { settled = true; resolve({ kind: "done", code, out, err }); }
    });

    // Feed stdin then close it so the child reaches EOF and can exit.
    try {
      kid.stdin.write(String(stdinData ?? ""));
      kid.stdin.end();
    } catch (_) { /* stdin already closed */ }
  });
}

const LANGUAGES = {
  63: {
    name: "JavaScript (Node)",
    run: (source, stdin) => {
      const f = path.join(
        os.tmpdir(),
        `tf_judge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.js`
      );
      fs.writeFileSync(f, source);
      return runProcess(["node", f], stdin, TIMEOUT_MS).finally(() => {
        try { fs.unlinkSync(f); } catch (_) { /* already gone */ }
      });
    },
  },
  71: {
    name: "Python",
    run: (source, stdin) => {
      const f = path.join(
        os.tmpdir(),
        `tf_judge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.py`
      );
      fs.writeFileSync(f, source);
      return runProcess([PYTHON_BIN, f], stdin, TIMEOUT_MS).finally(() => {
        try { fs.unlinkSync(f); } catch (_) { /* already gone */ }
      });
    },
  },
};

/**
 * Run source code locally and return a Judge0-shaped result object.
 * @param {string} sourceCode
 * @param {number} languageId
 * @param {string} stdin
 * @returns {Promise<{stdout, stderr, compile_output, status, time, memory}>}
 */
async function executeLocally(sourceCode, languageId, stdin = "") {
  const lang = LANGUAGES[languageId];
  if (!lang) {
    return {
      stdout: "",
      stderr: "",
      compile_output: `Unsupported language_id ${languageId} for local fallback (supported: ${Object.keys(LANGUAGES).join(", ")})`,
      status: { id: 11, description: "Compilation Error" },
      time: "0.000",
      memory: 0,
    };
  }

  let res;
  try {
    res = await lang.run(String(sourceCode), String(stdin ?? ""));
  } catch (e) {
    return {
      stdout: "",
      stderr: "",
      compile_output: `Local executor failed: ${e.message || e}`,
      status: { id: 13, description: "Internal Error" },
      time: "0.000",
      memory: 0,
    };
  }

  if (res.kind === "tle") {
    return {
      stdout: res.out,
      stderr: res.err,
      compile_output: "",
      status: { id: 5, description: "Time Limit Exceeded" },
      time: `${(TIMEOUT_MS / 1000).toFixed(3)}`,
      memory: 0,
    };
  }

  if (res.kind === "error") {
    return {
      stdout: res.out,
      stderr: res.err,
      compile_output: `Could not launch executor (${res.err}). On Linux/container builds python3 must be installed.`,
      status: { id: 13, description: "Internal Error" },
      time: "0.000",
      memory: 0,
    };
  }

  if (res.code !== 0) {
    return {
      stdout: res.out,
      stderr: res.err,
      compile_output: "",
      status: { id: 6, description: "Runtime Error (NZEC)" },
      time: "0.015",
      memory: 262144,
    };
  }

  return {
    stdout: res.out,
    stderr: res.err,
    compile_output: "",
    status: { id: 3, description: "Accepted" },
    time: "0.015",
    memory: 262144,
  };
}

module.exports = { executeLocally, SUPPORTED_LANGUAGE_IDS: Object.keys(LANGUAGES) };