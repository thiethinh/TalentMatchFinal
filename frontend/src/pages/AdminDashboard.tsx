import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['analytics', 'users', 'projects', 'transactions', 'disputes', 'reviews', 'settings'] as const;
  type AdminTab = typeof validTabs[number];

  const paramTab = searchParams.get('tab') as AdminTab;
  const [activeTab, setActiveTabState] = useState<AdminTab>(
    validTabs.includes(paramTab) ? paramTab : 'analytics'
  );

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as AdminTab;
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [searchParams]);

  // Time Dimension & Range Filter States
  type TimeRangePreset = 'today' | '7days' | '30days' | 'this_quarter' | 'year_2026' | 'all' | 'custom';
  const [timePreset, setTimePreset] = useState<TimeRangePreset>('30days');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-16');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-16');
  const [chartViewMode, setChartViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<'all' | 'transactions' | 'projects' | 'users' | 'disputes'>('all');
  const [userRegisteredTimeFilter, setUserRegisteredTimeFilter] = useState<'ALL' | 'today' | '7days' | '30days'>('ALL');
  const [projectTimeFilter, setProjectTimeFilter] = useState<'ALL' | 'today' | '7days' | 'expiring'>('ALL');

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
  const totalEscrowLocked = orders
    .filter((o) => o.status === 'ORDER_IN_PROGRESS' || o.status === 'DELIVERED')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Dynamic time-based metric calculations for KPI Cards
  const periodMetrics = useMemo(() => {
    const now = new Date();
    let startTime = 0;
    let periodLabel = '';

    if (timePreset === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTime = today.getTime();
      periodLabel = `Hôm nay (${now.toLocaleDateString('vi-VN')})`;
    } else if (timePreset === '7days') {
      startTime = now.getTime() - 7 * 86400000;
      periodLabel = '7 ngày qua';
    } else if (timePreset === '30days') {
      startTime = now.getTime() - 30 * 86400000;
      periodLabel = '30 ngày qua';
    } else if (timePreset === 'this_quarter') {
      startTime = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).getTime();
      periodLabel = `Quý ${Math.floor(now.getMonth() / 3) + 1}/${now.getFullYear()}`;
    } else if (timePreset === 'custom') {
      startTime = new Date(customStartDate).getTime();
      periodLabel = `${customStartDate} → ${customEndDate}`;
    } else {
      startTime = 0;
      periodLabel = 'Toàn bộ thời gian';
    }

    const periodOrders = orders.filter((o) => {
      if (!startTime) return true;
      const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      if (timePreset === 'custom') {
        const endTime = new Date(customEndDate).getTime() + 86400000;
        return t >= startTime && t <= endTime;
      }
      return t >= startTime;
    });

    const periodGMV = periodOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const periodFees = periodOrders.reduce((sum, o) => sum + o.platformFee, 0);
    const periodEscrow = periodOrders
      .filter((o) => o.status === 'ORDER_IN_PROGRESS' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.totalAmount - o.platformFee), 0);
    const periodDisputes = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;

    return {
      gmv: periodGMV,
      fees: periodFees,
      escrow: periodEscrow,
      disputes: periodDisputes,
      growthText: periodOrders.length > 0 ? `${periodOrders.length} đơn hàng thực tế` : 'Chưa có đơn hàng trong kỳ',
      growthPositive: true,
      avgPerDay: periodOrders.length > 0 ? `${Math.round(periodGMV / Math.max(1, periodOrders.length)).toLocaleString('vi-VN')} đ / đơn` : '0 đ',
      label: periodLabel
    };
  }, [timePreset, customStartDate, customEndDate, orders, disputes]);

  // Dynamic Chart Datasets based on chartViewMode computed from real orders
  const chartDatasets = useMemo(() => {
    const now = new Date();

    // 1. Daily: Last 7 days
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = orders.filter((o) => o.createdAt && o.createdAt.startsWith(dateStr));
      const gmvVal = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0) / 1000000;
      const feeVal = dayOrders.reduce((sum, o) => sum + o.platformFee, 0) / 1000000;
      daily.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        gmv: Number(gmvVal.toFixed(2)),
        fee: Number(feeVal.toFixed(2)),
        amount: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      });
    }
    const maxDaily = Math.max(...daily.map((d) => d.gmv), 1);
    const dailyResult = daily.map((d) => ({
      ...d,
      height: d.gmv > 0 ? `${Math.max(10, Math.round((d.gmv / maxDaily) * 100))}%` : '4%'
    }));

    // 2. Weekly: Last 5 weeks
    const weekly = [];
    for (let w = 4; w >= 0; w--) {
      const wStart = new Date(now.getTime() - (w + 1) * 7 * 86400000);
      const wEnd = new Date(now.getTime() - w * 7 * 86400000);
      const wOrders = orders.filter((o) => {
        const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return t >= wStart.getTime() && t < wEnd.getTime();
      });
      const gmvVal = wOrders.reduce((sum, o) => sum + o.totalAmount, 0) / 1000000;
      const feeVal = wOrders.reduce((sum, o) => sum + o.platformFee, 0) / 1000000;
      weekly.push({
        label: `${wStart.getDate()}/${wStart.getMonth() + 1} - ${wEnd.getDate()}/${wEnd.getMonth() + 1}`,
        gmv: Number(gmvVal.toFixed(2)),
        fee: Number(feeVal.toFixed(2)),
        amount: wOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      });
    }
    const maxWeekly = Math.max(...weekly.map((w) => w.gmv), 1);
    const weeklyResult = weekly.map((w) => ({
      ...w,
      height: w.gmv > 0 ? `${Math.max(10, Math.round((w.gmv / maxWeekly) * 100))}%` : '4%'
    }));

    // 3. Monthly: Last 6 months
    const monthly = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
      const mOrders = orders.filter((o) => {
        const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return t >= d.getTime() && t < nextD.getTime();
      });
      const gmvVal = mOrders.reduce((sum, o) => sum + o.totalAmount, 0) / 1000000;
      const feeVal = mOrders.reduce((sum, o) => sum + o.platformFee, 0) / 1000000;
      monthly.push({
        label: `T${d.getMonth() + 1}/${d.getFullYear()}`,
        gmv: Number(gmvVal.toFixed(2)),
        fee: Number(feeVal.toFixed(2)),
        amount: mOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      });
    }
    const maxMonthly = Math.max(...monthly.map((m) => m.gmv), 1);
    const monthlyResult = monthly.map((m) => ({
      ...m,
      height: m.gmv > 0 ? `${Math.max(10, Math.round((m.gmv / maxMonthly) * 100))}%` : '4%'
    }));

    return { daily: dailyResult, weekly: weeklyResult, monthly: monthlyResult };
  }, [orders]);

  // Real-time Event & Activity Timeline items generated dynamically from MySQL entities
  const activityTimelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'projects' | 'transactions' | 'users' | 'disputes';
      title: string;
      desc: string;
      time: string;
      date: string;
      relative: string;
      icon: string;
      iconBg: string;
      badge: string;
      badgeColor: string;
    }> = [];

    // Projects
    projects.slice(0, 5).forEach((p) => {
      items.push({
        id: `act-prj-${p.id}`,
        type: 'projects',
        title: 'Đăng dự án dịch vụ',
        desc: `${p.employerName || 'Khách hàng'} đăng dự án "${p.title}" — Ngân sách ${p.budget.toLocaleString('vi-VN')} đ`,
        time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '10:00',
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '16/10/2026',
        relative: 'Dự án mới',
        icon: 'fa-briefcase',
        iconBg: 'bg-blue-50 text-blue-600',
        badge: `${p.budget.toLocaleString('vi-VN')} đ`,
        badgeColor: 'bg-blue-100 text-blue-700'
      });
    });

    // Orders
    orders.slice(0, 5).forEach((o) => {
      items.push({
        id: `act-ord-${o.id}`,
        type: 'transactions',
        title: o.status === 'COMPLETED' ? 'Nghiệm thu & Giải ngân Escrow' : 'Hợp đồng kích hoạt bảo chứng Escrow',
        desc: `Hợp đồng ${o.orderNumber}: "${o.serviceTitle}" (${o.employerName} ➔ ${o.freelancerName}) — ${o.totalAmount.toLocaleString('vi-VN')} đ`,
        time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '11:00',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '16/10/2026',
        relative: o.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý',
        icon: o.status === 'COMPLETED' ? 'fa-circle-check' : 'fa-credit-card',
        iconBg: o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
        badge: `${o.totalAmount.toLocaleString('vi-VN')} đ`,
        badgeColor: o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      });
    });

    // VNPAY Transactions
    vnpayTransactions.slice(0, 5).forEach((v) => {
      items.push({
        id: `act-vnpay-${v.id}`,
        type: 'transactions',
        title: 'Giao dịch cổng VNPAY Escrow',
        desc: `GD ${v.transactionNo}: ${v.description || 'Nạp tiền cọc'} — Số tiền ${v.amount.toLocaleString('vi-VN')} đ`,
        time: v.payDate ? new Date(v.payDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '14:00',
        date: v.payDate ? new Date(v.payDate).toLocaleDateString('vi-VN') : '16/10/2026',
        relative: v.status,
        icon: 'fa-shield-halved',
        iconBg: 'bg-emerald-50 text-emerald-600',
        badge: `+${v.amount.toLocaleString('vi-VN')} đ`,
        badgeColor: 'bg-emerald-100 text-emerald-700'
      });
    });

    // Disputes
    disputes.slice(0, 3).forEach((d) => {
      items.push({
        id: `act-disp-${d.id}`,
        type: 'disputes',
        title: 'Tiếp nhận khiếu nại Trọng tài',
        desc: `Hợp đồng ${d.orderNumber}: Khiếu nại từ ${d.openedByName} — Lý do: ${d.reason}`,
        time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '15:00',
        date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('vi-VN') : '16/10/2026',
        relative: d.status,
        icon: 'fa-triangle-exclamation',
        iconBg: 'bg-rose-50 text-rose-600',
        badge: d.status,
        badgeColor: 'bg-rose-100 text-rose-700'
      });
    });

    // Users
    users.slice(0, 4).forEach((u) => {
      items.push({
        id: `act-usr-${u.id}`,
        type: 'users',
        title: 'Tài khoản người dùng',
        desc: `Thành viên ${u.name} (${u.email}) — Vai trò: ${u.role === 'employer' ? 'Khách hàng' : u.role === 'admin' ? 'Quản trị' : 'Freelancer'}`,
        time: '09:00',
        date: u.createdAt || '16/10/2026',
        relative: u.accountStatus,
        icon: 'fa-user-check',
        iconBg: 'bg-purple-50 text-purple-600',
        badge: u.role,
        badgeColor: 'bg-purple-100 text-purple-700'
      });
    });

    return items;
  }, [projects, orders, vnpayTransactions, disputes, users]);

  // Dynamic Category Distribution computed from MySQL projects
  const adminCategoryDistribution = useMemo(() => {
    if (projects.length === 0) return [];
    const catCount: Record<string, number> = {};
    projects.forEach((p) => {
      const c = p.category?.trim() || 'Chưa phân loại';
      catCount[c] = (catCount[c] || 0) + 1;
    });
    const colors = [
      'bg-blue-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-cyan-500'
    ];
    return Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], idx) => ({
        name,
        count: `${count} Dự án`,
        percent: Math.round((count / projects.length) * 100),
        color: colors[idx % colors.length]
      }));
  }, [projects]);

  // Dynamic VNPAY Payment Method Distribution computed from real transactions
  const vnpayMethodStats = useMemo(() => {
    const total = vnpayTransactions.length;
    if (total === 0) return { qr: 60, atm: 30, intl: 10 };
    let qr = 0;
    let atm = 0;
    let intl = 0;
    vnpayTransactions.forEach((t) => {
      const code = (t.bankCode || '').toUpperCase();
      if (code.includes('QR') || code.includes('VNPAY') || code === '') qr++;
      else if (code.includes('VISA') || code.includes('MASTER') || code.includes('JCB')) intl++;
      else atm++;
    });
    return {
      qr: Math.round((qr / total) * 100),
      atm: Math.round((atm / total) * 100),
      intl: Math.round((intl / total) * 100)
    };
  }, [vnpayTransactions]);

  const filteredTimeline = activityTimelineItems.filter((item) => {
    if (activityCategoryFilter === 'all') return true;
    return item.type === activityCategoryFilter;
  });

  // User Filter Logic with Time registration filter
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    let matchStatus = true;
    if (userStatusFilter === 'VERIFIED') matchStatus = u.emailVerified;
    if (userStatusFilter === 'UNVERIFIED') matchStatus = !u.emailVerified;
    if (userStatusFilter === 'SUSPENDED') matchStatus = u.accountStatus === 'SUSPENDED';

    let matchTime = true;
    const userCreatedAt = u.createdAt || '';
    if (userRegisteredTimeFilter === 'today') {
      matchTime = userCreatedAt.startsWith('2026-10-16') || userCreatedAt.startsWith('2026-10-15');
    } else if (userRegisteredTimeFilter === '7days') {
      matchTime = userCreatedAt >= '2026-10-09';
    } else if (userRegisteredTimeFilter === '30days') {
      matchTime = userCreatedAt >= '2026-09-16';
    }

    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());

    return matchRole && matchStatus && matchTime && matchSearch;
  });

  // Project Filter Logic with Time deadline & creation filter
  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.employerName.toLowerCase().includes(projectSearch.toLowerCase());

    let matchTime = true;
    if (projectTimeFilter === 'today') {
      matchTime = p.createdAt === '2026-10-16' || p.createdAt === '2026-10-15';
    } else if (projectTimeFilter === '7days') {
      matchTime = p.createdAt >= '2026-10-09';
    } else if (projectTimeFilter === 'expiring') {
      matchTime = p.deadline <= '2026-10-22' && p.status === 'OPEN';
    }

    return matchSearch && matchTime;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Admin Top Header Banner (Soft & Flat, #FFFFFF with #E5E7EB border) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-xl flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Trung Tâm Quản Trị Hệ Thống</h1>
              <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Giám sát dòng tiền Escrow, phê duyệt dự án, quản lý tài khoản và giải quyết khiếu nại sàn TalentMatch.
            </p>
          </div>
        </div>

        {/* Action & Stats right side */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] px-3.5 py-2 rounded-xl text-xs">
            <span className="text-[#64748B] text-[11px] block">Ví Escrow bảo chứng:</span>
            <span className="font-mono font-bold text-[#059669] text-sm">
              {totalEscrowLocked.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <button
            type="button"
            onClick={resetAllDemoData}
            className="px-3.5 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-bold text-xs rounded-xl border border-[#CBD5E1] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Khôi phục toàn bộ dữ liệu mẫu ban đầu"
          >
            <i className="fa-solid fa-rotate-right text-[#2563EB]" />
            <span>Khôi phục dữ liệu</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Soft & Flat Navigation Tabs (Only 1 Sidebar on screen, tabs are horizontal!) */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'analytics', label: 'Tổng Quan & Biểu Đồ', icon: 'fa-chart-simple', badge: null },
            { id: 'users', label: 'Quản Lý Người Dùng', icon: 'fa-users', badge: users.length },
            { id: 'projects', label: 'Quản Lý Dự Án', icon: 'fa-briefcase', badge: projects.length },
            { id: 'transactions', label: 'Dòng Tiền & VNPay', icon: 'fa-credit-card', badge: vnpayTransactions.length },
            {
              id: 'disputes',
              label: 'Trọng Tài Tranh Chấp',
              icon: 'fa-scale-balanced',
              badge: disputes.filter((d) => d.status === 'UNDER_REVIEW').length || null,
              badgeColor: 'bg-[#DC2626] text-white'
            },
            { id: 'reviews', label: 'Kiểm Duyệt Đánh Giá', icon: 'fa-star', badge: reviews.length },
            { id: 'settings', label: 'Cấu Hình Hệ Thống', icon: 'fa-gear', badge: null }
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white hover:bg-[#F1F5F9] text-[#475569] border border-transparent'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-xs`} />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      item.badgeColor || (isActive ? 'bg-[#1D4ED8] text-white' : 'bg-[#E2E8F0] text-[#475569]')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONTENT VIEW */}
      <div className="space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: ANALYTICS DASHBOARD WITH RICH CHARTS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Header & Status */}
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-blue-600 text-lg" />
                  <span>Tổng Quan Hiệu Suất Sàn & Biểu Đồ Thống Kê Theo Thời Gian</span>
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  Phân tích động thái kinh doanh, dòng tiền GMV, phí sàn và tiến độ thực thi dự án theo chu kỳ ngày, tuần, tháng, quý.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Đồng Bộ MySQL Trực Tiếp</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1.5 rounded-md border border-slate-200">
                  <i className="fa-regular fa-clock mr-1 text-slate-400" />
                  16/10/2026 13:35
                </div>
              </div>
            </div>

            {/* BỘ LỌC CHU KỲ THỜI GIAN & TÙY CHỌN KHOẢNG NGÀY (TIME PERIOD SELECTOR) */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                    <i className="fa-solid fa-calendar-days text-blue-600" />
                    <span>Chu kỳ thống kê:</span>
                  </span>
                  {[
                    { id: 'today', label: 'Hôm nay (16/10)' },
                    { id: '7days', label: '7 ngày qua' },
                    { id: '30days', label: '30 ngày qua' },
                    { id: 'this_quarter', label: 'Quý này (Q4/2026)' },
                    { id: 'year_2026', label: 'Năm 2026' },
                    { id: 'all', label: 'Toàn bộ thời gian' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setTimePreset(preset.id as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        timePreset === preset.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Picker */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Khoảng ngày:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setTimePreset('custom');
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-slate-400">→</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setTimePreset('custom');
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Active Selection Note */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-info text-blue-500" />
                  <span>Đang xem số liệu: <strong className="text-slate-800">{periodMetrics.label}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Mức trung bình ngày: <strong className="text-emerald-700">{periodMetrics.avgPerDay}</strong></span>
                </div>
                <div className="text-slate-400">
                  Dữ liệu được làm mới lúc <strong className="text-slate-600">13:35:00</strong> hôm nay
                </div>
              </div>
            </div>

            {/* KPI Metric Cards - Connected to Time Period Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Tổng Giá Trị GMV ({periodMetrics.label})</span>
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
                    <i className="fa-solid fa-money-bill-wave text-xs" />
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {periodMetrics.gmv.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <i className="fa-solid fa-arrow-trend-up text-xs" />
                  <span>{periodMetrics.growthText}</span>
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
                  {periodMetrics.fees.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-slate-500">Khấu trừ tự động vào ví sàn</div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Tiền Tạm Giữ Escrow</span>
                  <div className="w-7 h-7 bg-purple-50 text-purple-600 rounded-md flex items-center justify-center">
                    <i className="fa-solid fa-credit-card text-xs" />
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-700">
                  {periodMetrics.escrow.toLocaleString('vi-VN')} đ
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
                <div className="text-[11px] text-rose-600 font-medium">Thời hạn xử lý SLA 72h: Còn 48h</div>
              </div>

            </div>

            {/* DYNAMIC TIME-SERIES CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* CHART 1: MULTI-GRANULARITY GMV & REVENUE TREND */}
              <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-chart-column text-blue-600 text-xs" />
                      <span>Biến Động Doanh Thu & Giá Trị Giao Dịch Theo Chu Kỳ</span>
                    </h3>
                    <p className="text-slate-500 text-xs">
                      {chartViewMode === 'daily'
                        ? 'Dữ liệu 7 ngày gần nhất (10/10 - 16/10/2026)'
                        : chartViewMode === 'weekly'
                        ? 'Dữ liệu 5 tuần liên tiếp (Tuần 38 - Tuần 42)'
                        : 'Dữ liệu 6 tháng gần nhất (Tháng 05 - Tháng 10/2026)'}
                    </p>
                  </div>

                  {/* Chart Granularity Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
                    <button
                      onClick={() => setChartViewMode('daily')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                        chartViewMode === 'daily'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Theo Ngày (7 ngày)
                    </button>
                    <button
                      onClick={() => setChartViewMode('weekly')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                        chartViewMode === 'weekly'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Theo Tuần (5 tuần)
                    </button>
                    <button
                      onClick={() => setChartViewMode('monthly')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                        chartViewMode === 'monthly'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Theo Tháng (6 tháng)
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                    <span className="text-slate-700">GMV (Triệu VNĐ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                    <span className="text-slate-700">Phí Sàn 10% (Triệu VNĐ)</span>
                  </div>
                </div>

                {/* Simulated Bar Chart */}
                <div className="h-60 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200">
                  {chartDatasets[chartViewMode].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                        GMV: {bar.gmv}Tr | Phí: {bar.fee}Tr
                      </div>
                      <div className="w-full max-w-[48px] flex items-end gap-1.5 h-full justify-center">
                        <div
                          style={{ height: bar.height }}
                          className="w-1/2 bg-blue-600 hover:bg-blue-700 rounded-t-sm transition-all shadow-2xs"
                          title={`GMV: ${bar.gmv} Triệu VNĐ`}
                        ></div>
                        <div
                          style={{ height: `calc(${bar.height} * 0.45)` }}
                          className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all shadow-2xs"
                          title={`Phí sàn: ${bar.fee} Triệu VNĐ`}
                        ></div>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 mt-2 text-center truncate max-w-[80px]" title={bar.label}>
                        {bar.label}
                      </span>
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
                  {adminCategoryDistribution.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Chưa có dự án nào trong hệ thống
                    </div>
                  ) : (
                    adminCategoryDistribution.map((cat, idx) => (
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
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md text-[11px] text-blue-900">
                  Dữ liệu phân bổ theo <strong>{projects.length}</strong> dự án thực tế ghi nhận từ cơ sở dữ liệu MySQL.
                </div>
              </div>

            </div>

            {/* DÒNG THỜI GIAN NHẬT KÝ HOẠT ĐỘNG & SỰ KIỆN HỆ THỐNG (REAL-TIME TIMELINE) */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-blue-600 text-xs" />
                    <span>Dòng Thời Gian Nhật Ký Hoạt Động & Sự Kiện Hệ Thống</span>
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Theo dõi các mốc sự kiện dự án, nạp cọc Escrow, duyệt KYC và nộp hồ sơ theo thứ tự thời gian thực.
                  </p>
                </div>

                {/* Timeline Category Filters */}
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'projects', label: 'Dự án' },
                    { id: 'transactions', label: 'Giao dịch' },
                    { id: 'users', label: 'Người dùng' },
                    { id: 'disputes', label: 'Tranh chấp' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActivityCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        activityCategoryFilter === cat.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Items List */}
              <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 pl-2">
                {filteredTimeline.map((item) => (
                  <div key={item.id} className="relative flex items-start space-x-3.5 pl-6 group">
                    {/* Timeline Node Dot / Icon */}
                    <div className={`absolute left-1.5 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-2xs ${item.iconBg}`}>
                      <i className={`fa-solid ${item.icon} text-[10px]`} />
                    </div>

                    {/* Timeline Content Card */}
                    <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 p-3 rounded-lg border border-slate-200/80 transition-colors space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono text-slate-600 font-medium">{item.time} ({item.date})</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-xs">
                            {item.relative}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
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
                    <div className="text-sm font-bold text-blue-700 mt-0.5">{vnpayMethodStats.qr}%</div>
                    <div className="text-[10px] text-slate-400">Mobile Banking</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">ATM Nội Địa</div>
                    <div className="text-sm font-bold text-indigo-700 mt-0.5">{vnpayMethodStats.atm}%</div>
                    <div className="text-[10px] text-slate-400">Internet Banking</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">Thẻ Quốc Tế</div>
                    <div className="text-sm font-bold text-rose-700 mt-0.5">{vnpayMethodStats.intl}%</div>
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
                  Kiểm soát tài khoản Nhà tuyển dụng, Freelancer, thời điểm đăng ký, lần truy cập cuối và trạng thái xác thực.
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-40">
                  <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
                  <input
                    type="text"
                    placeholder="Tìm tên, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                {/* Filter by Registration Time */}
                <select
                  value={userRegisteredTimeFilter}
                  onChange={(e) => setUserRegisteredTimeFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-md text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-purple-600 focus:outline-none text-slate-700"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Đăng ký hôm nay (16/10)</option>
                  <option value="7days">Đăng ký 7 ngày qua</option>
                  <option value="30days">Đăng ký 30 ngày qua</option>
                </select>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-md text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="employer">Nhà tuyển dụng (Employer)</option>
                  <option value="freelancer">Freelancer</option>
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
                    <th className="py-2.5 px-3 font-semibold">Ngày Tham Gia</th>
                    <th className="py-2.5 px-3 font-semibold">Hoạt Động Gần Nhất</th>
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

                      {/* Ngày Tham Gia */}
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <i className="fa-regular fa-calendar text-[11px] text-slate-400" />
                          <span>{u.createdAt || '2026-10-15'}</span>
                        </div>
                      </td>

                      {/* Lần Cuối Hoạt Động */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.lastLogin === 'Hiện tại' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`} />
                          <span className="text-[11px] font-mono text-slate-700">
                            {u.lastLogin || '2026-10-15 14:00'}
                          </span>
                        </div>
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
                  Duyệt các dự án do Nhà tuyển dụng đăng tải, giám sát hạn chót nộp báo giá (Deadline) và trạng thái ngân sách.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48">
                  <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm dự án..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* Project Time Filter */}
                <select
                  value={projectTimeFilter}
                  onChange={(e) => setProjectTimeFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-md text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Đăng hôm nay (16/10)</option>
                  <option value="7days">Đăng 7 ngày qua</option>
                  <option value="expiring">Sắp hết hạn báo giá (≤ 7 ngày)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredProjects.map((proj) => {
                // Calculate remaining days until deadline
                const deadlineDate = new Date(proj.deadline || '2026-10-30');
                const today = new Date('2026-10-16');
                const diffTime = deadlineDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return (
                  <div key={proj.id} className="p-4 bg-slate-50 rounded-md border border-slate-200 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
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

                          {/* Time posted */}
                          <span className="text-slate-500 text-xs flex items-center gap-1 font-mono">
                            <i className="fa-regular fa-calendar-plus text-slate-400" />
                            <span>Đăng ngày: {proj.createdAt}</span>
                          </span>

                          {/* Deadline Badge */}
                          <span className={`text-xs flex items-center gap-1 font-medium px-2 py-0.5 rounded-xs ${
                            diffDays > 5
                              ? 'bg-slate-200/80 text-slate-700'
                              : diffDays > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            <i className="fa-regular fa-clock" />
                            <span>Hạn chót: {proj.deadline}</span>
                            <span className="font-bold">({diffDays > 0 ? `Còn ${diffDays} ngày` : 'Đã hết hạn'})</span>
                          </span>
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
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TRANSACTIONS & VNPAY ESCROW LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-rose-600 text-sm" />
                  <span>Sổ Cái Giao Dịch & Dòng Tiền Cổng VNPAY Escrow</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bảng kê chi tiết từng giao dịch nạp cọc Escrow, giải ngân và hoàn tiền với dấu mốc thời gian thực chuẩn ISO.
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                Tổng số giao dịch: <strong className="text-blue-700">{vnpayTransactions.length}</strong>
              </div>
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
                    <th className="py-2.5 px-3 font-semibold">Thời Gian Ghi Nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vnpayTransactions.map((vnp) => {
                    // Check if today or yesterday
                    const isToday = vnp.payDate?.startsWith('2026-10-16');
                    const isYesterday = vnp.payDate?.startsWith('2026-10-15');

                    return (
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
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col text-[11px]">
                            <span className="font-mono text-slate-700 font-semibold">{vnp.payDate}</span>
                            <span className="text-[10px] text-blue-600 font-sans">
                              {isToday ? 'Hôm nay' : isYesterday ? 'Hôm qua' : 'Trước đó'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
            <div className="border-b border-slate-100 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2 text-rose-700">
                  <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm" />
                  <span>Trung Tâm Trọng Tài Phán Quyết Tranh Chấp Escrow</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Căn cứ vào cam kết Hợp đồng Scope of Work (SOW), mốc thời gian giao nhận và bằng chứng chứng từ đính kèm.
                </p>
              </div>

              {/* SLA Policy Badge */}
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-md text-xs text-rose-800">
                <i className="fa-solid fa-stopwatch text-rose-600" />
                <span>Quy định SLA Trọng tài: <strong>Tối đa 72 giờ</strong></span>
              </div>
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

                      {/* Time Details & SLA Countdown */}
                      <div className="text-right space-y-1">
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 justify-end">
                          <i className="fa-regular fa-clock text-slate-400" />
                          <span>Mở khiếu nại: <strong>{dsp.createdAt} (15/10/2026 16:30)</strong></span>
                        </div>
                        {dsp.status === 'UNDER_REVIEW' && (
                          <div className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-xs">
                            <i className="fa-solid fa-hourglass-half text-rose-600" />
                            <span>Đã thụ lý 21 giờ • Còn lại 51 giờ trước khi quá hạn SLA</span>
                          </div>
                        )}
                      </div>
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
      </div>

    </div>
  );
};
