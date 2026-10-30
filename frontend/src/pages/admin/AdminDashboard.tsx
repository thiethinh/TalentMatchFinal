import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Pagination } from '../../components/common/Pagination';

export const AdminDashboard: React.FC = () => {
  const {
    projects,
    orders,
    disputes,
    vnpayTransactions
  } = useApp();

  // Time Dimension & Range Filter States
  type TimeRangePreset = 'today' | '7days' | '30days' | 'this_quarter' | 'year_2026' | 'all' | 'custom';
  const [timePreset, setTimePreset] = useState<TimeRangePreset>('30days');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-16');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-16');
  const [chartViewMode, setChartViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [activeChartMetric, setActiveChartMetric] = useState<'gmv' | 'fee'>('gmv');
  const [pieMode, setPieMode] = useState<'status' | 'category'>('status');

  // Pagination for Recent Activities Ledger
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 8;

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
      ordersCount: periodOrders.length,
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
        completedProjects: dayOrders.filter((o) => o.status === 'COMPLETED').length
      });
    }

    // 2. Weekly: 4 weeks
    const weekly = [];
    for (let w = 3; w >= 0; w--) {
      const wStart = now.getTime() - (w + 1) * 7 * 86400000;
      const wEnd = now.getTime() - w * 7 * 86400000;
      const wOrders = orders.filter((o) => {
        const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return t >= wStart && t < wEnd;
      });
      const gmvVal = wOrders.reduce((sum, o) => sum + o.totalAmount, 0) / 1000000;
      const feeVal = wOrders.reduce((sum, o) => sum + o.platformFee, 0) / 1000000;
      weekly.push({
        label: `Tuần ${4 - w}`,
        gmv: Number(gmvVal.toFixed(2)),
        fee: Number(feeVal.toFixed(2)),
        completedProjects: wOrders.filter((o) => o.status === 'COMPLETED').length
      });
    }

    // 3. Monthly: Months in 2026
    const monthly = [
      { label: 'T07/26', gmv: 0, fee: 0, completedProjects: 0 },
      { label: 'T08/26', gmv: 0, fee: 0, completedProjects: 0 },
      { label: 'T09/26', gmv: 0, fee: 0, completedProjects: 0 },
      { label: 'T10/26', gmv: 0, fee: 0, completedProjects: 0 },
      { label: 'T11/26', gmv: 0, fee: 0, completedProjects: 0 },
      { label: 'T12/26', gmv: 0, fee: 0, completedProjects: 0 }
    ];

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const parts = o.createdAt.split('-');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10);
        if (m >= 7 && m <= 12) {
          const idx = m - 7;
          monthly[idx].gmv += o.totalAmount / 1000000;
          monthly[idx].fee += o.platformFee / 1000000;
          if (o.status === 'COMPLETED') monthly[idx].completedProjects += 1;
        }
      }
    });

    monthly.forEach((m) => {
      m.gmv = Number(m.gmv.toFixed(2));
      m.fee = Number(m.fee.toFixed(2));
    });

    return { daily, weekly, monthly };
  }, [orders]);

  const currentPoints = chartDatasets[chartViewMode];
  const maxMetricVal = Math.max(
    ...currentPoints.map((p) => (activeChartMetric === 'gmv' ? p.gmv : p.fee)),
    5
  );

  // Dynamic Pie Distribution based on Real Database
  const statusDistribution = useMemo(() => {
    const counts = {
      IN_PROGRESS: projects.filter((p) => p.status === 'IN_PROGRESS').length,
      COMPLETED: projects.filter((p) => p.status === 'COMPLETED').length,
      OPEN: projects.filter((p) => p.status === 'OPEN').length,
      CANCELLED: projects.filter((p) => p.status === 'CANCELLED').length
    };
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return [
      { label: 'Đang Thực Hiện', count: counts.IN_PROGRESS, pct: Math.round((counts.IN_PROGRESS / total) * 100), color: '#2563EB' },
      { label: 'Đã Hoàn Thành', count: counts.COMPLETED, pct: Math.round((counts.COMPLETED / total) * 100), color: '#059669' },
      { label: 'Đang Mở Tuyển', count: counts.OPEN, pct: Math.round((counts.OPEN / total) * 100), color: '#D97706' },
      { label: 'Đã Hủy / Đóng', count: counts.CANCELLED, pct: Math.round((counts.CANCELLED / total) * 100), color: '#DC2626' }
    ].filter((s) => s.count > 0);
  }, [projects]);

  const categoryDistribution = useMemo(() => {
    const catMap: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category || 'Khác';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const total = projects.length || 1;
    const colors = ['#2563EB', '#059669', '#8B5CF6', '#D97706', '#06B6D4', '#EC4899', '#F97316', '#64748B'];
    return Object.entries(catMap).map(([cat, count], idx) => ({
      label: cat,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[idx % colors.length]
    }));
  }, [projects]);

  const activePieData = pieMode === 'status' ? statusDistribution : categoryDistribution;
  const pieTotalCount = activePieData.reduce((sum, d) => sum + d.count, 0);

  // Recent Activities
  const recentActivities = useMemo(() => {
    const list: any[] = [];
    vnpayTransactions.forEach((tx) => {
      list.push({
        id: `act-tx-${tx.id}`,
        type: 'VNPAY',
        icon: 'fa-credit-card',
        iconBg: 'bg-emerald-50 text-emerald-600',
        title: tx.description || 'Giao dịch Escrow VNPAY',
        desc: `Số tiền: ${tx.amount.toLocaleString('vi-VN')} đ • ${tx.userEmail}`,
        date: tx.payDate
      });
    });
    projects.forEach((p) => {
      list.push({
        id: `act-prj-${p.id}`,
        type: 'PROJECT',
        icon: 'fa-briefcase',
        iconBg: 'bg-blue-50 text-blue-600',
        title: `Dự án: ${p.title}`,
        desc: `Người đăng: ${p.employerName} • Ngân sách: ${p.budget.toLocaleString('vi-VN')} đ`,
        date: p.createdAt
      });
    });
    disputes.forEach((d) => {
      list.push({
        id: `act-disp-${d.id}`,
        type: 'DISPUTE',
        icon: 'fa-triangle-exclamation',
        iconBg: 'bg-rose-50 text-rose-600',
        title: `Khiếu nại: Đơn ${d.orderNumber}`,
        desc: `Lý do: ${d.reason}`,
        date: d.createdAt
      });
    });
    return list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [vnpayTransactions, projects, disputes]);

  // Paginated activities
  const totalActivityPages = Math.ceil(recentActivities.length / activityPageSize) || 1;
  const paginatedActivities = recentActivities.slice(
    (activityPage - 1) * activityPageSize,
    activityPage * activityPageSize
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <AdminHeader
        title="Tổng Quan Hiệu Suất Sàn & Biểu Đồ Thống Kê"
        subtitle="Phân tích động thái kinh doanh, dòng tiền GMV, phí sàn và tiến độ thực thi dự án theo chu kỳ ngày, tuần, tháng, quý."
        icon="fa-chart-simple"
      />

      {/* Time Range Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 mr-1">
            <i className="fa-solid fa-calendar-days text-blue-600" />
            <span>Chu kỳ thống kê:</span>
          </span>
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: '7days', label: '7 ngày qua' },
            { id: '30days', label: '30 ngày qua' },
            { id: 'this_quarter', label: 'Quý này' },
            { id: 'year_2026', label: 'Năm 2026' },
            { id: 'all', label: 'Toàn bộ' }
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTimePreset(preset.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timePreset === preset.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Khoảng ngày:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => {
              setCustomStartDate(e.target.value);
              setTimePreset('custom');
            }}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
          />
          <span className="text-slate-400">→</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => {
              setCustomEndDate(e.target.value);
              setTimePreset('custom');
            }}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
          />
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Tổng GMV ({periodMetrics.label})</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-money-bill-wave text-xs" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {periodMetrics.gmv.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up text-[10px]" />
            <span>{periodMetrics.ordersCount} đơn hàng thực tế</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Doanh Thu Phí Sàn (10%)</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-sack-dollar text-xs" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono">
            {periodMetrics.fees.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Khấu trừ tự động vào ví sàn
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Tiền Tạm Giữ Escrow</span>
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <i className="fa-solid fa-vault text-xs" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-purple-700 font-mono">
            {periodMetrics.escrow.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Bảo đảm trong cổng VNPAY
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Tranh Chấp Cần Xử Lý</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <i className="fa-solid fa-scale-balanced text-xs" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-rose-700 font-mono">
            {periodMetrics.disputes} vụ
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            Thời hạn xử lý SLA 72h
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-chart-column text-blue-600" />
                <span>Biểu Đồ Doanh Thu & Dòng Tiền GMV</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Đơn vị: Triệu Đồng (VND)</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setChartViewMode('daily')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartViewMode === 'daily' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('weekly')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartViewMode === 'weekly' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Tuần
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('monthly')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartViewMode === 'monthly' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Tháng
                </button>
              </div>

              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setActiveChartMetric('gmv')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    activeChartMetric === 'gmv' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  GMV
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartMetric('fee')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    activeChartMetric === 'fee' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Phí Sàn
                </button>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {currentPoints.map((pt, idx) => {
              const val = activeChartMetric === 'gmv' ? pt.gmv : pt.fee;
              const heightPct = Math.max(8, Math.round((val / maxMetricVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {val.toFixed(1)}M
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end h-48 overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full transition-all duration-300 rounded-t-lg ${
                        activeChartMetric === 'gmv'
                          ? 'bg-blue-600 group-hover:bg-blue-700'
                          : 'bg-emerald-600 group-hover:bg-emerald-700'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-full">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Distribution 1/3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-emerald-600" />
              <span>Tỷ Lệ Phân Bổ</span>
            </h3>

            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-[11px]">
              <button
                type="button"
                onClick={() => setPieMode('status')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  pieMode === 'status' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Trạng thái
              </button>
              <button
                type="button"
                onClick={() => setPieMode('category')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  pieMode === 'category' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Lĩnh vực
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 rounded-full border-8 border-blue-500/80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tổng số</div>
                <div className="text-xl font-extrabold text-slate-900 font-mono">{pieTotalCount}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {activePieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-700 truncate">{d.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                  <span className="text-slate-500">{d.count} dự án</span>
                  <span className="font-bold text-slate-900">{d.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities Ledger with Pagination */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-blue-600" />
            <span>Nhật Ký Hoạt Động & Giao Dịch Mới Nhất</span>
          </div>
          <span className="text-xs text-slate-500">
            Tổng cộng: <strong className="text-blue-700">{recentActivities.length}</strong> hoạt động
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {paginatedActivities.map((act) => (
            <div key={act.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${act.iconBg} flex items-center justify-center text-xs shrink-0`}>
                  <i className={`fa-solid ${act.icon}`} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{act.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{act.desc}</div>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 shrink-0">
                {act.date || 'Hôm nay'}
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={activityPage}
          totalPages={totalActivityPages}
          totalItems={recentActivities.length}
          pageSize={activityPageSize}
          onPageChange={setActivityPage}
        />
      </div>
    </div>
  );
};
