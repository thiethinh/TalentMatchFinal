import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    openAuthModal,
    logout,
    openVNPayModal,
    openUserProfileModal,
    openWithdrawModal,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

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
        return <i className="fa-solid fa-circle-exclamation text-purple-600 text-xs" />;
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
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <>
      {currentUser.role !== 'guest' && !currentUser.emailVerified && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-medium sticky top-0 z-50 border-b border-amber-600/30 shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <i className="fa-solid fa-triangle-exclamation text-amber-950 shrink-0 text-sm" />
              <span className="truncate">
                Tài khoản (<strong className="font-bold">{currentUser.email}</strong>) chưa xác thực email. Chức năng đăng dự án và ứng tuyển bị giới hạn.
              </span>
            </div>
            <button
              onClick={() => openAuthModal('verification')}
              className="px-3 py-1 bg-amber-950 text-white font-bold rounded-md hover:bg-black transition-all cursor-pointer whitespace-nowrap text-[11px] shrink-0"
            >
              Nhập mã OTP xác thực
            </button>
          </div>
        </div>
      )}
      <header className="bg-black/95 backdrop-blur-xl border-b border-neutral-800 sticky top-0 z-40 shadow-xl text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* 1. Logo Brand & Main Links */}
          <div className="flex items-center space-x-6 lg:space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative shrink-0 flex items-center justify-center p-1 bg-white rounded-xl shadow-md group-hover:scale-105 transition-all">
                <img
                  src="/logo_talentMatch.png"
                  alt="TalentMatch Logo"
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-lg"
                />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center tracking-tight font-bold text-lg sm:text-xl leading-none">
                  <span className="text-white">Talent</span>
                  <span className="text-blue-500 font-bold">Match</span>
                  <span className="text-[10px] font-bold text-slate-300 ml-1.5 px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 leading-none">VN</span>
                </div>
                <span className="text-[9px] font-semibold text-neutral-400 tracking-wider uppercase mt-0.5">Freelancer Market</span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-2 text-xs">
              <Link
                to="/projects"
                className={`px-3.5 py-1.5 rounded-md transition-all font-medium ${isActive('/projects')
                  ? 'text-white bg-slate-800 border border-slate-700 shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
                  }`}
              >
                Dự Án Tuyển Dụng
              </Link>

              <Link
                to="/freelancers"
                className={`px-3.5 py-1.5 rounded-md transition-all font-medium ${isActive('/freelancers')
                  ? 'text-white bg-slate-800 border border-slate-700 shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
                  }`}
              >
                Hồ Sơ Freelancer
              </Link>

              <button
                onClick={() =>
                  openVNPayModal({
                    amount: 5000000,
                    orderNumber: 'TM-2026-DEMO',
                    orderTitle: 'Mô phỏng Thanh toán Escrow qua Cổng VNPAY',
                    onPaymentComplete: () => { }
                  })
                }
                className="text-white text-xs bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-md border border-emerald-500 transition-all font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-shield-halved text-[11px]" />
                <span>Cổng VNPAY Escrow</span>
              </button>
            </nav>
          </div>

          {/* 2. Right Side Controls */}
          <div className="hidden md:flex items-center space-x-3">


            {/* Notification Bell Icon & Dropdown */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all border border-neutral-700/80 cursor-pointer"
                title="Thông báo hệ thống"
              >
                <i className="fa-solid fa-bell text-sm" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in duration-100">

                  {/* Notification Header */}
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <i className="fa-solid fa-bell text-blue-600 text-xs" />
                      <span className="font-bold text-slate-900 text-sm">Thông Báo</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadNotificationsCount} mới
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <i className="fa-solid fa-check-double text-[11px]" />
                        <span>Đọc tất cả</span>
                      </button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 p-1">
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
                            setNotificationDropdownOpen(false);
                            if (notif.link) {
                              navigate(notif.link);
                            }
                          }}
                          className={`p-2.5 rounded-md transition-all cursor-pointer flex items-start space-x-3 ${!notif.isRead
                            ? 'bg-blue-50/50 hover:bg-blue-100/60'
                            : 'hover:bg-slate-50'
                            }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${getNotifBg(
                              notif.type
                            )}`}
                          >
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-xs truncate ${!notif.isRead
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
                                <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:underline">
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
                    <div className="pt-2 px-3 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setNotificationDropdownOpen(false);
                          if (currentUser.role === 'employer') {
                            navigate('/employer/dashboard');
                          } else if (currentUser.role === 'freelancer') {
                            navigate('/freelancer/dashboard');
                          } else if (currentUser.role === 'admin') {
                            navigate('/admin/dashboard');
                          } else {
                            navigate('/projects');
                          }
                        }}
                        className="w-full py-1.5 text-center text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        Đến trung tâm quản lý hoạt động &rarr;
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Guest View: Login & Register Buttons */}
            {currentUser.role === 'guest' ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-neutral-800">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs rounded-md border border-neutral-750 transition-all cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-md transition-all shadow-sm cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              /* Logged In: Interactive Avatar Profile Menu */
              <div className="relative pl-3 border-l border-neutral-800" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-md hover:bg-neutral-900 transition-all border border-transparent hover:border-neutral-800 cursor-pointer"
                  title="Nhấn để xem thông tin cá nhân chi tiết"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-md object-cover border border-neutral-700 ring-1 ring-blue-500/40"
                    />
                    {currentUser.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-neutral-950" />
                    )}
                  </div>

                  <div className="text-left text-xs hidden sm:block">
                    <div className="font-bold text-white line-clamp-1 max-w-[110px]">{currentUser.name}</div>
                    <div className="text-[10px] text-blue-400 capitalize font-medium leading-tight">
                      {currentUser.role === 'employer' ? 'Nhà tuyển dụng' : currentUser.role === 'freelancer' ? 'Freelancer' : 'Admin'}
                    </div>
                  </div>

                  <i className={`fa-solid fa-chevron-down text-[10px] text-neutral-400 transition-transform ${userDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>

                {/* Profile Interactive Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-neutral-950 text-neutral-200 rounded-lg shadow-xl border border-neutral-800 py-3 z-50 animate-in fade-in duration-100">

                    {/* Top User Card */}
                    <div className="px-4 pb-3 border-b border-neutral-800 flex items-center space-x-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-md object-cover border border-neutral-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
                        <div className="text-neutral-400 text-xs truncate">{currentUser.email || 'Chưa có email'}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {currentUser.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                              <i className="fa-solid fa-circle-check text-emerald-400 text-[10px]" />
                              <span>Đã xác thực</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                openAuthModal('verification');
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded font-semibold border border-amber-500/20 cursor-pointer"
                            >
                              <i className="fa-solid fa-circle-exclamation text-amber-400 text-[10px]" />
                              <span>Xác thực ngay</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Balance Preview & Withdrawal CTA */}
                    <div className="p-3 mx-3 my-2 bg-neutral-900/90 rounded-md border border-neutral-800 text-xs">
                      <div className="flex items-center justify-between text-neutral-300 mb-1">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <i className="fa-solid fa-wallet text-emerald-400 text-xs" />
                          <span>Số dư ví:</span>
                        </span>
                        <span className="font-bold text-emerald-400">{(currentUser.balance || 0).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400 text-[11px] mb-2">
                        <span>Cọc Escrow:</span>
                        <span className="font-bold text-blue-400">{(currentUser.escrowBalance || 0).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openWithdrawModal();
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <i className="fa-solid fa-wallet text-[10px]" />
                        <span>Rút tiền về ngân hàng</span>
                      </button>
                    </div>

                    {/* Menu Actions */}
                    <div className="px-2 space-y-1 text-xs font-semibold text-neutral-300">

                      {/* Open Detailed Profile Modal */}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openUserProfileModal();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-neutral-900 hover:text-white transition-all text-left cursor-pointer font-bold"
                      >
                        <i className="fa-solid fa-user text-xs text-blue-400" />
                        <span>Xem Thông Tin Cá Nhân Chi Tiết</span>
                      </button>

                      {/* Direct eKYC Link */}
                      <Link
                        to="/kyc"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-neutral-900 hover:text-white transition-all text-left cursor-pointer font-bold text-blue-400"
                      >
                        <div className="flex items-center space-x-2.5">
                          <i className="fa-solid fa-shield-halved text-xs text-blue-400" />
                          <span>Xác Minh eKYC Danh Tính</span>
                        </div>
                        {currentUser.isVerified ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                            ✓ Đã xác thực
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded font-semibold border border-amber-500/20">
                            ! Cần eKYC
                          </span>
                        )}
                      </Link>

                      {/* Go to role Dashboard */}
                      {currentUser.role === 'employer' && (
                        <>
                          <Link
                            to="/employer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-neutral-900 hover:text-white transition-all"
                          >
                            <i className="fa-solid fa-gauge text-xs text-neutral-400" />
                            <span>Dashboard Nhà Tuyển Dụng</span>
                          </Link>
                          <Link
                            to="/create-project"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-neutral-800 text-blue-400 hover:text-blue-300 transition-all font-semibold"
                          >
                            <i className="fa-solid fa-circle-plus text-xs text-blue-400" />
                            <span>+ Đăng Dự Án Mới</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'freelancer' && (
                        <Link
                          to="/freelancer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-neutral-900 hover:text-white transition-all"
                        >
                          <i className="fa-solid fa-gauge text-xs text-neutral-400" />
                          <span>Góc Quản Lý Freelancer</span>
                        </Link>
                      )}

                      {currentUser.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-purple-950/50 text-purple-300 hover:text-purple-200 transition-all font-bold"
                        >
                          <i className="fa-solid fa-shield-halved text-xs text-purple-400" />
                          <span>Cổng Quản Trị Admin</span>
                        </Link>
                      )}

                      {/* Logout Button */}
                      <div className="border-t border-neutral-800 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-rose-950/50 text-rose-300 hover:text-rose-200 transition-all text-left cursor-pointer font-bold"
                        >
                          <i className="fa-solid fa-right-from-bracket text-xs text-rose-400" />
                          <span>Đăng Xuất Khỏi Tài Khoản</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Mobile Menu Button & Notification */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notification Button */}
            <button
              onClick={() => {
                if (currentUser.role === 'employer') {
                  navigate('/employer/dashboard');
                } else if (currentUser.role === 'freelancer') {
                  navigate('/freelancer/dashboard');
                } else if (currentUser.role === 'admin') {
                  navigate('/admin/dashboard');
                } else {
                  navigate('/projects');
                }
              }}
              className="relative p-1.5 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white"
              title="Thông báo"
            >
              <i className="fa-solid fa-bell text-sm" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {currentUser.role !== 'guest' ? (
              <button
                onClick={openUserProfileModal}
                className="p-1 rounded-md border border-neutral-800 bg-neutral-900 cursor-pointer"
                title="Xem hồ sơ cá nhân"
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-md object-cover" />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-md cursor-pointer"
              >
                Đăng nhập
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <i className="fa-solid fa-xmark text-lg text-blue-400" /> : <i className="fa-solid fa-bars text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-4 text-xs animate-in slide-in-from-top-2 duration-150 text-neutral-200">
          <div className="flex flex-col space-y-3 font-semibold">
            <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-blue-400">
              Dự Án Tuyển Dụng
            </Link>
            <Link to="/freelancers" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-blue-400">
              Hồ Sơ Freelancer & Portfolio
            </Link>

            {currentUser.role === 'employer' && (
              <>
                <Link to="/employer/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-neutral-200 hover:text-blue-400">
                  Dashboard Tuyển Dụng
                </Link>
                <Link to="/create-project" onClick={() => setMobileMenuOpen(false)} className="text-blue-400 font-bold">
                  + Đăng Dự Án Mới
                </Link>
              </>
            )}

            {currentUser.role === 'freelancer' && (
              <Link to="/freelancer/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-blue-400 font-bold">
                Dashboard Freelancer
              </Link>
            )}

            {currentUser.role === 'admin' && (
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-purple-300 font-bold">
                Dashboard Quản Trị Admin
              </Link>
            )}

            {currentUser.role !== 'guest' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openUserProfileModal();
                }}
                className="text-left text-blue-400 font-semibold py-1 flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-user text-xs" />
                <span>Xem Thông Tin Cá Nhân Chi Tiết</span>
              </button>
            )}


            {/* Logout / Login in Mobile */}
            <div className="pt-2 border-t border-neutral-800">
              {currentUser.role !== 'guest' ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full py-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold rounded-md border border-rose-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-right-from-bracket text-xs" />
                  <span>Đăng xuất (Khách)</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="flex-1 py-2 bg-neutral-900 border border-neutral-800 text-neutral-200 font-bold rounded-md"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-md"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
    </>
  );
};
