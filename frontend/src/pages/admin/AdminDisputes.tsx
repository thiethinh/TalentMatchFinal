import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Pagination } from '../../components/common/Pagination';

export const AdminDisputes: React.FC = () => {
  const { disputes, orders, resolveDispute } = useApp();

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNDER_REVIEW' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filtered Disputes
  const filteredDisputes = useMemo(() => {
    return disputes.filter((dsp) => {
      // Status filter
      if (statusFilter === 'UNDER_REVIEW' && dsp.status !== 'UNDER_REVIEW') return false;
      if (statusFilter === 'RESOLVED' && dsp.status === 'UNDER_REVIEW') return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const related = orders.find((o) => o.id === dsp.orderId || o.orderNumber === dsp.orderNumber);
        const ord = (dsp.orderNumber || '').toLowerCase();
        const emp = (related?.employerName || '').toLowerCase();
        const free = (related?.freelancerName || '').toLowerCase();
        const reason = (dsp.reason || '').toLowerCase();
        return ord.includes(q) || emp.includes(q) || free.includes(q) || reason.includes(q);
      }

      return true;
    });
  }, [disputes, orders, statusFilter, searchQuery]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  // Pagination calculations
  const totalItems = filteredDisputes.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedDisputes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisputes.slice(start, start + pageSize);
  }, [filteredDisputes, currentPage, pageSize]);

  // Metrics summary
  const summary = useMemo(() => {
    const total = disputes.length;
    const underReview = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
    const resolved = disputes.filter((d) => d.status !== 'UNDER_REVIEW').length;
    const totalDisputedAmount = disputes.reduce((sum, d) => {
      const related = orders.find((o) => o.id === d.orderId || o.orderNumber === d.orderNumber);
      return sum + (related?.totalAmount || 0);
    }, 0);
    return { total, underReview, resolved, totalDisputedAmount };
  }, [disputes, orders]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Header */}
      <AdminHeader
        title="Trung Tâm Trọng Tài & Xử Lý Tranh Chấp"
        subtitle="Hội đồng giải quyết khiếu nại giữa Khách hàng và Freelancer, phân xử giải ngân tiền cọc bảo chứng Escrow minh bạch."
        icon="fa-scale-balanced"
        badge={`${summary.underReview} vụ cần xử lý`}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng khiếu nại</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{summary.total}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Lịch sử khiếu nại</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chờ phân xử</div>
          <div className="text-xl font-extrabold text-rose-600 mt-1 font-mono">{summary.underReview}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">SLA phản hồi: 72h</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã giải quyết</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">{summary.resolved}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Đã ra phán quyết</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiền tranh chấp</div>
          <div className="text-base font-extrabold text-blue-700 mt-1 font-mono truncate">
            {summary.totalDisputedAmount.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Trong ví Escrow</div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-gavel text-rose-600 text-sm" />
              <span>Danh Sách Vụ Tranh Chấp & Khiếu Nại</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredDisputes.length} hồ sơ
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xem xét tài liệu, trao đổi 2 bên và thực hiện phân bổ tiền bảo chứng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên bên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({disputes.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('UNDER_REVIEW')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'UNDER_REVIEW'
                    ? 'bg-white text-rose-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chờ xử lý ({summary.underReview})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-white text-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã giải quyết ({summary.resolved})
              </button>
            </div>
          </div>
        </div>

        {/* Dispute Cards List */}
        <div className="p-4 sm:p-5 space-y-4">
          {paginatedDisputes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fa-solid fa-scale-balanced text-3xl mb-2 block text-emerald-500" />
              Không có tranh chấp nào cần giải quyết. Hệ thống vận hành an toàn!
            </div>
          ) : (
            paginatedDisputes.map((dsp) => {
              const isPending = dsp.status === 'UNDER_REVIEW';
              const relatedOrder = orders.find((o) => o.id === dsp.orderId || o.orderNumber === dsp.orderNumber);
              const amount = relatedOrder?.totalAmount || 0;
              const employerName = relatedOrder?.employerName || dsp.openedByName || 'Khách hàng';
              const freelancerName = relatedOrder?.freelancerName || 'Freelancer';
              const evidence = dsp.evidenceNotes;

              return (
                <div
                  key={dsp.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3.5 ${
                    isPending
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  {/* Top Bar: Order ID, Status, Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-blue-700 text-sm bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {dsp.orderNumber}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                          isPending
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                            : dsp.status === 'RESOLVED_EMPLOYER'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : dsp.status === 'RESOLVED_FREELANCER'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isPending
                          ? 'ĐANG CHỜ HỘI ĐỒNG PHÂN XỬ'
                          : dsp.status === 'RESOLVED_EMPLOYER'
                          ? 'ĐÃ HOÀN TIỀN CHO EMPLOYER'
                          : dsp.status === 'RESOLVED_FREELANCER'
                          ? 'ĐÃ GIẢI NGÂN CHO FREELANCER'
                          : 'ĐÃ CHIA 50/50'}
                      </span>

                      <span className="text-slate-400 text-xs font-mono">
                        Mã khiếu nại: #{dsp.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Giá trị hợp đồng tranh chấp:</div>
                      <div className="text-base font-extrabold text-rose-600 font-mono">
                        {amount.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>

                  {/* Parties Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Bên Thuê (Employer):</span>
                      <strong className="text-slate-900">{employerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Bên Làm (Freelancer):</span>
                      <strong className="text-slate-900">{freelancerName}</strong>
                    </div>
                  </div>

                  {/* Reason & Evidence */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500 mr-1" />
                        Lý do mở tranh chấp:
                      </span>
                      <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-medium">
                        "{dsp.reason}"
                      </p>
                    </div>

                    {evidence && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">
                          <i className="fa-solid fa-paperclip text-blue-500 mr-1" />
                          Bằng chứng đính kèm:
                        </span>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-blue-600 text-[11px] font-mono">
                          {evidence}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arbitration Actions */}
                  {isPending && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
                      <span className="text-xs text-slate-500 font-bold mr-2">Quyết định phán quyết:</span>

                      <button
                        type="button"
                        onClick={() => resolveDispute(dsp.id, 'RESOLVED_EMPLOYER')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-rotate-left" />
                        <span>Hoàn Tiền 100% Cho Employer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => resolveDispute(dsp.id, 'RESOLVED_FREELANCER')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-hand-holding-dollar" />
                        <span>Giải Ngân 100% Cho Freelancer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => resolveDispute(dsp.id, 'PARTIAL_REFUND')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-scale-balanced" />
                        <span>Chia Hòa Giải 50/50</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Universal Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
