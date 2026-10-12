import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import {
  Home,
  Briefcase,
  Users,
  FileText,
  ShieldCheck,
  UserCheck,
  Wallet,
  PlusSquare,
  Shield,
  Layers,
  Settings,
  Scale,
  Sparkles,
  CreditCard,
  User
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    openAuthModal,
    openVNPayModal,
    openWithdrawModal,
    openUserProfileModal
  } = useDemo();

  const role = (currentUser?.role || 'guest').toLowerCase();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-150 group ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm translate-x-0.5'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const iconClass = (isActive: boolean) =>
    `w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm self-start sticky top-24 select-none">
      {/* 1. KHI LÀ KHÁCH (GUEST) */}
      {role === 'guest' && (
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Khám phá sàn
            </p>
            <nav className="space-y-1">
              <NavLink to="/" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Home className={iconClass(isActive)} /> Trang chủ
                  </>
                )}
              </NavLink>
              <NavLink to="/projects" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Briefcase className={iconClass(isActive)} /> Tìm việc / Dự án
                  </>
                )}
              </NavLink>
              <NavLink to="/freelancers" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Users className={iconClass(isActive)} /> Danh sách Freelancer
                  </>
                )}
              </NavLink>
            </nav>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="font-extrabold text-white text-xs">Ký quỹ Escrow VNPAY</p>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Bảo vệ 100% ngân sách thanh toán và quyền lợi bàn giao cho cả 2 bên.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="w-full py-2 text-center text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 rounded-xl shadow-sm transition-all"
            >
              Tham gia ngay
            </button>
          </div>
        </div>
      )}

      {/* 2. FREELANCER */}
      {role === 'freelancer' && (
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Khu vực làm việc
            </p>
            <nav className="space-y-1">
              <NavLink to="/freelancer/dashboard" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Home className={iconClass(isActive)} /> Tổng quan cá nhân
                  </>
                )}
              </NavLink>
              <NavLink to="/projects" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Briefcase className={iconClass(isActive)} /> Tìm việc mới
                  </>
                )}
              </NavLink>
              <NavLink to="/orders/ORD-001" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Layers className={iconClass(isActive)} /> Hợp đồng & Đơn hàng
                  </>
                )}
              </NavLink>
              <NavLink to="/kyc" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <UserCheck className={iconClass(isActive)} /> Xác minh CCCD / eKYC
                  </>
                )}
              </NavLink>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Tài chính & Ví Escrow
            </p>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={openWithdrawModal}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Wallet className="w-4 h-4 text-emerald-600" /> Rút tiền về Ngân hàng
              </button>
              <button
                type="button"
                onClick={openUserProfileModal}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <User className="w-4 h-4 text-slate-400" /> Hồ sơ chuyên môn
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* 3. EMPLOYER / DOANH NGHIỆP */}
      {role === 'employer' && (
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Khu vực tuyển dụng
            </p>
            <nav className="space-y-1">
              <NavLink to="/employer/dashboard" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Home className={iconClass(isActive)} /> Bảng điều khiển
                  </>
                )}
              </NavLink>
              <NavLink to="/create-project" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <PlusSquare className={iconClass(isActive)} /> Đăng dự án mới
                  </>
                )}
              </NavLink>
              <NavLink to="/freelancers" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Users className={iconClass(isActive)} /> Tìm Freelancer
                  </>
                )}
              </NavLink>
              <NavLink to="/orders/ORD-001" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Layers className={iconClass(isActive)} /> Hợp đồng & Milestones
                  </>
                )}
              </NavLink>
              <NavLink to="/kyc" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <UserCheck className={iconClass(isActive)} /> Xác minh doanh nghiệp
                  </>
                )}
              </NavLink>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Thanh toán & Ký quỹ
            </p>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  openVNPayModal({
                    amount: 5000000,
                    orderNumber: 'TOPUP-ESCROW',
                    orderTitle: 'Nạp quỹ bảo đảm Escrow TalentMatch',
                    onPaymentComplete: () => {}
                  })
                }
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <CreditCard className="w-4 h-4 text-blue-600" /> Nạp quỹ Escrow VNPAY
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* 4. ADMIN */}
      {role === 'admin' && (
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Bảng quản trị sàn
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin/dashboard" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Home className={iconClass(isActive)} /> Tổng quan hệ thống
                  </>
                )}
              </NavLink>
              <NavLink to="/projects" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Briefcase className={iconClass(isActive)} /> Quản lý dự án
                  </>
                )}
              </NavLink>
              <NavLink to="/freelancers" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Users className={iconClass(isActive)} /> Quản lý người dùng
                  </>
                )}
              </NavLink>
              <NavLink to="/orders/ORD-001" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Scale className={iconClass(isActive)} /> Tranh chấp Escrow
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </aside>
  );
};
