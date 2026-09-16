import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  X,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Banknote,
  CalendarDays,
  Sparkles,
  Filter,
  Loader2,
} from "lucide-react";

import BASE_URL from "../../apiConfig";
import { initials, avatarGradient } from "../Hr/stages/StageUI";

const tokenize = (str = "") =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/* weight each term against a job and sum the hits */
const scoreJob = (job, terms) => {
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  const company = (job.company || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  const level = (job.experienceLevel || "").toLowerCase();
  const skills = (job.skills || []).map((s) => String(s).toLowerCase());

  let score = 0;
  for (const t of terms) {
    if (title.includes(t)) score += 4;
    if (skills.some((s) => s.includes(t) || t.includes(s))) score += 3;
    if (company.includes(t)) score += 2;
    if (level.includes(t)) score += 2;
    if (loc.includes(t)) score += 1.5;
    if (desc.includes(t)) score += 1;
  }
  return score;
};

const getTimeElapsed = (dateString) => {
  if (!dateString) return "Recently posted";
  const diff = Math.floor((new Date() - new Date(dateString)) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
};

const suggestions = ["React", "Python", "Backend", "Design", "Data", "Android"];

const PostJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [daysFilter, setDaysFilter] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const navigate = useNavigate();

  const parseJwt = (token) => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setRole(parseJwt(token)?.role || "");
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/job/alljob`);
      setJobs(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  /* distinct values for the filter dropdowns */
  const locations = useMemo(
    () => [...new Set(jobs.map((j) => j.location).filter(Boolean))],
    [jobs]
  );

  /* relevance-ranked, filtered, sorted list */
  const results = useMemo(() => {
    const terms = tokenize(query);
    let list = jobs;

    if (daysFilter) {
      const cutoff = Date.now() - Number(daysFilter) * 86400000;
      list = list.filter((j) => j.createdAt && new Date(j.createdAt) >= cutoff);
    }
    if (typeFilter) list = list.filter((j) => j.employmentType === typeFilter);
    if (levelFilter) list = list.filter((j) => j.experienceLevel === levelFilter);
    if (locationFilter) list = list.filter((j) => j.location === locationFilter);

    if (terms.length) {
      list = list
        .map((j) => ({ job: j, score: scoreJob(j, terms) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);
      if (sortBy === "relevance") {
        // already ranked by score; tie-break by newest
        list.sort(
          (a, b) =>
            b.score - a.score ||
            new Date(b.job.createdAt) - new Date(a.job.createdAt)
        );
      }
      const max = list[0]?.score || 1;
      return list.map((x) => ({ ...x.job, _match: Math.round((x.score / max) * 100) }));
    }

    switch (sortBy) {
      case "new":
        list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "salary-hi":
        list = [...list].sort((a, b) => (b.salaryRange?.min || 0) - (a.salaryRange?.min || 0));
        break;
      case "salary-lo":
        list = [...list].sort((a, b) => (a.salaryRange?.min || 0) - (b.salaryRange?.min || 0));
        break;
      default:
        list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [jobs, query, typeFilter, levelFilter, locationFilter, daysFilter, sortBy]);

  const isSearching = tokenize(query).length > 0;
  const activeFilterCount =
    [typeFilter, levelFilter, locationFilter, daysFilter].filter(Boolean).length;

  const clearAll = () => {
    setQuery("");
    setTypeFilter("");
    setLevelFilter("");
    setLocationFilter("");
    setDaysFilter("");
    setSortBy("relevance");
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Loading jobs…
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <p className="text-lg font-semibold text-rose-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/40 pb-14 pt-24">
      {/* ── hero + search ─────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Find your next role
          </h1>
          <p className="mt-2 text-sm text-indigo-100 sm:text-base">
            Search by role, skill or company — we match the best fits for you.
          </p>

          {/* search bar */}
          <div className="mt-6 flex max-w-2xl items-stretch gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-indigo-900/20">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “React developer”, “backend”, “data analyst”…"
                className="w-full rounded-xl bg-transparent py-2.5 pl-11 pr-9 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <span className="hidden items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-bold text-white sm:inline-flex">
              Search
            </span>
          </div>

          {!query && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                Popular:
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── filters + count ───────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <p className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">{results.length}</span>{" "}
              job{results.length === 1 ? "" : "s"}
              {isSearching && (
                <span className="text-slate-400"> · matched for “{query}”</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex">
              <Filter className="h-3.5 w-3.5" /> Filter
            </span>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Job type · All</option>
              {["Full-Time", "Part-Time", "Internship", "Contract"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Experience · All</option>
              {["Fresher", "Junior", "Mid-Level", "Senior", "Lead"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Location · All</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="relevance">Sort · {isSearching ? "Best match" : "Newest"}</option>
              <option value="new">Newest first</option>
              <option value="salary-hi">Salary · high to low</option>
              <option value="salary-lo">Salary · low to high</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* posted-within filter bar */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" /> Posted in
          </span>
          {["7", "14", "30"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDaysFilter(daysFilter === d ? "" : d)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                daysFilter === d
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-indigo-300 hover:text-indigo-600"
              }`}
            >
              {d} days
            </button>
          ))}
          {daysFilter && (
            <button
              type="button"
              onClick={() => setDaysFilter("")}
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-400 transition-colors hover:text-rose-500"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── job cards ──────────────────────────────────────── */}
        <div className="mt-6 space-y-4">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
              <p className="text-base font-semibold text-slate-600">
                No jobs match your search
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try a different role, skill or remove a filter.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Sparkles className="h-4 w-4" />
                Clear search & filters
              </button>
            </div>
          ) : (
            results.map((job, i) => (
              <article
                key={job._id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    {/* company avatar */}
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-md ${avatarGradient(
                        job.company
                      )}`}
                    >
                      {initials(job.company)}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {job.title}
                        </h3>
                        {isSearching && job._match >= 60 && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 ring-1 ring-emerald-200">
                            Strong match
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                        {job.company}
                      </p>

                      {/* meta */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.experienceLevel || "Fresher"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {job.employmentType || "Full-Time"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="font-semibold text-emerald-600">
                            ₹{job.salaryRange?.min}–{job.salaryRange?.max} LPA
                          </span>
                        </span>
                      </div>

                      {job.description && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {/* skills */}
                      {job.skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              onClick={() => setQuery(skill)}
                              className="cursor-pointer rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 ring-1 ring-indigo-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:text-white"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* right rail */}
                  <div className="flex shrink-0 flex-col items-end gap-3">
                    {isSearching ? (
                      <div className="w-28 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Match
                        </p>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${job._match}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-bold text-emerald-600">
                          {job._match}%
                        </p>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        <CalendarDays className="h-3 w-3" />
                        {getTimeElapsed(job.createdAt)}
                      </span>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="rounded-lg border border-indigo-200 bg-white px-4 py-1.5 text-sm font-semibold text-indigo-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50"
                      >
                        View
                      </button>

                      {role !== "hr" && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/student/apply/${job._id}`, { state: job })
                          }
                          className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* expanded matched context */}
                {isSearching && job._match >= 60 && job.skills?.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    Top skills:{" "}
                    <span className="font-semibold text-slate-600">
                      {job.skills.slice(0, 3).join(" · ")}
                    </span>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJob;