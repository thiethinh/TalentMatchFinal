import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Job, Project } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Briefcase, Layers, Plus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/customer/dashboard')
      .then((res) => {
        setStats(res.data.stats);
        setRecentJobs(res.data.recentJobs || []);
        setRecentProjects(res.data.recentProjects || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs font-semibold text-slate-500">Đang tải bảng điều khiển...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Bảng điều khiển Doanh nghiệp</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Theo dõi hoạt động tuyển dụng và tiến độ các hợp đồng dự án có bảo lãnh Escrow</p>
        </div>
        <Link to="/customer/jobs/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" /> Đăng công việc mới
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tin đang tuyển</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{stats.openJobs || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hợp đồng đang chạy</span>
            <p className="text-2xl font-black text-blue-700 mt-2">{stats.activeProjects || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dự án hoàn thành</span>
            <p className="text-2xl font-black text-emerald-700 mt-2">{stats.completedProjects || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng ký quỹ</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(stats.totalSpent || 0)}</p>
          </div>
        </div>
      )}

      {/* Recent Jobs & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" /> Công việc đăng gần đây
            </h2>
            <Link to="/customer/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-medium">Chưa có công việc nào.</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs transition-all">
                  <div>
                    <Link to={`/customer/jobs/${job.id}/applicants`} className="font-bold text-slate-900 hover:text-blue-600 block transition-colors">
                      {job.title}
                    </Link>
                    <p className="text-slate-500 font-medium mt-1">{job.category} • Ngân sách: <span className="font-extrabold text-blue-700">{formatCurrency(job.budget)}</span></p>
                  </div>
                  <Badge variant={job.status === 'OPEN' ? 'brand' : 'neutral'} size="sm">
                    {job.status === 'OPEN' ? 'Đang tuyển' : job.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Hợp đồng gần đây
            </h2>
            <Link to="/customer/projects" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-medium">Chưa có hợp đồng nào.</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs transition-all">
                  <div>
                    <Link to={`/projects/${p.id}`} className="font-bold text-slate-900 hover:text-blue-600 block transition-colors">
                      {p.application?.job?.title || `Hợp đồng #${p.id}`}
                    </Link>
                    <p className="text-slate-500 font-medium mt-1">Freelancer: <span className="font-bold text-slate-700">{p.freelancer?.fullName}</span> • Giá trị: <span className="font-extrabold text-blue-700">{formatCurrency(p.totalPrice)}</span></p>
                  </div>
                  <Badge variant={p.status === 'COMPLETED' ? 'success' : 'escrow'} size="sm">
                    {p.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang thực hiện'}
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
