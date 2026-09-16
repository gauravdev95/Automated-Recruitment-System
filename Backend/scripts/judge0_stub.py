"""
Judge0 stub server for local TalentForge testing.
Handles:
  POST /submissions?wait=true  → execute code, return result directly
  POST /submissions            → queue (return token, store for polling)
  GET  /submissions/:token     → return result for a queued submission
  GET  /languages              → basic info
Listens on 127.0.0.1:2358 (same as JUDGE0_URL in .env)
"""

import http.server
import json
import subprocess
import tempfile
import os
import uuid
import sys
from urllib.parse import urlparse, parse_qs

# status.id values matching Judge0's API
STATUS_ACCEPTED   = {"id": 3,  "description": "Accepted"}
STATUS_COMPILATION = {"id": 11, "description": "Compilation Error"}
STATUS_RUNTIME    = {"id": 6,  "description": "Runtime Error (NZEC)"}
STATUS_TLE        = {"id": 5,  "description": "Time Limit Exceeded"}
STATUS_INTERNAL   = {"id": 13, "description": "Internal Error"}

# language_id → (extension, command)
LANGUAGES = {
    71:  (".py",  ["python"]),
    63:  (".js",  ["node"]),
    50:  (".c",   ["gcc", "-o", "_out", "-std=c11"]),
    54:  (".cpp", ["g++", "-o", "_out", "-std=c++17"]),
    62:  (".java", ["javac"]),  # special handling
    78:  (".kt",  ["kotlinc"]),
    74:  (".ts",  ["npx", "ts-node"]),
}

# In-memory store of pending results (for non-wait polls)
_store = {}


def _execute(source_code: str, language_id: int, stdin: str, timeout: int = 30) -> dict:
    """Execute source_code in the given language and return Judge0-style result."""
    lang = LANGUAGES.get(language_id)
    if not lang:
        return {
            "stdout": "",
            "stderr": "",
            "compile_output": f"Unsupported language_id: {language_id}",
            "status": STATUS_COMPILATION,
            "time": "0.000",
            "memory": 0,
        }

    ext, cmd_base = lang
    stdout = stderr = compile_out = ""
    status = STATUS_ACCEPTED
    exit_code = 0

    try:
        # For compiled languages, compile first
        if language_id in (50, 54):
            with tempfile.TemporaryDirectory() as tmpdir:
                src = os.path.join(tmpdir, f"prog{ext}")
                out = os.path.join(tmpdir, "_out")
                with open(src, "w") as f:
                    f.write(source_code)
                comp = subprocess.run(
                    cmd_base[:-1] + ["-o", out, src],
                    capture_output=True, timeout=15
                )
                if comp.returncode != 0:
                    return {
                        "stdout": "",
                        "stderr": "",
                        "compile_output": comp.stderr.decode(errors="replace"),
                        "status": STATUS_COMPILATION,
                        "time": "0.000",
                        "memory": 0,
                    }
                # run compiled
                res = subprocess.run(
                    [out], input=stdin.encode(errors="replace"),
                    capture_output=True, timeout=timeout
                )

        elif language_id == 71:
            with tempfile.NamedTemporaryFile(mode="w", suffix=ext, delete=False) as f:
                f.write(source_code)
                tmpfile = f.name
            try:
                res = subprocess.run(
                    cmd_base + [tmpfile],
                    input=stdin.encode(errors="replace"),
                    capture_output=True, timeout=timeout
                )
                exit_code = res.returncode
                stdout = res.stdout.decode(errors="replace")
                stderr = res.stderr.decode(errors="replace")
            finally:
                os.unlink(tmpfile)
            res = None  # already captured

        elif language_id == 63:
            res = subprocess.run(
                cmd_base + ["-e", source_code],
                input=stdin.encode(errors="replace"),
                capture_output=True, timeout=timeout
            )

        else:
            # Generic: write to file and invoke
            with tempfile.NamedTemporaryFile(mode="w", suffix=ext, delete=False) as f:
                f.write(source_code)
                tmpfile = f.name
            try:
                res = subprocess.run(
                    cmd_base + [tmpfile],
                    input=stdin.encode(errors="replace"),
                    capture_output=True, timeout=timeout
                )
            finally:
                os.unlink(tmpfile)

        # For non-python, res is set by the subprocess.run above
        if language_id != 71 and res is not None:
            exit_code = res.returncode
            stdout = res.stdout.decode(errors="replace")
            stderr = res.stderr.decode(errors="replace")

    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "",
            "compile_output": "",
            "status": STATUS_TLE,
            "time": f"{timeout}.000",
            "memory": 0,
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": "",
            "compile_output": str(e),
            "status": STATUS_INTERNAL,
            "time": "0.000",
            "memory": 0,
        }

    if exit_code != 0 and not stdout.strip():
        # Likely runtime error (non-zero exit with no stdout)
        # Distinguish compile vs runtime based on language
        if language_id in (71, 63) and ("SyntaxError" in stderr or "ReferenceError" in stderr or "NameError" in stderr or "TypeError" in stderr or "IndentationError" in stderr):
            status = STATUS_RUNTIME
        elif language_id in (50, 54) and ("error:" in stderr.lower()):
            status = STATUS_COMPILATION
        elif exit_code != 0 and stderr.strip():
            status = STATUS_RUNTIME
        else:
            status = STATUS_RUNTIME

    return {
        "stdout": stdout,
        "stderr": stderr,
        "compile_output": compile_out,
        "status": status if exit_code == 0 else STATUS_RUNTIME,
        "time": "0.015",
        "memory": 262144,
    }


class Judge0Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/languages":
            self._json_response(200, [
                {"id": 71, "name": "Python (3.8.10)", "is_archived": False},
                {"id": 63, "name": "JavaScript (Node.js 12.14.0)", "is_archived": False},
                {"id": 62, "name": "Java (OpenJDK 13.0.1)", "is_archived": False},
                {"id": 54, "name": "C++ (GCC 9.2.0)", "is_archived": False},
                {"id": 50,  "name": "C (GCC 9.2.0)", "is_archived": False},
            ])
            return

        # GET /submissions/:token
        parts = path.split("/")
        if len(parts) == 3 and parts[1] == "submissions":
            token = parts[2]
            if token in _store:
                result = _store.pop(token)
                self._json_response(200, result)
            else:
                self._json_response(200, {"status": STATUS_ACCEPTED})
            return

        self._json_response(404, {"error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/submissions":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            source = body.get("source_code", "")
            lang_id = body.get("language_id", 71)
            stdin = body.get("stdin", "")
            wait = parse_qs(parsed.query).get("wait", ["false"])[0].lower() == "true"

            result = _execute(source, lang_id, stdin)

            if wait:
                self._json_response(200, result)
            else:
                tok = str(uuid.uuid4())
                _store[tok] = result
                self._json_response(201, {
                    "token": tok,
                    "status": {"id": 1, "description": "In Queue"},
                })
            return

        self._json_response(404, {"error": "Not found"})

    def _json_response(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # quiet log: only errors
        if args and str(args[0]).startswith("2"):
            return
        sys.stderr.write(f"[judge0-stub] {fmt % args}\n")


if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", 2358), Judge0Handler)
    print("Judge0 stub running on http://127.0.0.1:2358", flush=True)
    server.serve_forever()
