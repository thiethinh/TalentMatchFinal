import React from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';

interface MarketSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const MarketSidebar: React.FC<MarketSidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    openAuthModal,
    openWithdrawModal,
    openVNPayModal,
    openUserProfileModal,
    logout
  } = useDemo();

  const role = currentUser.role; // 'guest' | 'freelancer' | 'employer' | 'admin'

  const getAdminLinkClass = (tab: string) => {
    const currentTab = new URLSearchParams(location.search).get('tab') || 'analytics';
    const isCurrent = location.pathname === '/admin/dashboard' && currentTab === tab;
    return `w-full min-h-[40px] px-3.5 py-2.5 flex items-center justify-between rounded-xl text-xs transition-colors cursor-pointer text-left ${
      isCurrent
        ? 'bg-[#EFF6FF] text-[#1D4ED8] font-bold'
        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]/70'
    }`;
  };

  // Soft & Flat navLinkClass
  // Mặc định: Chữ và Icon #475569
  // Active: Nền #EFF6FF, Chữ & Icon #1D4ED8
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `min-h-[42px] px-3.5 py-2.5 flex items-center justify-between rounded-xl text-xs font-semibold transition-colors ${
      isActive
        ? 'bg-[#EFF6FF] text-[#1D4ED8] font-bold'
        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]/70'
    }`;

  const actionBtnClass =
    'w-full min-h-[40px] px-3.5 py-2.5 flex items-center justify-between rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]/70 transition-colors text-left cursor-pointer';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Left Sidebar Shell (w-64 = 256px, Nền: #F1F5F9, Viền: #E2E8F0) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F1F5F9] text-[#0F172A] flex flex-col border-r border-[#E2E8F0] transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        }`}
      >
        {/* 1. Brand Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E8F0] shrink-0 bg-[#F1F5F9]">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="relative shrink-0 flex items-center justify-center p-1 bg-white rounded-xl shadow-xs border border-[#E2E8F0] group-hover:scale-105 transition-all">
              <img
                src="/logo_talentMatch.png"
                alt="TalentMatch Logo"
                className="h-8 w-8 object-contain rounded-lg"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center tracking-tight font-extrabold text-base leading-none">
                <span className="text-[#0F172A] group-hover:text-[#2563EB] transition-colors">Talent</span>
                <span className="text-[#2563EB]">Match</span>
                <span className="text-[9px] font-bold text-[#1D4ED8] ml-1.5 px-1.5 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded leading-none">VN</span>
              </div>
              <span className="text-[9px] font-semibold text-[#64748B] tracking-wider uppercase mt-1">
                Freelancer Market
              </span>
            </div>
          </Link>

          {/* Close button on Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#E2E8F0]"
            aria-label="Đóng Menu"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>


        {/* 3. Navigation List (Phân chia quyền theo Role) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300">
          
          {/* ================= A. KHÁCH (GUEST) ================= */}
          {role === 'guest' && (
            <div>
              <div className="px-3 pb-2 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">
                Khám Phá
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
                    <i className="fa-solid fa-briefcase w-4 text-center text-sm" />
                    <span>Danh sách công việc</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancers" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-users w-4 text-center text-sm" />
                    <span>Danh sách Freelancer</span>
                  </span>
                </NavLink>
                <NavLink to="/saved-jobs" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-heart w-4 text-center text-sm text-rose-500" />
                    <span>Việc làm đã lưu</span>
                  </span>
                </NavLink>
                <NavLink to="/contracts" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-file-contract w-4 text-center text-sm text-[#059669]" />
                    <span>Hợp đồng & Escrow</span>
                  </span>
                </NavLink>
                <a href="/#how" className={actionBtnClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-shield-halved w-4 text-center text-sm text-[#059669]" />
                    <span>Quy trình Escrow VNPAY</span>
                  </span>
                </a>
              </nav>
            </div>
          )}

          {/* ================= B. FREELANCER ================= */}
          {role === 'freelancer' && (
            <div>
              <div className="px-3 pb-2 text-[11px] font-extrabold text-[#1D4ED8] uppercase tracking-widest">
                Freelancer
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
                    <i className="fa-solid fa-briefcase w-4 text-center text-sm" />
                    <span>Danh sách công việc</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancers" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-users w-4 text-center text-sm" />
                    <span>Danh sách Freelancer</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancer/dashboard" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-chart-pie w-4 text-center text-sm" />
                    <span>Bảng điều khiển công việc</span>
                  </span>
                </NavLink>
                <NavLink to="/contracts" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-file-contract w-4 text-center text-sm text-[#059669]" />
                    <span>Hợp đồng & nộp bài</span>
                  </span>
                </NavLink>
                <NavLink to="/saved-jobs" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-heart w-4 text-center text-sm text-rose-500" />
                    <span>Việc làm đã lưu</span>
                  </span>
                </NavLink>
                <NavLink to="/kyc" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-id-card w-4 text-center text-sm" />
                    <span>Xác thực eKYC</span>
                  </span>
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
                    <i className="fa-solid fa-wallet w-4 text-center text-sm text-[#059669]" />
                    <span>Rút tiền về Ngân hàng</span>
                  </span>
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
                    <i className="fa-regular fa-user w-4 text-center text-sm text-[#2563EB]" />
                    <span>Hồ sơ & Portfolio cá nhân</span>
                  </span>
                </button>
              </nav>
            </div>
          )}

          {/* ================= C. EMPLOYER (NHÀ TUYỂN DỤNG) ================= */}
          {role === 'employer' && (
            <div>
              <div className="px-3 pb-2 text-[11px] font-extrabold text-[#059669] uppercase tracking-widest">
                Nhà Tuyển Dụng
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
                    <i className="fa-solid fa-briefcase w-4 text-center text-sm" />
                    <span>Danh sách công việc</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancers" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-users w-4 text-center text-sm" />
                    <span>Danh sách Freelancer</span>
                  </span>
                </NavLink>
                <NavLink to="/create-project" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-circle-plus w-4 text-center text-sm text-[#059669]" />
                    <span>Đăng bài tuyển dụng mới</span>
                  </span>
                </NavLink>
                <NavLink to="/employer/dashboard" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-chart-pie w-4 text-center text-sm" />
                    <span>Quản lý dự án tuyển dụng</span>
                  </span>
                </NavLink>
                <NavLink to="/contracts" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-file-contract w-4 text-center text-sm" />
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
                    <i className="fa-solid fa-credit-card w-4 text-center text-sm text-[#D97706]" />
                    <span>Nạp tiền cọc VNPAY</span>
                  </span>
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
                    <i className="fa-regular fa-building w-4 text-center text-sm text-[#059669]" />
                    <span>Hồ sơ Doanh nghiệp</span>
                  </span>
                </button>
              </nav>
            </div>
          )}

          {/* ================= D. ADMIN (QUẢN TRỊ VIÊN) ================= */}
          {role === 'admin' && (
            <div>
              <div className="px-3 pb-2 text-[11px] font-extrabold text-[#DC2626] uppercase tracking-widest">
                Quản Trị Viên
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
                    <i className="fa-solid fa-briefcase w-4 text-center text-sm" />
                    <span>Danh sách công việc</span>
                  </span>
                </NavLink>
                <NavLink to="/freelancers" className={navLinkClass} onClick={onCloseMobile}>
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-users w-4 text-center text-sm" />
                    <span>Danh sách Freelancer</span>
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard?tab=analytics');
                    onCloseMobile();
                  }}
                  className={getAdminLinkClass('analytics')}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-chart-simple w-4 text-center text-sm text-[#2563EB]" />
                    <span>Tổng quan & Biểu đồ</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard?tab=users');
                    onCloseMobile();
                  }}
                  className={getAdminLinkClass('users')}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-users w-4 text-center text-sm" />
                    <span>Quản lý người dùng</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard?tab=projects');
                    onCloseMobile();
                  }}
                  className={getAdminLinkClass('projects')}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-briefcase w-4 text-center text-sm" />
                    <span>Quản lý dự án</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard?tab=transactions');
                    onCloseMobile();
                  }}
                  className={getAdminLinkClass('transactions')}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-credit-card w-4 text-center text-sm text-[#059669]" />
                    <span>Dòng tiền & VNPay</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard?tab=disputes');
                    onCloseMobile();
                  }}
                  className={getAdminLinkClass('disputes')}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-scale-balanced w-4 text-center text-sm text-[#DC2626]" />
                    <span>Trọng tài Tranh chấp</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard?tab=reviews');
                    onCloseMobile();
                  }}
                  className={getAdminLinkClass('reviews')}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-star w-4 text-center text-sm text-[#D97706]" />
                    <span>Kiểm duyệt đánh giá</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin/dashboard?tab=settings');
                    onCloseMobile();
                  }}
                  className={getAdminLinkClass('settings')}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-gear w-4 text-center text-sm text-[#64748B]" />
                    <span>Cấu hình hệ thống</span>
                  </span>
                </button>
              </nav>
            </div>
          )}

          {/* ================= HỖ TRỢ & HƯỚNG DẪN ================= */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">
              Thông Tin & Hỗ Trợ
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  alert('Trung tâm Hỗ trợ Khách hàng TalentMatch: Hotline 1900 6868 | Email: support@talentmatch.vn (24/7)');
                }}
                className={actionBtnClass}
              >
                <span className="flex items-center gap-3">
                  <i className="fa-solid fa-headset w-4 text-center text-sm text-[#64748B]" />
                  <span>Trung tâm trợ giúp 24/7</span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* 4. Bottom Action Box (CTA: #2563EB với chữ màu trắng) */}
        <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F1F5F9] shrink-0 space-y-2">
          {role === 'employer' ? (
            <Link
              to="/create-project"
              onClick={onCloseMobile}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <i className="fa-solid fa-circle-plus text-xs" />
              <span>+ Đăng dự án mới</span>
            </Link>
          ) : role === 'freelancer' ? (
            <Link
              to="/projects"
              onClick={onCloseMobile}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <i className="fa-solid fa-briefcase text-xs" />
              <span>Tìm việc làm ngay</span>
            </Link>
          ) : role === 'admin' ? (
            <Link
              to="/admin/dashboard"
              onClick={onCloseMobile}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
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
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
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
              className="w-full py-2 bg-white hover:bg-rose-50 text-[#64748B] hover:text-[#DC2626] border border-[#E2E8F0] hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
