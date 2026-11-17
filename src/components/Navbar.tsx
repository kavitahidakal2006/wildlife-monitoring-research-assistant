import React, { useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { WildlifeImage } from './WildlifeImage';

interface NavbarProps {
  pageTitle: string;
  onOpenMobileNav: () => void;
}

export function Navbar({ pageTitle, onOpenMobileNav }: NavbarProps) {
  const {
    profile,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    globalSearch,
    setGlobalSearch,
  } = useResearch();
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/observations?q=${encodeURIComponent(globalSearch.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#E2E5DA] bg-white/95 px-4 backdrop-blur-sm sm:px-6 no-print">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-[#4F574F] hover:bg-[#F5F6EF] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-base font-semibold text-[#202B24] truncate sm:text-lg">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#788078]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search species, camera ID..."
            aria-label="Search species or camera ID"
            className="w-56 rounded-lg border border-[#E2E5DA] bg-[#FAFBF7] py-1.5 pr-3 pl-9 text-xs text-[#202B24] placeholder:text-[#788078] focus:w-72 focus:border-[#244B35] focus:bg-white focus:outline-none transition-all"
          />
        </form>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E5DA] bg-white text-[#4F574F] transition-colors hover:bg-[#F5F6EF] hover:text-[#202B24]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D99A3B] px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-[#E2E5DA] bg-white p-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#EFF1E8] pb-2.5">
                  <span className="font-display text-xs font-semibold text-[#202B24]">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-medium text-[#244B35] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="mt-2 max-h-72 divide-y divide-[#EFF1E8] overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotifOpen(false);
                        navigate(n.linkTo);
                      }}
                      className={`w-full rounded-lg p-2.5 text-left transition-colors hover:bg-[#FAFBF7] ${
                        n.read ? 'opacity-75' : 'bg-[#F5F6EF]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#202B24]">
                          {n.title}
                        </span>
                        <span className="text-[11px] text-[#788078] shrink-0">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#788078]">{n.message}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Link
          to="/settings"
          className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-[#F5F6EF]"
          aria-label="Open profile and settings"
        >
          <WildlifeImage
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
