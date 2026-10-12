import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Job, Project, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { History, Receipt, Layers, Briefcase } from 'lucide-react';

export const CustomerHistoryPage: React.FC = () => {
  const [data, setData] = useState<{
    jobs?: Job[];
    projects?: Project[];
    payments?: Payment[];
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/customer/history')
      .then((res) => {
        setData(res.data || {});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const payments = data.payments || [];
  const projects = data.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Lịch sử hoạt động & Thanh toán</h1>
          <p className="text-xs text-slate-500 mt-0.5">Sao kê các giao dịch ký quỹ và dự án đã hoàn thành</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Đang tải lịch sử giao dịch...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Transaction Ledger */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" /> Lịch sử giao dịch Ký quỹ & Quyết toán
            </h2>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có giao dịch thanh toán nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Mã giao dịch</th>
                      <th className="py-2.5 px-3">Số tiền</th>
                      <th className="py-2.5 px-3">Phương thức</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((pm) => (
                      <tr key={pm.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono font-medium text-slate-800">
                          {pm.transactionCode}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {formatCurrency(pm.amount)}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{pm.method}</td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={
                              pm.status === 'PAID' || pm.status === 'DISBURSED'
                                ? 'success'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {pm.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{formatDate(pm.createdAt || '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
