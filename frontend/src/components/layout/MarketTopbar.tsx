import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';

interface MarketTopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'verification' | 'google-auth') => void;
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
    openUserProfileModal: demoOpenUserProfileModal,
    openWithdrawModal,
    openVNPayModal
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

  // Global Ctrl+K shortcut listener and Escape to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNotifDropdownOpen(false);
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
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="Tài khoản cá nhân"
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
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 hidden sm:inline transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                >
                  {/* 1. Avatar, Họ tên | 2. Email | 3. Role Badge */}
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-bold text-sm flex items-center justify-center ring-2 ring-blue-100 shrink-0">
                          {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <strong className="block text-sm font-bold text-slate-900 truncate">
                          {currentUser.name || 'Người dùng'}
                        </strong>
                        <small className="block text-[11px] text-slate-500 font-mono truncate">
                          {currentUser.email}
                        </small>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                        role === 'employer'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <i className={`text-[8px] ${
                          role === 'employer'
                            ? 'fa-solid fa-briefcase'
                            : role === 'admin'
                            ? 'fa-solid fa-shield-halved'
                            : 'fa-solid fa-bolt'
                        }`} />
                        <span>{role === 'employer' ? 'Nhà Tuyển Dụng' : role === 'admin' ? 'Quản Trị Viên' : 'Freelancer'}</span>
                      </span>

                      {/* Email Verification Status Badge */}
                      {currentUser.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                          <i className="fa-solid fa-circle-check text-[9px]" />
                          <span>Email đã xác thực</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-300 animate-pulse">
                          <i className="fa-solid fa-triangle-exclamation text-[9px]" />
                          <span>Chưa xác thực email</span>
                        </span>
                      )}

                      {/* eKYC Status Badge */}
                      {currentUser.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                          <i className="fa-solid fa-id-card text-[9px]" />
                          <span>Đã eKYC</span>
                        </span>
                      ) : (
                        <Link
                          to="/kyc"
                          onClick={() => setUserMenuOpen(false)}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer"
                        >
                          <i className="fa-regular fa-id-card text-[9px]" />
                          <span>Chưa eKYC</span>
                        </Link>
                      )}
                    </div>

                    {/* Unverified Email Warning CTA in Dropdown */}
                    {!currentUser.emailVerified && (
                      <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                            <i className="fa-solid fa-triangle-exclamation text-amber-600 text-xs" />
                            <span>Chưa xác thực email</span>
                          </p>
                          <p className="text-[10px] text-amber-700 truncate">
                            Nhập mã OTP để mở khóa tài khoản
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAuthModal?.('verification');
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                        >
                          Xác thực ngay
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. Vùng hiển thị số dư ví (Icon ví + Số tiền nổi bật + Thao tác ví) */}
                  <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl my-1 border border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <i className="fa-solid fa-wallet text-[#059669] text-sm" />
                        <span>Số dư ví</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        VND
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mt-1">
                      <div className="text-xl font-bold font-mono text-[#059669] tracking-tight">
                        {(currentUser.balance || 0).toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    {/* Quick Wallet Actions based on role */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                      {role === 'freelancer' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            openWithdrawModal();
                          }}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <i className="fa-solid fa-arrow-up-from-bracket text-[10px]" />
                          <span>Rút tiền</span>
                        </button>
                      ) : role === 'employer' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            openVNPayModal({
                              amount: 10000000,
                              orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
                              orderTitle: 'Nạp cọc Ví Tạm Giữ Escrow VNPAY',
                              onPaymentComplete: () => {}
                            });
                          }}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-blue-50 text-[#1D4ED8] hover:text-[#1E40AF] border border-blue-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <i className="fa-solid fa-plus text-[10px]" />
                          <span>Nạp tiền VNPAY</span>
                        </button>
                      ) : null}

                      <Link
                        to={role === 'freelancer' ? '/freelancer/dashboard' : role === 'employer' ? '/employer/dashboard' : '/admin/dashboard'}
                        onClick={() => setUserMenuOpen(false)}
                        className="py-1.5 px-2 text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/60 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Chi tiết ví</span>
                        <i className="fa-solid fa-chevron-right text-[9px]" />
                      </Link>
                    </div>
                  </div>

                  {/* 5. Các thao tác điều hướng */}
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
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
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
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <i className="fa-solid fa-chart-pie text-slate-400 w-4 text-center" />
                      <span>Bảng điều khiển</span>
                    </Link>
                  </div>

                  {/* 6. Đăng xuất (Phân biệt rõ ràng) */}
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
