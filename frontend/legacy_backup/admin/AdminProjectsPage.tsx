import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Project } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Layers, ArrowRight, ShieldAlert } from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/projects')
      .then((res) => {
        setProjects(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Giám sát Toàn bộ Hợp đồng Dự án</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kiểm soát tiến độ các dự án trên sàn và can thiệp kịp thời</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách hợp đồng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mã hợp đồng</th>
                  <th className="py-3 px-4">Dự án</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Freelancer</th>
                  <th className="py-3 px-4">Giá trị</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">#{p.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {p.application?.job?.title || 'Hợp đồng dự án'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.customer?.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.freelancer?.fullName}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{formatCurrency(p.totalPrice)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          p.status === 'COMPLETED'
                            ? 'success'
                            : p.status === 'DISPUTED'
                            ? 'danger'
                            : p.status === 'IN_PROGRESS'
                            ? 'brand'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/projects/${p.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
