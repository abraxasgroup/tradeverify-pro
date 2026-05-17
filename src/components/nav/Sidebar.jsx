import { NavLink } from "react-router-dom";
import { VeryFiiMark } from "../ui/VeryFiiLogo";

const nav = [
  {
    to: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    label: "Dashboard",
  },
  {
    to: "/market",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 17l4-8 4 4 4-6 4 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 21h18" strokeLinecap="round" />
      </svg>
    ),
    label: "Market",
  },
  {
    to: "/trade",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
    label: "Trade",
  },
  {
    to: "/client",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
      </svg>
    ),
    label: "Clients",
  },
  {
    to: "/offer",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Offer",
  },
  {
    to: "/report",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" />
        <polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    label: "Report",
  },
];

const settingsItem = {
  to: "/settings",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  label: "Settings",
};

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      title={label}
      className={({ isActive }) =>
        `group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
            : "text-slate-500 hover:text-slate-300 hover:bg-white/8"
        }`
      }
    >
      {icon}
      {/* Tooltip */}
      <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-white/10">
        {label}
      </span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-4 gap-2 bg-[#0a0e1a] border-r border-white/6 z-40">
      {/* Logo */}
      <div className="mb-4">
        <VeryFiiMark size={36} />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-white/8 mb-2" />

      {/* Nav items */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {nav.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="mt-auto">
        <NavItem {...settingsItem} />
      </div>
    </aside>
  );
}
