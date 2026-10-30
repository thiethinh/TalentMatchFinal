import React, { useState, useMemo } from 'react';
import type { Order, Project } from '../../types';

interface Props {
  userRole: 'freelancer' | 'employer';
  orders: Order[];
  projects: Project[];
}

export const DashboardAnalyticsCharts: React.FC<Props> = ({ userRole, orders, projects }) => {
  // Preset or custom date ranges
  const [rangePreset, setRangePreset] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  
  // Custom Date inputs (defaults to last 30 days)
  const defaultToDate = new Date().toISOString().split('T')[0];
  const defaultFromDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);

  // Hovered bar tooltip state
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Pie chart mode
  const [pieMode, setPieMode] = useState<'status' | 'category'>('status');
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);

  // Update dates when presets change
  const handleSelectPreset = (preset: '7d' | '30d' | '90d') => {
    setRangePreset(preset);
    const to = new Date();
    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
    const from = new Date(Date.now() - days * 86400000);
    setToDate(to.toISOString().split('T')[0]);
    setFromDate(from.toISOString().split('T')[0]);
  };

  // Generate date points for bar chart
  const barChartData = useMemo(() => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const daySpan = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

    // Number of buckets (e.g. 7 buckets for 7d, 10-15 buckets for 30d, 8 buckets for 90d)
    const bucketCount = daySpan <= 7 ? daySpan : daySpan <= 31 ? Math.min(10, daySpan) : 8;
    const bucketSpanDays = Math.max(1, Math.ceil(daySpan / bucketCount));

    const buckets: Array<{
      label: string;
      startDate: Date;
      endDate: Date;
      amount: number;
      count: number;
    }> = [];

    for (let i = 0; i < bucketCount; i++) {
      const bStart = new Date(start.getTime() + i * bucketSpanDays * 86400000);
      const bEnd = new Date(Math.min(end.getTime(), start.getTime() + (i + 1) * bucketSpanDays * 86400000 - 1));
      
      const label = daySpan <= 7 
        ? `${bStart.getDate()}/${bStart.getMonth() + 1}`
        : `${bStart.getDate()}/${bStart.getMonth() + 1} - ${bEnd.getDate()}/${bEnd.getMonth() + 1}`;

      // Calculate amount for this bucket
      let bucketAmount = 0;
      let orderCount = 0;

      orders.forEach((ord) => {
        const ordDate = ord.createdAt ? new Date(ord.createdAt) : new Date();
        if (ordDate >= bStart && ordDate <= bEnd) {
          bucketAmount += userRole === 'freelancer' ? ord.freelancerPayoutAmount : ord.totalAmount;
          orderCount++;
        }
      });

      buckets.push({
        label,
        startDate: bStart,
        endDate: bEnd,
        amount: bucketAmount,
        count: orderCount
      });
    }

    const maxVal = Math.max(...buckets.map((b) => b.amount), 5000000);
    const totalAmount = buckets.reduce((sum, b) => sum + b.amount, 0);
    const totalOrders = buckets.reduce((sum, b) => sum + b.count, 0);
    const avgOrderVal = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;

    return { buckets, maxVal, totalAmount, totalOrders, avgOrderVal };
  }, [fromDate, toDate, orders, userRole]);

  // Color palette for dynamic categories
  const CATEGORY_COLORS = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4',
    '#ec4899', '#f97316', '#6366f1', '#14b8a6', '#64748b'
  ];

  // Pie chart distribution
  const pieData = useMemo(() => {
    if (pieMode === 'status') {
      const statusMap: Record<string, { label: string; count: number; color: string }> = {
        'ORDER_IN_PROGRESS': { label: 'Đang Thực Hiện', count: 0, color: '#3b82f6' },
        'DELIVERED': { label: 'Đã Bàn Giao', count: 0, color: '#f59e0b' },
        'COMPLETED': { label: 'Đã Hoàn Thành', count: 0, color: '#10b981' },
        'REVISION_REQUESTED': { label: 'Yêu Cầu Sửa', count: 0, color: '#ec4899' },
        'DISPUTED': { label: 'Khiếu Nại Tranh Chấp', count: 0, color: '#ef4444' },
        'CANCELLED': { label: 'Đã Hủy', count: 0, color: '#94a3b8' }
      };

      orders.forEach((ord) => {
        let st: string = ord.status;
        if ((st as string) === 'IN_PROGRESS') st = 'ORDER_IN_PROGRESS';
        if (statusMap[st]) {
          statusMap[st].count++;
        }
      });

      const items = Object.values(statusMap).filter((item) => item.count > 0);
      const total = items.reduce((sum, item) => sum + item.count, 0);
      if (total === 0) return [];

      return items.map((item) => ({
        ...item,
        percent: Math.round((item.count / total) * 100)
      }));
    } else {
      // By project categories (dynamic from real MySQL projects)
      const catCounts: Record<string, number> = {};
      projects.forEach((prj) => {
        const cat = prj.category?.trim() || 'Chưa phân loại';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });

      const sorted = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      const total = sorted.reduce((sum, [, count]) => sum + count, 0);
      if (total === 0) return [];

      return sorted.map(([label, count], idx) => ({
        label,
        count,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        percent: Math.round((count / total) * 100)
      }));
    }
  }, [pieMode, orders, projects]);

  const pieTotal = useMemo(() => pieData.reduce((sum, item) => sum + item.count, 0), [pieData]);

  // Calculate SVG Pie/Donut slices using dasharray
  const radius = 65;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
      
      {/* Chart Section Header with Date Range Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shadow-2xs">
              <i className="fa-solid fa-chart-simple" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {userRole === 'freelancer' ? 'Thống Kê Doanh Thu & Hiệu Suất' : 'Thống Kê Chi Phí Tuyển Dụng & Dự Án'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích số liệu giao dịch Escrow và cơ cấu phân bổ trạng thái theo khoảng thời gian thực.
          </p>
        </div>

        {/* Date Filter & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['7d', '30d', '90d'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rangePreset === preset
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset === '7d' ? '7 Ngày' : preset === '30d' ? '30 Ngày' : 'Quý này'}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
            <span className="text-slate-400 font-medium">Từ:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setRangePreset('custom');
              }}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            />
            <span className="text-slate-400 font-medium">đến</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setRangePreset('custom');
              }}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
            <i className="fa-solid fa-money-bill-wave" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {userRole === 'freelancer' ? 'Tổng Doanh Thu Kỳ Này' : 'Tổng Chi Phí Ký Quỹ'}
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-700 font-mono mt-0.5">
              {barChartData.totalAmount.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
            <i className="fa-solid fa-briefcase" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Số Hợp Đồng Trong Kỳ
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-700 font-mono mt-0.5">
              {barChartData.totalOrders} dự án
            </div>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold shrink-0">
            <i className="fa-solid fa-calculator" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Trung Bình / Hợp Đồng
            </div>
            <div className="text-base sm:text-lg font-bold text-purple-700 font-mono mt-0.5">
              {barChartData.avgOrderVal.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* CHART 1: Interactive SVG Column/Bar Chart (7 cols on Desktop) */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-chart-column text-blue-600" />
                <span>Biểu Đồ Cột: {userRole === 'freelancer' ? 'Doanh Thu' : 'Chi Phí'} Theo Khoảng Ngày</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rê chuột lên từng cột để xem chi tiết số tiền và số hợp đồng.
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              Đơn vị: VNĐ
            </span>
          </div>

          {/* SVG Bar Chart Canvas */}
          <div className="relative pt-6 pb-2">
            <svg viewBox="0 0 520 220" className="w-full h-56 overflow-visible">
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = 180 - pct * 150;
                const markAmount = Math.round(barChartData.maxVal * pct);
                return (
                  <g key={idx}>
                    <line x1="45" y1={y} x2="510" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <text x="40" y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">
                      {markAmount >= 1000000 ? `${(markAmount / 1000000).toFixed(1)}M` : `${markAmount / 1000}k`}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {barChartData.buckets.map((b, i) => {
                const barWidth = Math.max(16, Math.min(36, 420 / barChartData.buckets.length - 8));
                const barSpacing = (460 - barWidth) / Math.max(1, barChartData.buckets.length - 1);
                const x = 55 + i * barSpacing;
                const heightPct = barChartData.maxVal > 0 ? Math.min(1, b.amount / barChartData.maxVal) : 0;
                const barHeight = b.amount > 0 ? Math.max(6, heightPct * 150) : 0;
                const y = 180 - barHeight;
                const isHovered = hoveredBarIndex === i;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="cursor-pointer transition-all"
                  >
                    {/* The Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradient)'}
                      className="transition-all duration-200"
                    />

                    {/* Amount tag on top of bar */}
                    {isHovered && (
                      <g>
                        <rect
                          x={x + barWidth / 2 - 38}
                          y={y - 28}
                          width="76"
                          height="22"
                          rx="4"
                          fill="#0f172a"
                          className="shadow-md"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 14}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {b.amount.toLocaleString('vi-VN')} đ
                        </text>
                        <polygon
                          points={`${x + barWidth / 2 - 4},${y - 6} ${x + barWidth / 2 + 4},${y - 6} ${x + barWidth / 2},${y - 2}`}
                          fill="#0f172a"
                        />
                      </g>
                    )}

                    {/* X-axis Label */}
                    <text
                      x={x + barWidth / 2}
                      y="198"
                      textAnchor="middle"
                      fontSize="9"
                      fill={isHovered ? '#1e293b' : '#64748b'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                    >
                      {b.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* CHART 2: Interactive SVG Donut / Pie Chart (5 cols on Desktop) */}
        <div className="lg:col-span-5 bg-slate-50/60 rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-emerald-600" />
              <span>Biểu Đồ Tròn: Tỷ Lệ Phân Bổ</span>
            </h3>

            {/* Toggle Mode */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setPieMode('status')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  pieMode === 'status' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Trạng Thái
              </button>
              <button
                type="button"
                onClick={() => setPieMode('category')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  pieMode === 'category' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Lĩnh Vực
              </button>
            </div>
          </div>

          {/* SVG Donut */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
                {pieData.length === 0 ? (
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                ) : (
                  (() => {
                    let accPercent = 0;
                    return (
                      <>
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#f1f5f9"
                          strokeWidth="22"
                        />
                        {pieData.map((slice, i) => {
                          const dashArray = `${(slice.percent / 100) * circumference} ${circumference}`;
                          const strokeOffset = -((accPercent / 100) * circumference);
                          accPercent += slice.percent;
                          const isHovered = hoveredSliceIndex === i;

                          return (
                            <circle
                              key={i}
                              cx="80"
                              cy="80"
                              r={radius}
                              fill="transparent"
                              stroke={slice.color}
                              strokeWidth={isHovered ? 26 : 22}
                              strokeDasharray={dashArray}
                              strokeDashoffset={strokeOffset}
                              onMouseEnter={() => setHoveredSliceIndex(i)}
                              onMouseLeave={() => setHoveredSliceIndex(null)}
                              className="transition-all duration-200 cursor-pointer"
                            />
                          );
                        })}
                      </>
                    );
                  })()
                )}
              </svg>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {hoveredSliceIndex !== null && pieData[hoveredSliceIndex]
                    ? pieData[hoveredSliceIndex].label
                    : 'Tổng Số'}
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {hoveredSliceIndex !== null && pieData[hoveredSliceIndex]
                    ? `${pieData[hoveredSliceIndex].percent}%`
                    : `${pieTotal}`}
                </span>
              </div>
            </div>

            {/* Legend */}
            {pieData.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs w-full">
                <i className="fa-regular fa-folder-open text-2xl mb-1.5 block text-slate-300" />
                <span>Chưa có dữ liệu {pieMode === 'status' ? 'hợp đồng' : 'dự án'}</span>
              </div>
            ) : (
              <div className="space-y-2 w-full text-xs">
                {pieData.map((item, idx) => {
                  const isHovered = hoveredSliceIndex === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredSliceIndex(idx)}
                      onMouseLeave={() => setHoveredSliceIndex(null)}
                      className={`flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                        isHovered ? 'bg-white shadow-2xs ring-1 ring-slate-200' : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className={`text-[11px] truncate max-w-[130px] ${isHovered ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                        <span className="text-slate-400">{item.count} dự án</span>
                        <strong className="text-slate-800">{item.percent}%</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

