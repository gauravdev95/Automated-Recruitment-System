/**
 * StageUI — shared design tokens & helpers for the HR pipeline screens.
 * One style language across every stage so the dashboard feels like one product.
 */

// ── buttons ─────────────────────────────────────────────────────────
export const btn = {
  primary:
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:pointer-events-none disabled:opacity-50",

  success:
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:pointer-events-none disabled:opacity-50",

  danger:
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-rose-600 hover:to-red-700 hover:shadow-xl hover:shadow-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:pointer-events-none disabled:opacity-50",

  outline:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30",

  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800 focus:outline-none",
};

// ── form controls ───────────────────────────────────────────────────
export const input =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export const label =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

// ── card / layout ───────────────────────────────────────────────────
export const card =
  "rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md";

export const sectionTitle =
  "flex items-center gap-2 text-lg font-bold text-slate-800";

// ── score pill ──────────────────────────────────────────────────────
const scoreTone = (score) => {
  const s = Number(score) || 0;
  if (s >= 75)
    return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  if (s >= 60)
    return "bg-lime-100 text-lime-700 ring-lime-200";
  if (s >= 40)
    return "bg-amber-100 text-amber-700 ring-amber-200";
  return "bg-rose-100 text-rose-600 ring-rose-200";
};

export const scorePill = (score) =>
  `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${scoreTone(
    score
  )}`;

// a colored avatar dot used on sidebar job cards
const stageDotTone = {
  resume: "bg-indigo-500",
  profile: "bg-violet-500",
  coding: "bg-blue-500",
  evaluation: "bg-emerald-500",
  interview: "bg-amber-500",
};

export const stageDot = (stage) => stageDotTone[stage] || "bg-slate-400";

// initials shown in candidate avatars
export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// deterministic warm gradient per name so avatars look stable
export const avatarGradient = (name = "") => {
  const palettes = [
    "from-indigo-500 to-violet-500",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-500",
    "from-sky-500 to-blue-600",
    "from-fuchsia-500 to-pink-500",
    "from-rose-500 to-red-500",
  ];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return palettes[h % palettes.length];
};