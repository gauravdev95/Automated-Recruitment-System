import { useState } from "react";
import { Link } from "react-router-dom";
import { Link as LinkS } from "react-scroll";
import { Menu, X, LogIn, UserPlus, Sparkles } from "lucide-react";

const underline = (navCls) =>
  `absolute -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ${
    navCls ? "w-full" : "w-0 group-hover:w-full"
  }`;

const MainNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = [
    { to: "/", label: "Home", scroll: false },
    { to: "about", label: "About", scroll: true },
    { to: "services", label: "Services", scroll: true },
    { to: "students", label: "Categories", scroll: true },
    { to: "contact", label: "Contact", scroll: true },
  ];

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-xl border-b border-slate-200/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-10">
        {/* logo */}
        <Link to="/" className="group flex items-center gap-2.5 select-none">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Talent<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Forge</span>
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-400">
              AI-powered hiring
            </span>
          </span>
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {sections.map((s) => (
            <li key={s.label} className="group relative">
              {s.scroll ? (
                <LinkS
                  to={s.to}
                  smooth
                  spy
                  duration={600}
                  offset={-80}
                  className="cursor-pointer text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-violet-600"
                >
                  {s.label}
                </LinkS>
              ) : (
                <Link
                  to={s.to}
                  className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-violet-600"
                >
                  {s.label}
                </Link>
              )}
              <span className={underline(false)} />
            </li>
          ))}
        </ul>

        {/* actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl"
          >
            <UserPlus className="h-4 w-4" />
            Sign up
          </Link>
        </div>

        {/* mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl md:hidden">
          <ul className="space-y-1">
            {sections.map((s) => (
              <li key={s.label}>
                {s.scroll ? (
                  <LinkS
                    to={s.to}
                    smooth
                    spy
                    duration={600}
                    offset={-80}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-violet-600"
                  >
                    {s.label}
                  </LinkS>
                ) : (
                  <Link
                    to={s.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-violet-600"
                  >
                    {s.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3 border-t border-slate-100 pt-4">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-xl border border-indigo-200 px-4 py-2.5 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavbar;