import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import type { AccountStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    projects,
    orders,
    reviews,
    disputes,
    vnpayTransactions,
    platformConfig,
    updatePlatformConfig,
    adminUpdateUserStatus,
    adminToggleEmailVerified,
    adminUpdateProjectStatus,
    resolveDispute,
    deleteReview,
    resetAllDemoData
  } = useDemo();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'users' | 'projects' | 'transactions' | 'disputes' | 'reviews' | 'settings'
  >('analytics');

  // Filter states
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'employer' | 'freelancer' | 'admin'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'SUSPENDED'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Setting inputs
  const [feePercent, setFeePercent] = useState(platformConfig.platformFeePercent);
  const [autoAcceptHours, setAutoAcceptHours] = useState(platformConfig.autoAcceptHours);
  const [minDeposit, setMinDeposit] = useState(platformConfig.minDepositAmount);

  // Financial calculations
  const totalGMV = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalPlatformFees = orders.reduce((acc, o) => acc + o.platformFee, 0);
  const totalEscrowLocked = orders
    .filter((o) => o.status === 'ORDER_IN_PROGRESS' || o.status === 'DELIVERED')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // User Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    let matchStatus = true;
    if (userStatusFilter === 'VERIFIED') matchStatus = u.emailVerified;
    if (userStatusFilter === 'UNVERIFIED') matchStatus = !u.emailVerified;
    if (userStatusFilter === 'SUSPENDED') matchStatus = u.accountStatus === 'SUSPENDED';

    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());

    return matchRole && matchStatus && matchSearch;
  });

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.employerName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformConfig({
      platformFeePercent: feePercent,
      autoAcceptHours: autoAcceptHours,
      minDepositAmount: minDeposit,
      disputeResolutionDays: platformConfig.disputeResolutionDays
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* 1. MODERN LEFT SIDEBAR */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-md">
        
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-xs">
            <i className="fa-solid fa-shield-halved text-sm" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide">TalentMatch</div>
            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Super Admin Portal</div>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-3 space-y-1 flex-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">
            Quản trị & Giám sát
          </div>

          {[
            { id: 'analytics', label: 'Tổng Quan & Biểu Đồ', icon: 'fa-chart-simple', badge: null },
            { id: 'users', label: 'Quản Lý Người Dùng', icon: 'fa-users', badge: users.length },
            { id: 'projects', label: 'Quản Lý Dự Án', icon: 'fa-briefcase', badge: projects.length },
            { id: 'transactions', label: 'Dòng Tiền & Cổng VNPay', icon: 'fa-credit-card', badge: vnpayTransactions.length },
            {
              id: 'disputes',
              label: 'Trọng Tài Tranh Chấp',
              icon: 'fa-triangle-exclamation',
              badge: disputes.filter((d) => d.status === 'UNDER_REVIEW').length || null,
              badgeColor: 'bg-rose-500 text-white'
            },
            { id: 'reviews', label: 'Kiểm Duyệt Đánh Giá', icon: 'fa-star', badge: reviews.length },
            { id: 'settings', label: 'Cấu Hình Hệ Thống', icon: 'fa-gear', badge: null }
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <i className={`fa-solid ${item.icon} text-xs w-4 text-center ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      item.badgeColor || (isActive ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-md border border-slate-700/60 space-y-0.5">
            <div className="text-[10px] text-slate-400">Escrow Trọng tài:</div>
            <div className="font-mono font-bold text-emerald-400 text-xs">
              {totalEscrowLocked.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[9px] text-slate-500">Đang giữ an toàn tại ví sàn</div>
          </div>

          <button
            onClick={resetAllDemoData}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right text-blue-400 text-[10px]" />
            <span>Khôi phục dữ liệu gốc</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT VIEW */}
      <main className="flex-1 p-5 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* ========================================================================= */}
        {/* TAB 1: ANALYTICS DASHBOARD WITH RICH CHARTS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-blue-600 text-lg" />
                  <span>Tổng Quan Hiệu Suất Sàn & Biểu Đồ Thống Kê</span>
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  Giám sát thời gian thực tổng giá trị giao dịch GMV, doanh thu phí sàn 10%, dòng tiền VNPay và tỷ lệ tranh chấp.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Hệ Thống Đang Vận Hành Ổn Định</span>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Tổng Giá Trị GMV</span>
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
                    <i className="fa-solid fa-money-bill-wave text-xs" />
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {totalGMV.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <i className="fa-solid fa-arrow-trend-up text-xs" />
                  <span>+18.5% so với tháng trước</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Doanh Thu Phí Sàn (10%)</span>
                  <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center">
                    <i className="fa-solid fa-arrow-trend-up text-xs" />
                  </div>
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {totalPlatformFees.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-slate-500">Doanh thu thu về thực tế</div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Tiền Tạm Giữ Escrow</span>
                  <div className="w-7 h-7 bg-purple-50 text-purple-600 rounded-md flex items-center justify-center">
                    <i className="fa-solid fa-credit-card text-xs" />
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-700">
                  {totalEscrowLocked.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-purple-600 font-medium">Bảo đảm trong cổng VNPAY</div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Tranh Chấp Cần Xử Lý</span>
                  <div className="w-7 h-7 bg-rose-50 text-rose-600 rounded-md flex items-center justify-center">
                    <i className="fa-solid fa-triangle-exclamation text-xs" />
                  </div>
                </div>
                <div className="text-xl font-bold text-rose-600">
                  {disputes.filter((d) => d.status === 'UNDER_REVIEW').length} vụ
                </div>
                <div className="text-[11px] text-rose-600 font-medium">Tỷ lệ xử lý thành công 100%</div>
              </div>

            </div>

            {/* INTERACTIVE SVG / TAILWIND CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* CHART 1: MONTHLY GMV & REVENUE TREND */}
              <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-chart-simple text-purple-600 text-xs" />
                      <span>Biểu Đồ Doanh Thu & GMV Theo Tháng</span>
                    </h3>
                    <p className="text-slate-500 text-xs">Thống kê từ Tháng 05/2026 đến Tháng 09/2026</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                      <span className="text-slate-700">GMV (Tr đ)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                      <span className="text-slate-700">Phí Sàn 10%</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Bar Chart */}
                <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200">
                  {[
                    { month: 'T05/26', gmv: 35, fee: 3.5, height: '40%' },
                    { month: 'T06/26', gmv: 52, fee: 5.2, height: '55%' },
                    { month: 'T07/26', gmv: 68, fee: 6.8, height: '70%' },
                    { month: 'T08/26', gmv: 85, fee: 8.5, height: '85%' },
                    { month: 'T09/26', gmv: 110, fee: 11.0, height: '100%' }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-1.5 py-0.5 rounded-xs shadow">
                        {bar.gmv}Tr / {bar.fee}Tr
                      </div>
                      <div className="w-full max-w-[40px] flex items-end gap-1 h-full justify-center">
                        <div
                          style={{ height: bar.height }}
                          className="w-1/2 bg-blue-600 hover:bg-blue-700 rounded-t-sm transition-all"
                          title={`GMV: ${bar.gmv} Triệu`}
                        ></div>
                        <div
                          style={{ height: `calc(${bar.height} * 0.45)` }}
                          className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all"
                          title={`Phí sàn: ${bar.fee} Triệu`}
                        ></div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 mt-2 text-center">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHART 2: PROJECT CATEGORY DISTRIBUTION */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-chart-pie text-indigo-600 text-xs" />
                    <span>Phân Bổ Dự Án Theo Ngành Nghề</span>
                  </h3>
                  <p className="text-slate-500 text-xs">Tỷ trọng nhu cầu tuyển dụng hiện nay</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { name: 'IT & Lập trình Web/App', percent: 45, color: 'bg-blue-600', count: '142 Dự án' },
                    { name: 'Thiết kế UI/UX & Branding', percent: 30, color: 'bg-indigo-600', count: '95 Dự án' },
                    { name: 'Video & Animation TikTok', percent: 15, color: 'bg-purple-600', count: '48 Dự án' },
                    { name: 'Digital Marketing & Content', percent: 10, color: 'bg-emerald-500', count: '32 Dự án' }
                  ].map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-700 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-xs ${cat.color}`}></span>
                          <span>{cat.name}</span>
                        </span>
                        <span>{cat.percent}% ({cat.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                        <div
                          style={{ width: `${cat.percent}%` }}
                          className={`h-full ${cat.color} rounded-sm transition-all`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md text-[11px] text-blue-900">
                  Nhu cầu tuyển Freelancer Full-Stack ReactJS/Flutter và UI/UX Designer chiếm trên <strong>75%</strong> tổng ngân sách toàn sàn.
                </div>
              </div>

            </div>

            {/* CHART 3 & RECENT ACTIVITY LEDGER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* VNPAY Flow Status */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-rose-600 text-xs" />
                  <span>Dòng Tiền Thanh Toán Qua Cổng VNPAY Gateway</span>
                </h3>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">VNPAY-QR</div>
                    <div className="text-sm font-bold text-blue-700 mt-0.5">62%</div>
                    <div className="text-[10px] text-slate-400">Mobile Banking</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">ATM Nội Địa</div>
                    <div className="text-sm font-bold text-indigo-700 mt-0.5">28%</div>
                    <div className="text-[10px] text-slate-400">Internet Banking</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">Thẻ Quốc Tế</div>
                    <div className="text-sm font-bold text-rose-700 mt-0.5">10%</div>
                    <div className="text-[10px] text-slate-400">Visa/MasterCard</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                  <div className="bg-slate-50 px-3.5 py-1.5 font-semibold text-slate-600 border-b border-slate-200">
                    Giao Dịch VNPAY Mới Nhất
                  </div>
                  <div className="divide-y divide-slate-100">
                    {vnpayTransactions.slice(0, 3).map((vnp) => (
                      <div key={vnp.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 font-mono text-[11px]">{vnp.transactionNo}</div>
                          <div className="text-[10px] text-slate-500">{vnp.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">+{vnp.amount.toLocaleString('vi-VN')} đ</div>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            {vnp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Account Verification Ratio */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-users text-purple-600 text-xs" />
                  <span>Trạng Thái Xác Thực & An Toàn Người Dùng</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-md border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-sm" />
                      <div>
                        <div className="font-bold text-emerald-900">Tài khoản đã xác thực email & KYC</div>
                        <div className="text-[10px] text-emerald-700">Được phép đăng dự án, nộp proposal và rút tiền</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-emerald-700">
                      {users.filter((u) => u.emailVerified).length} / {users.length}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-md border border-amber-200">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-exclamation text-amber-600 text-sm" />
                      <div>
                        <div className="font-bold text-amber-900">Tài khoản chưa xác thực (Pending)</div>
                        <div className="text-[10px] text-amber-700">Bị giới hạn hành động bởi Action Guard</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-amber-700">
                      {users.filter((u) => !u.emailVerified).length}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-rose-50 rounded-md border border-rose-200">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-lock text-rose-600 text-sm" />
                      <div>
                        <div className="font-bold text-rose-900">Tài khoản bị khóa (Suspended)</div>
                        <div className="text-[10px] text-rose-700">Vi phạm chính sách liên hệ ngoài sàn</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-rose-700">
                      {users.filter((u) => u.accountStatus === 'SUSPENDED').length}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
            
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <i className="fa-solid fa-users text-purple-600 text-sm" />
                  <span>Quản Lý Người Dùng & Phân Quyền Hệ Thống</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm soát tài khoản Nhà tuyển dụng, Freelancer, trạng thái xác thực email và phân xử khóa tài khoản.
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-44">
                  <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
                  <input
                    type="text"
                    placeholder="Tìm tên, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-md text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="employer">Nhà tuyển dụng (Employer)</option>
                  <option value="freelancer">Ứng viên (Freelancer)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-md text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="VERIFIED">✓ Đã xác thực</option>
                  <option value="UNVERIFIED">! Chưa xác thực</option>
                  <option value="SUSPENDED">🔒 Đang bị khóa</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-semibold">Người Dùng</th>
                    <th className="py-2.5 px-3 font-semibold">Email / Liên Hệ</th>
                    <th className="py-2.5 px-3 font-semibold">Vai Trò</th>
                    <th className="py-2.5 px-3 font-semibold">Xác Thực Email</th>
                    <th className="py-2.5 px-3 font-semibold">Trạng Thái TK</th>
                    <th className="py-2.5 px-3 font-semibold">Số Dư Khả Dụng</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            {u.companyName && <div className="text-[10px] text-slate-500 font-medium">{u.companyName}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-400 font-mono">{u.phone}</div>}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-sm font-bold uppercase text-[10px] ${
                          u.role === 'freelancer'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : u.role === 'employer'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        {u.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <i className="fa-solid fa-circle-check text-[10px] text-emerald-600" />
                            <span>✓ Đã xác thực</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                            <i className="fa-solid fa-circle-exclamation text-[10px] text-amber-600" />
                            <span>! Chưa xác thực</span>
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <select
                          value={u.accountStatus}
                          onChange={(e) => adminUpdateUserStatus(u.id, e.target.value as AccountStatus)}
                          className={`text-[11px] font-semibold rounded-md px-2 py-1 border focus:outline-none ${
                            u.accountStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : u.accountStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PENDING">PENDING</option>
                          <option value="SUSPENDED">SUSPENDED (Khóa)</option>
                          <option value="RESTRICTED">RESTRICTED</option>
                        </select>
                      </td>

                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                        {(u.balance || 0).toLocaleString('vi-VN')} đ
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => adminToggleEmailVerified(u.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                            u.emailVerified
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                          }`}
                          title="Chuyển đổi trạng thái xác thực email"
                        >
                          <i className="fa-solid fa-envelope-circle-check text-xs" />
                          <span>{u.emailVerified ? 'Hủy xác thực' : 'Xác thực ngay'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROJECT RECRUITMENT MODERATION */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <i className="fa-solid fa-briefcase text-blue-600 text-sm" />
                  <span>Quản Lý & Kiểm Duyệt Bài Tuyển Dụng Dự Án</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Duyệt các dự án do Nhà tuyển dụng đăng tải, giám sát ngân sách và ngăn chặn vi phạm.
                </p>
              </div>

              <div className="relative w-56">
                <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
                <input
                  type="text"
                  placeholder="Tìm kiếm dự án..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredProjects.map((proj) => (
                <div key={proj.id} className="p-4 bg-slate-50 rounded-md border border-slate-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                          {proj.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          proj.status === 'OPEN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proj.status === 'IN_PROGRESS'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {proj.status}
                        </span>
                        <span className="text-slate-400 text-xs">• Ngày tạo: {proj.createdAt}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{proj.title}</h3>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Người đăng: <strong>{proj.employerName}</strong> {proj.employerCompany && `(${proj.employerCompany})`}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">Ngân sách:</div>
                      <div className="text-base font-bold text-blue-700">{proj.budget.toLocaleString('vi-VN')} đ</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{proj.proposalsCount} Báo giá gửi đến</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {proj.requiredSkills.map((sk) => (
                        <span key={sk} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-1.5 py-0.5 rounded-xs">
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.status === 'OPEN' ? (
                        <button
                          onClick={() => adminUpdateProjectStatus(proj.id, 'CANCELLED')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-md border border-rose-200 text-xs cursor-pointer transition-colors"
                        >
                          Tạm Dừng / Hủy Bài
                        </button>
                      ) : (
                        <button
                          onClick={() => adminUpdateProjectStatus(proj.id, 'OPEN')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-md border border-emerald-200 text-xs cursor-pointer transition-colors"
                        >
                          Kích Hoạt Lại
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TRANSACTIONS & VNPAY ESCROW LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3.5">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <i className="fa-solid fa-credit-card text-rose-600 text-sm" />
                <span>Sổ Cái Giao Dịch & Dòng Tiền Cổng VNPAY Escrow</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảng kê mọi giao dịch nạp cọc Escrow qua VNPAY, giải ngân cho Freelancer và thu phí sàn 10%.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-semibold">Mã Giao Dịch VNPAY</th>
                    <th className="py-2.5 px-3 font-semibold">Mã Đơn / Dự Án</th>
                    <th className="py-2.5 px-3 font-semibold">Loại Giao Dịch</th>
                    <th className="py-2.5 px-3 font-semibold">Phương Thức / Ngân Hàng</th>
                    <th className="py-2.5 px-3 font-semibold">Số Tiền (VND)</th>
                    <th className="py-2.5 px-3 font-semibold">Trạng Thái</th>
                    <th className="py-2.5 px-3 font-semibold">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vnpayTransactions.map((vnp) => (
                    <tr key={vnp.id} className="hover:bg-slate-50 transition-colors font-mono">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{vnp.transactionNo}</td>
                      <td className="py-2.5 px-3 text-blue-700 font-bold">{vnp.orderNumber || 'N/A'}</td>
                      <td className="py-2.5 px-3 font-sans font-medium">
                        {vnp.type === 'ESCROW_DEPOSIT' ? (
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-xs">Nạp Cọc Escrow</span>
                        ) : vnp.type === 'PAYOUT' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs">Giải Ngân Tiền Công</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-xs">Hoàn Tiền</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 font-medium">
                        {vnp.bankCode} ({vnp.cardType})
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 text-xs">
                        {vnp.amount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                          {vnp.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{vnp.payDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DISPUTE RESOLUTION CENTER */}
        {/* ========================================================================= */}
        {activeTab === 'disputes' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3.5">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2 text-rose-700">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm" />
                <span>Trung Tâm Trọng Tài Phán Quyết Tranh Chấp Escrow</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Căn cứ vào cam kết Hợp đồng Scope of Work (SOW) và bằng chứng giao nộp để giải quyết công bằng.
              </p>
            </div>

            {disputes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">Hiện tại không có tranh chấp nào cần xử lý.</div>
            ) : (
              <div className="space-y-3">
                {disputes.map((dsp) => (
                  <div key={dsp.id} className="border border-rose-200 bg-rose-50/20 rounded-lg p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{dsp.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                            dsp.status === 'UNDER_REVIEW' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {dsp.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700">Bên mở khiếu nại: <strong>{dsp.openedByName}</strong></div>
                      </div>

                      <div className="text-xs text-slate-500">Ngày tạo: {dsp.createdAt}</div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div><strong className="text-slate-900">Lý do tranh chấp:</strong> {dsp.reason}</div>
                      <div className="bg-white p-2.5 rounded-md border border-rose-200 text-slate-700 italic">
                        <strong>Bằng chứng chứng từ đính kèm:</strong> {dsp.evidenceNotes}
                      </div>
                    </div>

                    {dsp.status === 'UNDER_REVIEW' && (
                      <div className="pt-2.5 flex flex-wrap items-center gap-2.5 border-t border-rose-200 text-xs">
                        <span className="font-bold text-slate-900">Phán quyết:</span>
                        <button
                          onClick={() => resolveDispute(dsp.id, 'RESOLVED_EMPLOYER')}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors shadow-2xs cursor-pointer"
                        >
                          Hoàn Tiền 100% Cho Employer
                        </button>
                        <button
                          onClick={() => resolveDispute(dsp.id, 'RESOLVED_FREELANCER')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors shadow-2xs cursor-pointer"
                        >
                          Giải Ngân 100% Cho Freelancer
                        </button>
                        <button
                          onClick={() => resolveDispute(dsp.id, 'PARTIAL_REFUND')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors shadow-2xs cursor-pointer"
                        >
                          Chia 50/50
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REVIEW GOVERNANCE */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3.5">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <i className="fa-solid fa-star text-amber-500 text-sm" />
                <span>Kiểm Duyệt & Quản Lý Đánh Giá Đơn Hàng</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Giám sát review 2 chiều giữa Employer và Freelancer, loại bỏ đánh giá ảo hoặc mang tính quấy rối.
              </p>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50 rounded-md border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-slate-900">{rev.reviewerName}</span>
                        <span className="text-slate-500"> đánh giá cho </span>
                        <strong className="text-blue-700">{rev.targetName}</strong>
                        <span className="text-slate-400 text-[10px] ml-2">({rev.date})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-amber-500 font-bold">
                        <span>{rev.rating}</span>
                        <i className="fa-solid fa-star text-amber-400 text-xs ml-1" />
                      </div>
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Xóa đánh giá vi phạm"
                      >
                        <i className="fa-solid fa-trash-can text-xs" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-700 italic bg-white p-2.5 rounded-md border border-slate-200">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span>Chất lượng: ⭐ {rev.qualityRating || 5}/5</span>
                    <span>Đúng hạn: ⭐ {rev.deadlineRating || 5}/5</span>
                    <span>Giao tiếp: ⭐ {rev.communicationRating || 5}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PLATFORM SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3.5">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <i className="fa-solid fa-gear text-purple-600 text-sm" />
                <span>Cài Đặt Tham Số & Tích Hợp Cổng Thanh Toán</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình tỷ lệ phần trăm phí sàn, thời gian tự động nghiệm thu và thông tin sandbox VNPAY.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phần trăm Phí Nền Tảng Sàn (% Platform Fee):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={feePercent}
                    onChange={(e) => setFeePercent(Number(e.target.value))}
                    min={0}
                    max={30}
                    className="w-28 p-2 bg-slate-50 border border-slate-300 rounded-md font-bold text-purple-700 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                  <span className="font-bold text-slate-700 text-xs">% (Mặc định: 10%)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thời Gian Đếm Ngược Tự Động Nghiệm Thu (Giờ):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={autoAcceptHours}
                    onChange={(e) => setAutoAcceptHours(Number(e.target.value))}
                    min={24}
                    max={168}
                    className="w-28 p-2 bg-slate-50 border border-slate-300 rounded-md font-bold text-slate-900 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                  <span className="font-bold text-slate-700 text-xs">Giờ (Mặc định: 72 giờ = 3 ngày)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mức Tiền Nạp Tối Thiểu Vào Escrow (VND):
                </label>
                <input
                  type="number"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(Number(e.target.value))}
                  step={50000}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-bold text-slate-900 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
                  <span>Cấu hình VNPAY Sandbox API:</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600 space-y-0.5">
                  <div>vnp_TmnCode: <strong className="text-slate-900">TALENTMATCH_SANDBOX</strong></div>
                  <div>vnp_HashSecret: <strong className="text-slate-900">9704198526191432152SECRETKEY</strong></div>
                  <div>vnp_Url: <span className="text-blue-600">https://sandbox.vnpayment.vn/paymentv2/vpcpay.html</span></div>
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-check text-xs" />
                <span>Lưu Cấu Hình Hệ Thống</span>
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
};
