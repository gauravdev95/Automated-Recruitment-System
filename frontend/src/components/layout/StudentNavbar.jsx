import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, MoreVertical, UserCircle, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const underline =
  "absolute -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300";

const StudentNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // close the 3-dot dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { to: "/jobs", label: "Browse Jobs" },
    { to: "/student/dashboard", label: "My Pipeline" },
  ];

  const isActive = (to) => location.pathname === to;
  const userName = (localStorage.getItem("userName") || "").split(" ")[0];

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-xl border-b border-slate-200/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-10">
        {/* left links (desktop) */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative text-sm font-medium transition-colors duration-200 ${
                isActive(l.to)
                  ? "text-violet-600"
                  : "text-slate-600 hover:text-violet-600"
              }`}
            >
              {l.label}
              {isActive(l.to) && <span className={`${underline} w-full`} />}
            </Link>
          ))}
        </div>

        {/* mobile toggle (left on small screens) */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* logo */}
        <Link
          to="/student/dashboard"
          className="group flex items-center gap-2.5 select-none"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Talent<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Forge</span>
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-400">
              Student portal
            </span>
          </span>
        </Link>

        {/* right */}
        <div className="flex items-center gap-3">
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl"
          >
            <UserCircle className="h-5 w-5" />
            <span className="hidden sm:inline">{userName ? `${userName}'s` : ""} Profile</span>
            <span className="sm:hidden">Profile</span>
          </Link>

          {/* 3-dot dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-label="More options"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div className="absolute top-12 right-0 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <Link
                  to="/student/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-violet-600"
                >
                  <UserCircle className="h-4 w-4" /> My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-indigo-50 hover:text-violet-600 ${
                isActive(l.to) ? "text-violet-600 bg-indigo-50" : "text-slate-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            <Link
              to="/student/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-violet-600"
            >
              <UserCircle className="h-4 w-4" /> My Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default StudentNavbar;