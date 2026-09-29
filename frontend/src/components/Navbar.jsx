import { useState } from 'react';
import { GraduationCap, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ links = [] }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
              <GraduationCap size={20} strokeWidth={2.25} />
            </span>
            <span className="font-display text-lg font-bold text-ink-900">
              Intern<span className="text-brand-600">Track</span>
            </span>
          </a>

          {links.length > 0 && (
            <div className="hidden gap-1 md:flex">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={l.onClick}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    l.active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-700 hover:bg-slate-50'
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-ink-900 sm:block">
              {user?.name}
            </span>
            <ChevronDown size={16} className="text-ink-500" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="border-b border-slate-100 px-3.5 py-2.5">
                <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
                <p className="truncate text-xs text-ink-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
