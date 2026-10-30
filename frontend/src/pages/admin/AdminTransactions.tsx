import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Pagination } from '../../components/common/Pagination';

export const AdminTransactions: React.FC = () => {
  const { vnpayTransactions, orders } = useApp();

  // Search & Filter States
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('ALL');
  const [txStatusFilter, setTxStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered Transactions
  const filteredTxs = useMemo(() => {
    return vnpayTransactions.filter((vnp) => {
      // Type filter
      if (txTypeFilter !== 'ALL' && vnp.type !== txTypeFilter) return false;

      // Status filter
      if (txStatusFilter !== 'ALL' && vnp.status !== txStatusFilter) return false;

      // Search match
      if (txSearch.trim()) {
        const q = txSearch.toLowerCase();
        const no = (vnp.transactionNo || '').toLowerCase();
        const ord = (vnp.orderNumber || '').toLowerCase();
        const bank = (vnp.bankCode || '').toLowerCase();
        const desc = (vnp.description || '').toLowerCase();
        return no.includes(q) || ord.includes(q) || bank.includes(q) || desc.includes(q);
      }

      return true;
    });
  }, [vnpayTransactions, txTypeFilter, txStatusFilter, txSearch]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [txTypeFilter, txStatusFilter, txSearch]);

  // Pagination calculations
  const totalItems = filteredTxs.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTxs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTxs.slice(start, start + pageSize);
  }, [filteredTxs, currentPage, pageSize]);

  // Financial Summary Metrics
  const summary = useMemo(() => {
    const totalCount = vnpayTransactions.length;
    const totalDeposit = vnpayTransactions
      .filter((t) => t.type === 'ESCROW_DEPOSIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPayout = vnpayTransactions
      .filter((t) => t.type === 'PAYOUT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalRefund = vnpayTransactions
      .filter((t) => t.type === 'REFUND')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const activeEscrow = orders
      .filter((o) => o.status === 'ORDER_IN_PROGRESS' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { totalCount, totalDeposit, totalPayout, totalRefund, activeEscrow };
  }, [vnpayTransactions, orders]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Header */}
      <AdminHeader
        title="Sổ Cái Giao Dịch & Cổng VNPAY Escrow"
        subtitle="Bảng kê chi tiết từng phiên nạp cọc bảo chứng Escrow, lệnh giải ngân tiền công và hoàn trả tiền cọc cho khách hàng."
        icon="fa-credit-card"
        badge={`${vnpayTransactions.length} giao dịch`}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng nạp cọc Escrow</div>
          <div className="text-xl font-extrabold text-blue-700 mt-1 font-mono">
            {summary.totalDeposit.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Tiền nạp vào bảo chứng</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng đã giải ngân</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">
            {summary.totalPayout.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Thanh toán cho Freelancer</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng đã hoàn tiền</div>
          <div className="text-xl font-extrabold text-amber-600 mt-1 font-mono">
            {summary.totalRefund.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Hoàn lại cho Employer</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang khóa trong Escrow</div>
          <div className="text-xl font-extrabold text-purple-700 mt-1 font-mono">
            {summary.activeEscrow.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">Bảo lãnh đơn đang chạy</div>
        </div>
      </div>

      {/* Main Transactions Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-receipt text-blue-600 text-sm" />
              <span>Bảng Kê Chi Tiết Giao Dịch</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredTxs.length} bản ghi
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lọc theo mã tham chiếu, mã hợp đồng, ngân hàng hoặc trạng thái xử lý giao dịch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                placeholder="Tìm mã GD, mã đơn..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả loại giao dịch</option>
              <option value="ESCROW_DEPOSIT">Nạp Cọc Escrow</option>
              <option value="PAYOUT">Giải Ngân Tiền Công</option>
              <option value="REFUND">Hoàn Tiền Cọc</option>
            </select>

            <select
              value={txStatusFilter}
              onChange={(e) => setTxStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">SUCCESS (Thành công)</option>
              <option value="PENDING">PENDING (Đang chờ)</option>
              <option value="FAILED">FAILED (Thất bại)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-3.5 font-semibold">Mã GD VNPAY</th>
                <th className="py-3 px-3.5 font-semibold">Mã Hợp Đồng</th>
                <th className="py-3 px-3.5 font-semibold">Loại Giao Dịch</th>
                <th className="py-3 px-3.5 font-semibold">Phương Thức / Ngân Hàng</th>
                <th className="py-3 px-3.5 font-semibold">Số Tiền (VND)</th>
                <th className="py-3 px-3.5 font-semibold">Trạng Thái</th>
                <th className="py-3 px-3.5 font-semibold">Thời Gian Ghi Nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTxs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    <i className="fa-solid fa-file-invoice text-2xl mb-2 block" />
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              ) : (
                paginatedTxs.map((vnp) => (
                  <tr key={vnp.id} className="hover:bg-slate-50/80 transition-colors font-mono">
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {vnp.transactionNo}
                    </td>

                    <td className="py-3 px-3.5 text-blue-700 font-bold">
                      {vnp.orderNumber || 'N/A'}
                    </td>

                    <td className="py-3 px-3.5 font-sans font-medium">
                      {vnp.type === 'ESCROW_DEPOSIT' ? (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px] font-bold">
                          <i className="fa-solid fa-shield-halved text-[10px]" />
                          <span>Nạp Cọc Escrow</span>
                        </span>
                      ) : vnp.type === 'PAYOUT' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] font-bold">
                          <i className="fa-solid fa-arrow-down text-[10px]" />
                          <span>Giải Ngân Tiền Công</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-bold">
                          <i className="fa-solid fa-rotate-left text-[10px]" />
                          <span>Hoàn Tiền Cọc</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 font-sans text-slate-700 font-medium">
                      <span className="font-bold text-slate-900">{vnp.bankCode || 'VNPAY'}</span>
                      {vnp.cardType && <span className="text-slate-500 text-[11px]"> ({vnp.cardType})</span>}
                    </td>

                    <td className="py-3 px-3.5 font-bold text-slate-900 text-xs">
                      {(vnp.amount || 0).toLocaleString('vi-VN')} đ
                    </td>

                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          vnp.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : vnp.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {vnp.status}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-slate-600 text-[11px]">
                      {vnp.payDate || '2026-10-16 12:00'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

