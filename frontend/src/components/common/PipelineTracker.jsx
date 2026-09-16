import { Check, Sparkles } from "lucide-react";
import { card } from "../../pages/Hr/stages/StageUI";

/**
 * PipelineTracker — shared horizontal pipeline for HR and student dashboards.
 *
 * Rows:
 *   ●═══════●═══════●═══════●
 *   label  label  label  label
 *
 * The line runs through every circle's centre and fills up to the current stage.
 */

const keyframes = `
@keyframes tf-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(99,102,241,.45); }
  70%  { box-shadow: 0 0 0 14px rgba(99,102,241,0); }
  100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
}
@keyframes tf-pulse-rose {
  0%   { box-shadow: 0 0 0 0 rgba(244,63,94,.45); }
  70%  { box-shadow: 0 0 0 14px rgba(244,63,94,0); }
  100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); }
}
@keyframes tf-fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/**
 * @param {Array}  stages     [{ key, label, tagline, icon }]
 * @param {string} currentKey active stage key
 * @param {string} title       card header title
 * @param {string} [subtitle]  small line under the title
 * @param {string} [terminalKey] a terminal key (e.g. "rejected") rendered in red
 */
const PipelineTracker = ({
  stages,
  currentKey,
  title = "Recruitment Pipeline",
  subtitle,
  terminalKey,
}) => {
  const currentIndex = currentKey
    ? stages.findIndex((s) => s.key === currentKey)
    : -1;
  const isTerminal = terminalKey && currentKey === terminalKey;

  return (
    <div
      className={`${card} relative overflow-hidden p-6 md:p-8`}
      style={{ animation: "tf-fadeUp .45s ease-out both" }}
    >
      <style>{keyframes}</style>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-100/70 blur-3xl" />

      {/* header */}
      <div className="relative mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="truncate">{title}</span>
          </h3>
          {subtitle && (
            <p className="mt-1 truncate text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        {isTerminal ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-200">
            Not in pipeline
          </span>
        ) : (
          <span className="hidden shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200 sm:inline-flex">
            Step {currentIndex + 1} of {stages.length}
          </span>
        )}
      </div>

      {/* track */}
      <div className="relative mx-auto max-w-3xl px-1 py-2 sm:px-2">
        {/* row 1 : circles with the line running through their centres */}
        <div className="flex items-center">
          {stages.map((stage, index) => {
            let status = "pending";
            if (index < currentIndex) status = "completed";
            else if (index === currentIndex) status = currentKey === terminalKey ? "rejected" : "current";

            const Icon = stage.icon;

            const circleCls =
              status === "completed"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-200"
                : status === "current"
                ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-indigo-300"
                : status === "rejected"
                ? "bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-300"
                : "bg-white border-slate-300 text-slate-400";

            return (
              <div
                key={stage.key}
                className="relative flex flex-1 items-center justify-center"
              >
                {/* left connection — fills when the previous stage is passed */}
                {index > 0 && (
                  <div className="absolute right-1/2 top-1/2 z-0 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                      style={{
                        width: index <= currentIndex ? "100%" : "0%",
                        boxShadow:
                          index <= currentIndex
                            ? "0 0 8px rgba(99, 102, 241, .45)"
                            : "none",
                      }}
                    />
                  </div>
                )}

                {/* right connection — fills only after this stage is passed */}
                {index < stages.length - 1 && (
                  <div className="absolute left-1/2 top-1/2 z-0 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                      style={{
                        width: index < currentIndex ? "100%" : "0%",
                        boxShadow:
                          index < currentIndex
                            ? "0 0 8px rgba(99, 102, 241, .45)"
                            : "none",
                      }}
                    />
                  </div>
                )}

                {/* circle sits above the line */}
                <div
                  className="group relative z-10 h-12 w-12 shrink-0"
                  style={{ animation: `tf-fadeUp .5s ease-out both`, animationDelay: `${index * 90}ms` }}
                >
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-full border-2 shadow-md transition-all duration-300 group-hover:scale-110 ${circleCls} ${
                      status === "current"
                        ? "ring-8 ring-indigo-100 animate-[tf-pulse_2.2s_ease-out_infinite]"
                        : status === "rejected"
                        ? "ring-8 ring-rose-100 animate-[tf-pulse-rose_2.2s_ease-out_infinite]"
                        : "group-hover:shadow-lg"
                    }`}
                  >
                    {status === "completed" ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <Icon
                        className={`h-5 w-5 ${
                          status === "pending" ? "text-slate-400" : "text-white"
                        }`}
                      />
                    )}
                  </div>

                  {/* tooltip */}
                  <div className="pointer-events-none absolute -top-2 left-1/2 z-20 w-max -translate-x-1/2 -translate-y-full scale-90 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                    {stage.tagline}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* row 2 : labels aligned under each circle */}
        <div className="mt-3 flex">
          {stages.map((stage, index) => {
            const status =
              index < currentIndex
                ? "completed"
                : index === currentIndex
                ? currentKey === terminalKey
                  ? "rejected"
                  : "current"
                : "pending";

            return (
              <div
                key={`label-${stage.key}`}
                className="flex-1 text-center"
                style={{ animation: `tf-fadeUp .5s ease-out both`, animationDelay: `${index * 90}ms` }}
              >
                <p
                  className={`text-xs font-bold leading-tight sm:text-[13px] ${
                    status === "pending"
                      ? "text-slate-400"
                      : status === "rejected"
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {stage.label}
                </p>
                <p
                  className={`mt-1 hidden text-[11px] sm:block ${
                    status === "pending" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {stage.tagline}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelineTracker;