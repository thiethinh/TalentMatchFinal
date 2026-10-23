import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';

interface MarketTopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
  onOpenUserProfileModal?: () => void;
}

export const MarketTopbar: React.FC<MarketTopbarProps> = ({
  onOpenMobileSidebar,
  onOpenAuthModal,
  onOpenUserProfileModal,
}) => {
  const {
    currentUser,
    logout,
    unreadNotificationsCount,
    openUserProfileModal: demoOpenUserProfileModal
  } = useDemo();
  const navigate = useNavigate();

  const role = currentUser.role; // 'guest' | 'freelancer' | 'employer' | 'admin'
  const isAuthenticated = role !== 'guest';

  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K focus search
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (role === 'employer') {
      navigate(`/freelancers?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/projects?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getSearchPlaceholder = () => {
    if (role === 'admin') return 'Tìm kiếm người dùng, email, báo cáo...';
    if (role === 'employer') return 'Tìm Freelancer, kỹ năng (React, Figma, AI)...';
    return 'Tìm dự án, việc làm, freelancer (Ctrl + K)...';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer"
          aria-label="Mở Menu"
        >
          <i className="fa-solid fa-bars text-lg" />
        </button>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <kbd className="hidden sm:inline-flex items-center absolute right-3 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </form>
      </div>

      {/* Middle: Mode Switch Toggle (Hire vs Work) */}
      <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
        <Link
          to="/freelancers"
          className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-briefcase text-slate-400 text-xs" />
          <span>Tôi muốn thuê</span>
        </Link>
        <Link
          to="/projects"
          className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-bolt text-amber-500 text-xs" />
          <span>Tôi muốn làm</span>
        </Link>
      </div>

      {/* Right: Actions, Notifications, User Menu */}
      <div className="flex items-center gap-2.5 shrink-0">

        {/* Primary Action Button */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAuthModal?.('login')}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => onOpenAuthModal?.('register')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
            >
              + Đăng ký
            </button>
          </div>
        ) : (
          <>
            {role === 'employer' && (
              <Link
                to="/create-project"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all"
              >
                <i className="fa-solid fa-plus text-xs" />
                <span>Đăng dự án</span>
              </Link>
            )}

            {role === 'freelancer' && (
              <Link
                to="/projects"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-indigo-600/20 transition-all"
              >
                <i className="fa-solid fa-magnifying-glass text-xs" />
                <span>Tìm việc</span>
              </Link>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => navigate(role === 'freelancer' ? '/freelancer/dashboard' : '/employer/dashboard')}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Thông báo"
            >
              <i className="fa-regular fa-bell text-base" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User Profile Menu Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-100">
                    {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 hidden sm:inline" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 divide-y divide-slate-100">
                  <div className="p-3">
                    <strong className="block text-xs font-bold text-slate-900 truncate">
                      {currentUser.name || 'Người dùng'}
                    </strong>
                    <small className="block text-[11px] text-slate-500 font-mono truncate">
                      {currentUser.email}
                    </small>
                    <span className="inline-block mt-1 text-[10px] uppercase font-extrabold tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {role === 'employer' ? 'Nhà Tuyển Dụng' : role === 'admin' ? 'Quản Trị Viên' : 'Freelancer'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenUserProfileModal) {
                          onOpenUserProfileModal();
                        } else {
                          demoOpenUserProfileModal();
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <i className="fa-regular fa-user text-slate-400 w-4 text-center" />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <Link
                      to={
                        role === 'admin'
                          ? '/admin/dashboard'
                          : role === 'employer'
                          ? '/employer/dashboard'
                          : '/freelancer/dashboard'
                      }
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <i className="fa-solid fa-chart-pie text-slate-400 w-4 text-center" />
                      <span>Bảng điều khiển</span>
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-right-from-bracket text-rose-400 w-4 text-center" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};
