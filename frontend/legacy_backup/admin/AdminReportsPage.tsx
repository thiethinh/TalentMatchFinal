import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Flag, CheckCircle, XCircle } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    apiClient
      .get('/admin/reports')
      .then((res) => {
        setReports(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReview = async (id: number, action: string) => {
    try {
      await apiClient.post(`/admin/reports/${id}/review?action=${action}`);
      alert(`Đã xử lý báo cáo: ${action}`);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý báo cáo.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Xử lý Báo cáo Vi phạm & Khiếu nại</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kiểm tra tố cáo gian lận, quấy rối hoặc nội dung sai lệch</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách báo cáo...</div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">Không có báo cáo vi phạm nào tồn đọng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Lý do</th>
                  <th className="py-3 px-4">Chi tiết tố cáo</th>
                  <th className="py-3 px-4">Người báo cáo</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày gửi</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.reason}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">{r.details}</td>
                    <td className="py-3.5 px-4 text-slate-500">{r.reporter?.fullName || 'Người dùng'}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.status === 'PENDING' ? 'warning' : 'neutral'} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(r.createdAt || '')}</td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReview(r.id, 'RESOLVED')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Xác nhận xử lý"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(r.id, 'DISMISSED')}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Bác bỏ báo cáo"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
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
