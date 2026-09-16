import { Link } from "react-router-dom";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 pt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-extrabold text-white">
            Talent
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Forge
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            A next-generation recruitment platform connecting students and
            companies through skill-based hiring and intelligent automation.
          </p>

          <p className="mt-4 text-sm text-gray-500 italic">
            “AI-powered hiring, perfected.”
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
          </ul>
        </div>

        {/* JOIN US */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Get Started
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/signup?role=student"
                className="hover:text-blue-400 transition"
              >
                Join as Student
              </Link>
            </li>
            <li>
              <Link
                to="/signup?role=hr"
                className="hover:text-blue-400 transition"
              >
                Join as HR
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-blue-400 transition"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact & Support
          </h3>

          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <FaEnvelope />
              support@talentforge.com
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt />
              India · Remote Friendly
            </li>
          </ul>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-800 mt-14"></div>

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">

        <p>
          © {new Date().getFullYear()} TalentForge. All rights reserved.
        </p>

        {/* LEGAL */}
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="/privacy" className="hover:text-white transition">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white transition">
            Terms of Service
          </Link>
        </div>

        {/* SOCIAL */}
        <div className="flex gap-5 mt-4 md:mt-0">
          <a
            href="https://www.linkedin.com/in/gauravyadav95/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
          >
            <FaGithub size={18} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
          >
            <FaTwitter size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};



export default Footer;
