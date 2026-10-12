import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import {
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Shield,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Wallet,
  Briefcase,
  Bell,
  CheckCheck,
  ArrowRight,
  Clock,
  FileCheck2,
  ShieldCheck,
  CircleDollarSign,
  Send
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    openAuthModal,
    logout,
    openVNPayModal,
    openUserProfileModal,
    openWithdrawModal,
    switchUserById,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useDemo();

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [testAccountsOpen, setTestAccountsOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const testMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (testMenuRef.current && !testMenuRef.current.contains(event.target as Node)) {
        setTestAccountsOpen(false);
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
        return <Send className="w-4 h-4 text-indigo-600" />;
      case 'ESCROW':
        return <CircleDollarSign className="w-4 h-4 text-emerald-600" />;
      case 'PROPOSAL':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'CONTRACT':
        return <FileCheck2 className="w-4 h-4 text-indigo-600" />;
      case 'WITHDRAWAL':
        return <Wallet className="w-4 h-4 text-cyan-600" />;
      case 'REVIEW':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'SYSTEM':
      default:
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
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
        return 'bg-cyan-50 border-cyan-200';
      case 'REVIEW':
        return 'bg-amber-50 border-amber-200';
      case 'SYSTEM':
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
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
                <div className="flex items-center tracking-tight font-black text-lg sm:text-xl leading-none">
                  <span className="text-white">Talent</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Match</span>
                  <span className="text-[9px] font-extrabold text-sky-400 ml-1.5 px-1.5 py-0.5 bg-sky-950/90 border border-sky-800/80 rounded-md leading-none">VN</span>
                </div>
                <span className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5">Freelancer Market</span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-2 text-xs font-bold">
              <Link
                to="/projects"
                className={`px-3.5 py-2 rounded-xl transition-all ${isActive('/projects')
                  ? 'text-sky-400 bg-sky-950/90 border border-sky-500/50 font-extrabold shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
                  }`}
              >
                Dự Án Tuyển Dụng
              </Link>

              <Link
                to="/freelancers"
                className={`px-3.5 py-2 rounded-xl transition-all ${isActive('/freelancers')
                  ? 'text-sky-400 bg-sky-950/90 border border-sky-500/50 font-extrabold shadow-sm'
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
                className="text-emerald-400 text-xs bg-emerald-950/90 hover:bg-emerald-900/90 px-3.5 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold cursor-pointer shadow-sm"
              >
                Cổng VNPAY Escrow
              </button>
            </nav>
          </div>

          {/* 2. Right Side Controls */}
          <div className="hidden md:flex items-center space-x-3">

            {/* Quick Test Accounts Switcher Dropdown */}
            <div className="relative" ref={testMenuRef}>
              <button
                onClick={() => setTestAccountsOpen(!testAccountsOpen)}
                className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold px-3 py-2 rounded-xl transition-all border border-neutral-700/80 cursor-pointer shadow-sm"
                title="Đổi nhanh tài khoản mẫu để test các vai trò"
              >
                <span className="hidden xl:inline text-neutral-400">Test:</span>
                <span className="text-sky-400 font-extrabold truncate max-w-[100px]">
                  {currentUser.role === 'guest' ? 'Khách' : currentUser.name.split(' ').slice(-1)[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${testAccountsOpen ? 'rotate-180' : ''}`} />
              </button>

              {testAccountsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Test Tài Khoản
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-1.5 space-y-1 text-xs">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUserById(u.id);
                          setTestAccountsOpen(false);
                          navigate('/');
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${currentUser.id === u.id ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">{u.name}</div>
                            <div className="text-[10px] text-slate-500 capitalize">{u.role} {u.accountStatus === 'SUSPENDED' && '• Bị khóa'}</div>
                          </div>
                        </div>
                        {u.emailVerified ? (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">✓ Active</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">! Chưa xác thực</span>
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        logout();
                        setTestAccountsOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl hover:bg-rose-50 text-rose-700 transition-all font-bold cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất (Chế độ Khách)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell Icon & Dropdown */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all border border-neutral-700/80 cursor-pointer shadow-sm"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">

                  {/* Notification Header */}
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-slate-900 text-sm">Thông Báo</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadNotificationsCount} mới
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Đọc tất cả</span>
                      </button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 p-1">
                    {userNotifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
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
                          className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start space-x-3 ${!notif.isRead
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
                                className={`text-xs truncate ${!notif.isRead
                                  ? 'font-extrabold text-slate-900'
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
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{notif.timeAgo || notif.createdAt}</span>
                              </span>
                              {notif.link && (
                                <span className="text-blue-600 font-bold flex items-center gap-0.5 group-hover:underline">
                                  <span>Xem chi tiết</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
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
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs rounded-xl border border-neutral-750 transition-all cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              /* Logged In: Interactive Avatar Profile Menu */
              <div className="relative pl-3 border-l border-neutral-800" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-2xl hover:bg-neutral-900 transition-all border border-transparent hover:border-neutral-800 cursor-pointer"
                  title="Nhấn để xem thông tin cá nhân chi tiết"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-2xl object-cover border border-neutral-700 ring-2 ring-sky-500/40 shadow-xs"
                    />
                    {currentUser.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sky-400 rounded-full border-2 border-neutral-950" />
                    )}
                  </div>

                  <div className="text-left text-xs hidden sm:block">
                    <div className="font-extrabold text-white line-clamp-1 max-w-[110px]">{currentUser.name}</div>
                    <div className="text-[10px] text-sky-400 capitalize font-medium leading-tight">
                      {currentUser.role === 'employer' ? 'Nhà tuyển dụng' : currentUser.role === 'freelancer' ? 'Freelancer' : 'Admin'}
                    </div>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${userDropdownOpen ? 'rotate-180 text-sky-400' : ''}`} />
                </button>

                {/* Profile Interactive Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-neutral-950 text-neutral-200 rounded-3xl shadow-2xl border border-neutral-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">

                    {/* Top User Card */}
                    <div className="px-4 pb-3 border-b border-neutral-800 flex items-center space-x-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-neutral-700 ring-2 ring-sky-500/50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-white text-sm truncate">{currentUser.name}</div>
                        <div className="text-neutral-400 text-xs truncate">{currentUser.email || 'Chưa có email'}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {currentUser.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold border border-emerald-800/60">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Đã xác thực</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                openAuthModal('verification');
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 px-2 py-0.5 rounded-full font-bold border border-amber-800/60 cursor-pointer"
                            >
                              <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                              <span>Xác thực ngay</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Balance Preview & Withdrawal CTA */}
                    <div className="p-3 mx-3 my-2 bg-neutral-900/90 rounded-2xl border border-neutral-800 text-xs">
                      <div className="flex items-center justify-between text-neutral-300 mb-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Số dư ví:</span>
                        </span>
                        <span className="font-black text-emerald-400">{(currentUser.balance || 0).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400 text-[11px] mb-2">
                        <span>Cọc Escrow:</span>
                        <span className="font-bold text-sky-400">{(currentUser.escrowBalance || 0).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openWithdrawModal();
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-[11px] transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Wallet className="w-3 h-3" />
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
                        className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-900 hover:text-white transition-all text-left cursor-pointer font-bold"
                      >
                        <UserIcon className="w-4 h-4 text-sky-400" />
                        <span>Xem Thông Tin Cá Nhân Chi Tiết</span>
                      </button>

                      {/* Direct eKYC Link */}
                      <Link
                        to="/kyc"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-900 hover:text-white transition-all text-left cursor-pointer font-bold text-sky-400"
                      >
                        <div className="flex items-center space-x-2.5">
                          <ShieldCheck className="w-4 h-4 text-sky-400" />
                          <span>Xác Minh eKYC Danh Tính</span>
                        </div>
                        {currentUser.isVerified ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full font-bold border border-emerald-800/60">
                            ✓ Đã xác thực
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full font-bold border border-amber-800/60 animate-pulse">
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
                            className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-900 hover:text-white transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                            <span>Dashboard Nhà Tuyển Dụng</span>
                          </Link>
                          <Link
                            to="/create-project"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-sky-950/60 text-sky-400 hover:text-sky-300 transition-all font-bold"
                          >
                            <PlusCircle className="w-4 h-4 text-sky-400" />
                            <span>+ Đăng Dự Án Mới</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'freelancer' && (
                        <Link
                          to="/freelancer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-900 hover:text-white transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                          <span>Góc Quản Lý Freelancer</span>
                        </Link>
                      )}

                      {currentUser.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-purple-950/50 text-purple-300 hover:text-purple-200 transition-all font-bold"
                        >
                          <Shield className="w-4 h-4 text-purple-400" />
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
                          className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-950/50 text-rose-300 hover:text-rose-200 transition-all text-left cursor-pointer font-bold"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
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
              className="relative p-1.5 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {currentUser.role !== 'guest' ? (
              <button
                onClick={openUserProfileModal}
                className="p-1 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer"
                title="Xem hồ sơ cá nhân"
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover" />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Đăng nhập
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-sky-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-4 text-xs animate-in slide-in-from-top-2 duration-150 text-neutral-200">
          <div className="flex flex-col space-y-3 font-bold">
            <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-sky-400">
              Dự Án Tuyển Dụng
            </Link>
            <Link to="/freelancers" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-sky-400">
              Hồ Sơ Freelancer & Portfolio
            </Link>

            {currentUser.role === 'employer' && (
              <>
                <Link to="/employer/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-neutral-200 hover:text-sky-400">
                  Dashboard Tuyển Dụng
                </Link>
                <Link to="/create-project" onClick={() => setMobileMenuOpen(false)} className="text-sky-400 font-extrabold">
                  + Đăng Dự Án Mới
                </Link>
              </>
            )}

            {currentUser.role === 'freelancer' && (
              <Link to="/freelancer/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sky-400 font-extrabold">
                Dashboard Freelancer
              </Link>
            )}

            {currentUser.role === 'admin' && (
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-purple-300 font-extrabold">
                Dashboard Quản Trị Admin
              </Link>
            )}

            {currentUser.role !== 'guest' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openUserProfileModal();
                }}
                className="text-left text-sky-400 font-bold py-1 flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Xem Thông Tin Cá Nhân Chi Tiết</span>
              </button>
            )}

            {/* Quick Test Switcher for Mobile */}
            <div className="pt-3 border-t border-neutral-800">
              <div className="text-[11px] font-extrabold text-neutral-400 uppercase mb-2">Đổi tài khoản test:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUserById(u.id);
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className={`p-2 rounded-xl text-[11px] text-left border ${currentUser.id === u.id ? 'bg-sky-950/70 border-sky-600 text-sky-200 font-bold' : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                      }`}
                  >
                    <div className="font-bold truncate">{u.name}</div>
                    <div className="text-[9px] text-neutral-400 capitalize">{u.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout / Login in Mobile */}
            <div className="pt-2 border-t border-neutral-800">
              {currentUser.role !== 'guest' ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full py-2.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold rounded-xl border border-rose-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất (Khách)</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="flex-1 py-2 bg-neutral-900 border border-neutral-800 text-neutral-200 font-bold rounded-xl"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="flex-1 py-2 bg-sky-500 text-slate-950 font-black rounded-xl"
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
  );
};
