import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { JobApplication, Project, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { History, Receipt, Layers, FileText } from 'lucide-react';

export const FreelancerHistoryPage: React.FC = () => {
  const [data, setData] = useState<{
    applications?: JobApplication[];
    projects?: Project[];
    payments?: Payment[];
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/freelancer/history')
      .then((res) => {
        setData(res.data || {});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const payments = data.payments || [];
  const projects = data.projects || [];
  const applications = data.applications || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Lịch sử sự nghiệp & Thu nhập</h1>
          <p className="text-xs text-slate-500 mt-0.5">Nhật ký các giao dịch giải ngân thù lao và dự án đã tham gia</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Đang tải lịch sử hoạt động...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" /> Thu nhập & Thanh toán nhận được
            </h2>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có giao dịch thu nhập nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Mã giao dịch</th>
                      <th className="py-2.5 px-3">Số tiền nhận</th>
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
                        <td className="py-3 px-3 font-bold text-emerald-600">
                          +{formatCurrency(pm.amount)}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{pm.method}</td>
                        <td className="py-3 px-3">
                          <Badge variant="success" size="sm">
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

          {/* Projects Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Tổng hợp Hợp đồng dự án ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có hợp đồng nào.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.map((p) => (
                  <div key={p.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                      <Link to={`/projects/${p.id}`} className="font-bold text-slate-900 hover:text-blue-600">
                        {p.application?.job?.title || `Hợp đồng #${p.id}`}
                      </Link>
                      <p className="text-slate-500 mt-0.5">Khách hàng: {p.customer?.fullName}</p>
                    </div>
                    <span className="font-bold text-blue-600">{formatCurrency(p.totalPrice)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
