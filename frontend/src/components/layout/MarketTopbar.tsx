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
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openUserProfileModal: demoOpenUserProfileModal
  } = useDemo();
  const navigate = useNavigate();

  const role = currentUser.role; // 'guest' | 'freelancer' | 'employer' | 'admin'
  const isAuthenticated = role !== 'guest';

  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K shortcut listener
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

  // Search handler
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (role === 'employer') {
      navigate(`/freelancers?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/projects?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getSearchPlaceholder = () => {
    if (role === 'employer') return 'Tìm freelancer, kỹ năng (React, Figma, AI)...';
    return 'Tìm dự án, việc làm, freelancer (Ctrl + K)...';
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications for current user
  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || n.userId === 'all'
  );

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'INVITATION':
        return <i className="fa-solid fa-paper-plane text-indigo-600 text-xs" />;
      case 'ESCROW':
        return <i className="fa-solid fa-money-bill-wave text-emerald-600 text-xs" />;
      case 'PROPOSAL':
        return <i className="fa-solid fa-briefcase text-blue-600 text-xs" />;
      case 'CONTRACT':
        return <i className="fa-solid fa-file-contract text-indigo-600 text-xs" />;
      case 'WITHDRAWAL':
        return <i className="fa-solid fa-wallet text-emerald-600 text-xs" />;
      case 'REVIEW':
        return <i className="fa-solid fa-star text-amber-500 text-xs" />;
      case 'SYSTEM':
      default:
        return <i className="fa-solid fa-bell text-blue-600 text-xs" />;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case 'INVITATION':
        return 'bg-indigo-50 border-indigo-200';
      case 'ESCROW':
        return 'bg-emerald-50 border-emerald-200';
      case 'PROPOSAL':
        return 'bg-blue-50 border-blue-200';
      case 'CONTRACT':
        return 'bg-indigo-50 border-indigo-200';
      case 'WITHDRAWAL':
        return 'bg-emerald-50 border-emerald-200';
      case 'REVIEW':
        return 'bg-amber-50 border-amber-200';
      case 'SYSTEM':
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile hamburger menu toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg shrink-0 cursor-pointer"
          aria-label="Mở Menu"
        >
          <i className="fa-solid fa-bars text-lg" />
        </button>

        {/* Global Search Bar (Soft & Flat) */}
        <form onSubmit={handleGlobalSearch} className="relative w-full hidden sm:block">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xs pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-9 pr-14 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white text-[#0F172A] placeholder-[#94A3B8] text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-colors font-medium shadow-2xs"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8] bg-white border border-[#E5E7EB] rounded pointer-events-none">
            Ctrl K
          </span>
        </form>
      </div>

      {/* Middle: Mode Switch Toggle (Hire vs Work) */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Link
          to="/freelancers"
          className="px-3.5 py-1.5 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] font-semibold text-xs transition-colors flex items-center gap-2 border border-[#FDE68A]"
        >
          <i className="fa-solid fa-briefcase text-xs" />
          <span>Tôi muốn thuê</span>
        </Link>
        <Link
          to="/projects"
          className="px-3.5 py-1.5 rounded-lg bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46] font-semibold text-xs transition-colors flex items-center gap-2 border border-[#A7F3D0]"
        >
          <i className="fa-solid fa-bolt text-xs" />
          <span>Tôi muốn làm</span>
        </Link>
      </div>

      {/* Right: Actions, Notifications, User Menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAuthModal?.('login')}
              className="px-3.5 py-1.5 text-xs font-bold text-[#475569] hover:text-[#1D4ED8] transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => onOpenAuthModal?.('register')}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              + Đăng ký
            </button>
          </div>
        ) : (
          <>

            {/* Notification Bell with Dropdown Popup */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
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

              {/* Notification Popup Menu */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100">
                  {/* Notification Header */}
                  <div className="px-4 py-3 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-bell text-blue-600 text-xs" />
                      <strong className="text-xs font-bold text-slate-900">Thông Báo</strong>
                      {unreadNotificationsCount > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadNotificationsCount} mới
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <i className="fa-solid fa-check-double text-[11px]" />
                        <span>Đọc tất cả</span>
                      </button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                    {userNotifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        <i className="fa-regular fa-bell text-2xl mx-auto text-slate-300 mb-2 block" />
                        <p>Hiện không có thông báo nào mới</p>
                      </div>
                    ) : (
                      userNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            setNotifDropdownOpen(false);
                            if (notif.link) {
                              navigate(notif.link);
                            }
                          }}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                            !notif.isRead
                              ? 'bg-blue-50/50 hover:bg-blue-100/60'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getNotifBg(
                              notif.type
                            )}`}
                          >
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-xs truncate ${
                                  !notif.isRead
                                    ? 'font-bold text-slate-900'
                                    : 'font-semibold text-slate-700'
                                }`}
                              >
                                {notif.title}
                              </h4>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-2" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <i className="fa-regular fa-clock text-[10px] text-slate-400" />
                                <span>{notif.timeAgo || notif.createdAt}</span>
                              </span>
                              {notif.link && (
                                <span className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                                  <span>Xem chi tiết</span>
                                  <i className="fa-solid fa-arrow-right text-[9px]" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Notification Footer Link */}
                  {userNotifications.length > 0 && (
                    <div className="p-2 bg-slate-50/60 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifDropdownOpen(false);
                          if (role === 'employer') {
                            navigate('/employer/dashboard');
                          } else if (role === 'freelancer') {
                            navigate('/freelancer/dashboard');
                          } else if (role === 'admin') {
                            navigate('/admin/dashboard');
                          } else {
                            navigate('/projects');
                          }
                        }}
                        className="w-full py-1.5 text-center text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        Đến trung tâm quản lý hoạt động &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

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
