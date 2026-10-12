import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Receipt } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/payments')
      .then((res) => {
        setPayments(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Sổ cái Giao dịch Toàn sàn (Financial Ledger)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Giám sát dòng tiền ký quỹ, giải ngân và đối soát</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải sổ cái giao dịch...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mã giao dịch</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Phương thức</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pm) => (
                  <tr key={pm.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {pm.transactionCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(pm.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{pm.method}</td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(pm.createdAt || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
