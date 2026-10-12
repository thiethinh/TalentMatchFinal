import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { JobApplication, Project } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Briefcase, Layers, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export const FreelancerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/freelancer/dashboard')
      .then((res) => {
        setStats(res.data.stats);
        setRecentApplications(res.data.recentApplications || []);
        setRecentProjects(res.data.recentProjects || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs font-semibold text-slate-500">Đang tải bảng điều khiển Freelancer...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Bảng điều khiển Freelancer</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Theo dõi các đơn ứng tuyển, tiến độ dự án và thu nhập giải ngân an toàn qua Escrow</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn đã nộp</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalApplications || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang thực hiện</span>
            <p className="text-2xl font-black text-blue-700 mt-2">{stats.activeProjects || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hoàn thành</span>
            <p className="text-2xl font-black text-emerald-700 mt-2">{stats.completedProjects || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thu nhập giải ngân</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(stats.totalEarned || 0)}</p>
          </div>
        </div>
      )}

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Đơn ứng tuyển gần đây
            </h2>
            <Link to="/freelancer/applications" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-medium">Chưa nộp đơn nào.</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs transition-all">
                  <div>
                    <Link to={`/jobs/${app.job?.id}`} className="font-bold text-slate-900 hover:text-blue-600 block transition-colors">
                      {app.job?.title}
                    </Link>
                    <p className="text-slate-500 font-medium mt-1">Báo giá: <span className="font-extrabold text-blue-700">{formatCurrency(app.proposedPrice)}</span> • Nộp lúc: {formatDate(app.createdAt)}</p>
                  </div>
                  <Badge variant={app.status === 'ACCEPTED' ? 'success' : app.status === 'SHORTLISTED' ? 'warning' : 'neutral'} size="sm">
                    {app.status === 'ACCEPTED' ? 'Đã chọn' : app.status === 'SHORTLISTED' ? 'Ưu tiên' : app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Hợp đồng đang chạy
            </h2>
            <Link to="/freelancer/projects" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-medium">Chưa có dự án nào.</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs transition-all">
                  <div>
                    <Link to={`/projects/${p.id}`} className="font-bold text-slate-900 hover:text-blue-600 block transition-colors">
                      {p.application?.job?.title || `Hợp đồng #${p.id}`} • {p.customer?.companyName || p.customer?.fullName}
                    </Link>
                    <p className="text-slate-500 font-medium mt-1">Giá trị: <span className="font-extrabold text-blue-700">{formatCurrency(p.totalPrice)}</span></p>
                  </div>
                  <Badge variant={p.status === 'COMPLETED' ? 'success' : 'escrow'} size="sm">
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
