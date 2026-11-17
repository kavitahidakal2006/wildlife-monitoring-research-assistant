import {
  BarChart3,
  Binoculars,
  CheckSquare,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  ScanSearch,
  Settings,
  Trees,
  Upload,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { WildlifeImage } from './WildlifeImage';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Monitoring Projects', to: '/projects', icon: FolderKanban },
  { label: 'Upload Images', to: '/upload', icon: Upload },
  { label: 'AI Image Analysis', to: '/analysis', icon: ScanSearch },
  { label: 'Image Review', to: '/review', icon: CheckSquare },
  { label: 'Wildlife Observations', to: '/observations', icon: Binoculars },
  { label: 'Species Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Research Reports', to: '/reports', icon: FileText },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { profile, logout, records } = useResearch();
  const navigate = useNavigate();
  const pendingReviewCount = records.filter(
    (r) => r.verificationStatus === 'Needs Review'
  ).length;

  const handleLogout = () => {
    logout();
    onCloseMobile();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-[#E2E5DA] bg-white">
      <div className="flex items-center justify-between border-b border-[#EFF1E8] px-5 py-4">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 text-[#244B35]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#244B35] text-white">
            <Trees className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="block font-display text-sm font-bold leading-tight text-[#202B24] truncate">
              Wildlife Monitoring
            </span>
            <span className="block text-[11px] font-medium text-[#788078] truncate">
              Research Assistant
            </span>
          </div>
        </NavLink>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-[#788078] hover:bg-[#F5F6EF] lg:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#244B35] text-white'
                    : 'text-[#4F574F] hover:bg-[#F5F6EF] hover:text-[#202B24]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-[#A6B77A]' : 'text-[#788078]'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.to === '/review' && pendingReviewCount > 0 && (
                    <span
                      className={`ml-2 font-mono text-xs tabular-nums ${
                        isActive ? 'text-[#A6B77A]' : 'text-[#9A6614]'
                      }`}
                    >
                      {pendingReviewCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#EFF1E8] p-4">
        <div className="flex items-center gap-3">
          <WildlifeImage
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#202B24]">
              {profile.name}
            </p>
            <p className="truncate text-[11px] text-[#788078]">{profile.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E5DA] bg-[#FAFBF7] px-3 py-2 text-xs font-medium text-[#4F574F] transition-colors hover:bg-[#EFF1E8] hover:text-[#202B24]"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#202B24]/45"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-64 max-w-[82vw]">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
