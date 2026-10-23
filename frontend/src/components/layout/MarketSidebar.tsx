import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';

interface MarketSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const MarketSidebar: React.FC<MarketSidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    currentUser,
    openAuthModal,
    openWithdrawModal,
    openVNPayModal,
    openUserProfileModal,
    logout,
    unreadNotificationsCount
  } = useDemo();

  const role = currentUser.role; // 'guest' | 'freelancer' | 'employer' | 'admin'

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `min-h-[42px] px-3.5 py-2.5 flex items-center justify-between rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm font-bold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  const actionBtnClass =
    'w-full min-h-[40px] px-3.5 py-2.5 flex items-center justify-between rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-left cursor-pointer';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Left Sidebar Shell (w-64 = 256px) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white flex flex-col border-r border-slate-800 transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* 1. Brand Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 shrink-0 bg-[#0f172a]">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="inline-flex items-center gap-2.5 group"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/30">
              TM
            </span>
            <div className="leading-tight">
              <strong className="block text-base font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                TalentMatch
              </strong>
              <small className="block text-[9px] font-semibold text-slate-400 tracking-wider uppercase">
                Freelance Marketplace
              </small>
            </div>
          </Link>

          {/* Close button on Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            aria-label="Đóng Menu"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* 2. User Info Card (Phân chia quyền theo Tài khoản) */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 shrink-0">
          {role === 'guest' ? (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                  <i className="fa-regular fa-user" />
                </div>
                <div className="min-w-0">
                  <strong className="block text-xs font-bold text-slate-200 truncate">Khách vãng lai</strong>
                  <small className="block text-[10px] text-slate-400">Chưa đăng nhập</small>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    openAuthModal('login');
                  }}
                  className="py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    openAuthModal('register');
                  }}
                  className="py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs font-bold text-white truncate">{currentUser.name}</strong>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        role === 'employer'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : role === 'admin'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {role === 'employer' ? 'Nhà Tuyển Dụng' : role === 'admin' ? 'Quản Trị Viên' : 'Freelancer'}
                    </span>
                    {currentUser.isVerified && (
                      <i className="fa-solid fa-circle-check text-blue-400 text-[11px]" title="Đã xác thực eKYC" />
                    )}
                  </div>
                </div>
              </div>

              {/* Số dư ví khả dụng */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Số dư ví:</span>
                <b className="text-emerald-400 font-mono font-bold">
                  {(currentUser.balance || 0).toLocaleString('vi-VN')} đ
                </b>
              </div>
            </div>
          )}
        </div>

        {/* 3. Navigation List (Phân chia quyền theo Role) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* ================= A. KHÁCH (GUEST) ================= */}
          {role === 'guest' && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Chức Năng Khám Phá
              </div>
              <nav className="space-y-1">
                <NavLink to="/" end className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-house w-4 text-center text-sm" />
                    <span>Trang chủ</span>
                  </span>
                </NavLink>
                <NavLink to="/projects" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-magnifying-glass w-4 text-center text-sm" />
                    <span>Tìm dự án / việc làm</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancers" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-users w-4 text-center text-sm" />
                    <span>Tìm kiếm Freelancer</span>
                  </span>
                </NavLink>
                <a href="/#how" className={actionBtnClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-shield-halved w-4 text-center text-sm text-emerald-400" />
                    <span>Quy trình Escrow VNPAY</span>
                  </span>
                </a>
              </nav>
            </div>
          )}

          {/* ================= B. FREELANCER (ỨNG VIÊN) ================= */}
          {role === 'freelancer' && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-extrabold text-blue-400 uppercase tracking-widest flex items-center justify-between">
                <span>Dành Cho Freelancer</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                  ỨNG VIÊN
                </span>
              </div>
              <nav className="space-y-1">
                <NavLink to="/" end className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-house w-4 text-center text-sm" />
                    <span>Trang chủ</span>
                  </span>
                </NavLink>
                <NavLink to="/projects" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-magnifying-glass w-4 text-center text-sm text-amber-400" />
                    <span>Tìm việc & nộp báo giá</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancer/dashboard" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-chart-pie w-4 text-center text-sm" />
                    <span>Bảng điều khiển công việc</span>
                  </span>
                </NavLink>
                <NavLink to="/orders/1" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-briefcase w-4 text-center text-sm text-emerald-400" />
                    <span>Hợp đồng & nộp bài</span>
                  </span>
                </NavLink>
                <NavLink to="/kyc" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-id-card w-4 text-center text-sm text-indigo-400" />
                    <span>Xác thực danh tính eKYC</span>
                  </span>
                  {currentUser.isVerified && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                      Đã duyệt
                    </span>
                  )}
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    openWithdrawModal();
                  }}
                  className={actionBtnClass}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-wallet w-4 text-center text-sm text-emerald-400" />
                    <span>Rút tiền về Ngân hàng</span>
                  </span>
                  <i className="fa-solid fa-arrow-right text-[10px] text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    openUserProfileModal();
                  }}
                  className={actionBtnClass}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-regular fa-user w-4 text-center text-sm text-sky-400" />
                    <span>Hồ sơ & Portfolio cá nhân</span>
                  </span>
                  <i className="fa-solid fa-arrow-right text-[10px] text-slate-500" />
                </button>
              </nav>
            </div>
          )}

          {/* ================= C. EMPLOYER (NHÀ TUYỂN DỤNG) ================= */}
          {role === 'employer' && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest flex items-center justify-between">
                <span>Dành Cho Doanh Nghiệp</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                  EMPLOYER
                </span>
              </div>
              <nav className="space-y-1">
                <NavLink to="/" end className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-house w-4 text-center text-sm" />
                    <span>Trang chủ</span>
                  </span>
                </NavLink>
                <NavLink to="/create-project" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-circle-plus w-4 text-center text-sm text-emerald-400" />
                    <span>Đăng bài tuyển dụng mới</span>
                  </span>
                </NavLink>
                <NavLink to="/employer/dashboard" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-chart-pie w-4 text-center text-sm" />
                    <span>Quản lý dự án tuyển dụng</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancers" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-wand-magic-sparkles w-4 text-center text-sm text-indigo-400" />
                    <span>Tìm kiếm & Mời Freelancer</span>
                  </span>
                </NavLink>
                <NavLink to="/orders/1" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-file-contract w-4 text-center text-sm text-blue-400" />
                    <span>Hợp đồng & Ký quỹ Escrow</span>
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    openVNPayModal({
                      amount: 10000000,
                      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
                      orderTitle: 'Nạp cọc Ví Tạm Giữ Escrow VNPAY',
                      onPaymentComplete: () => {}
                    });
                  }}
                  className={actionBtnClass}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-credit-card w-4 text-center text-sm text-amber-400" />
                    <span>Nạp tiền cọc VNPAY</span>
                  </span>
                  <i className="fa-solid fa-arrow-right text-[10px] text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    openUserProfileModal();
                  }}
                  className={actionBtnClass}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-regular fa-building w-4 text-center text-sm text-emerald-400" />
                    <span>Hồ sơ Doanh nghiệp</span>
                  </span>
                  <i className="fa-solid fa-arrow-right text-[10px] text-slate-500" />
                </button>
              </nav>
            </div>
          )}

          {/* ================= D. ADMIN (QUẢN TRỊ VIÊN) ================= */}
          {role === 'admin' && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-extrabold text-rose-400 uppercase tracking-widest flex items-center justify-between">
                <span>Quản Trị Hệ Thống</span>
                <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">
                  ADMIN
                </span>
              </div>
              <nav className="space-y-1">
                <NavLink to="/admin/dashboard" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-gauge-high w-4 text-center text-sm text-rose-400" />
                    <span>Bảng điều khiển Admin</span>
                  </span>
                </NavLink>
                <NavLink to="/projects" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-briefcase w-4 text-center text-sm" />
                    <span>Duyệt tin tuyển dụng</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancers" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-users-gear w-4 text-center text-sm text-indigo-400" />
                    <span>Quản lý thành viên & eKYC</span>
                  </span>
                </NavLink>
                <NavLink to="/orders/1" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-scale-balanced w-4 text-center text-sm text-amber-400" />
                    <span>Trọng tài Tranh chấp & Escrow</span>
                  </span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* ================= HỖ TRỢ & HƯỚNG DẪN ================= */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Thông Tin & Hỗ Trợ
            </div>
            <nav className="space-y-1">
              {role !== 'guest' && (
                <NavLink
                  to={role === 'freelancer' ? '/freelancer/dashboard' : '/employer/dashboard'}
                  className={navLinkClass}
                  onClick={onCloseMobile}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-regular fa-bell w-4 text-center text-sm text-amber-400" />
                    <span>Thông báo hệ thống</span>
                  </span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </NavLink>
              )}
              <a href="/#how" className={actionBtnClass} onClick={onCloseMobile}>
                <span className="flex items-center gap-3">
                  <i className="fa-regular fa-circle-question w-4 text-center text-sm text-slate-400" />
                  <span>Quy trình làm việc 4 bước</span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => {
                  alert('Trung tâm Hỗ trợ Khách hàng TalentMatch: Hotline 1900 6868 | Email: support@talentmatch.vn (24/7)');
                }}
                className={actionBtnClass}
              >
                <span className="flex items-center gap-3">
                  <i className="fa-solid fa-headset w-4 text-center text-sm text-slate-400" />
                  <span>Trung tâm trợ giúp 24/7</span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* 4. Bottom Action Box */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 shrink-0 space-y-2">
          {role === 'employer' ? (
            <Link
              to="/create-project"
              onClick={onCloseMobile}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <i className="fa-solid fa-circle-plus text-xs" />
              <span>+ Đăng dự án mới</span>
            </Link>
          ) : role === 'freelancer' ? (
            <Link
              to="/projects"
              onClick={onCloseMobile}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <i className="fa-solid fa-magnifying-glass text-xs" />
              <span>Tìm việc làm ngay</span>
            </Link>
          ) : role === 'admin' ? (
            <Link
              to="/admin/dashboard"
              onClick={onCloseMobile}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <i className="fa-solid fa-gauge-high text-xs" />
              <span>Vào trang quản trị</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                openAuthModal('register');
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <i className="fa-solid fa-rocket text-xs" />
              <span>Bắt đầu ngay miễn phí</span>
            </button>
          )}

          {/* Quick Logout Button for Logged-in Roles */}
          {role !== 'guest' && (
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                logout();
              }}
              className="w-full py-2 bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-900/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket text-xs" />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
