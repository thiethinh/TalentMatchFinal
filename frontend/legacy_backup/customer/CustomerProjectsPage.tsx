import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Project } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Layers, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

export const CustomerProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/customer/projects')
      .then((res) => {
        setProjects(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge variant="brand" dot pulse>Đang thực hiện</Badge>;
      case 'WAITING_PAYMENT':
        return <Badge variant="warning" dot>Chờ nạp ký quỹ</Badge>;
      case 'WAITING_ACCEPTANCE':
        return <Badge variant="purple" dot>Chờ nghiệm thu</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" dot>Đã hoàn thành</Badge>;
      case 'DISPUTED':
        return <Badge variant="danger" dot>Đang khiếu nại</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Hợp đồng & Dự án đang thuê</h1>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi tiến độ bàn giao, giải ngân cột mốc và ký hợp đồng</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Đang tải danh sách dự án...
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Chưa có hợp đồng nào"
          description="Bạn chưa có dự án nào đang chạy. Hãy đăng việc hoặc chấp thuận đề xuất của ứng viên để khởi tạo hợp đồng."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all shadow-sm hover:shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-slate-400">Hợp đồng #{p.id}</span>
                  {getStatusBadge(p.status)}
                </div>

                <Link to={`/projects/${p.id}`} className="block group">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {p.application?.job?.title || 'Dự án Freelance'}
                  </h2>
                </Link>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <p>
                    Freelancer đảm nhiệm: <span className="font-semibold text-slate-900">{p.freelancer?.fullName}</span>
                  </p>
                  <p>
                    Tổng giá trị: <span className="font-bold text-blue-600">{formatCurrency(p.totalPrice)}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(p.createdAt || '')}
                </span>
                <Link
                  to={`/projects/${p.id}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Quản lý mốc & Nghiệm thu <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
