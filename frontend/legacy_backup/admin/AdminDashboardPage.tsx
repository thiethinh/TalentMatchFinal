import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Badge } from '../../components/ui/Badge';
import {
  Shield,
  Users,
  Briefcase,
  Layers,
  Flag,
  Scale,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/dashboard')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        Đang tải bảng điều khiển Quản trị...
      </div>
    );
  }

  const stats = data?.stats || {};
  const latestUsers = data?.latestUsers || [];
  const latestReports = data?.latestReports || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Trung tâm Quản trị Sàn (Admin Hub)</h1>
            <p className="text-xs text-slate-500 mt-0.5">Giám sát tổng thể hoạt động, an ninh tài chính và tranh chấp</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Freelancer</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.freelancers || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Doanh nghiệp</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.customers || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Tin đang tuyển</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.openJobs || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Tranh chấp cần xử lý</span>
            <Scale className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{stats.disputes || 0}</p>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Người dùng mới đăng ký
            </h2>
            <Link to="/admin/users" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              Quản lý <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {latestUsers.map((u: any) => (
              <div key={u.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{u.fullName}</p>
                  <p className="text-slate-500 text-[11px]">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.role === 'ADMIN' ? 'purple' : u.role === 'CUSTOMER' ? 'brand' : 'neutral'} size="sm">
                    {u.role}
                  </Badge>
                  {u.locked && <Badge variant="danger" size="sm">Khóa</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Reports */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" /> Báo cáo vi phạm chờ duyệt
            </h2>
            <Link to="/admin/reports" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              Xử lý <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {latestReports.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Không có báo cáo vi phạm nào.</p>
          ) : (
            <div className="space-y-2.5">
              {latestReports.map((r: any) => (
                <div key={r.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{r.reason || 'Báo cáo vi phạm'}</p>
                    <p className="text-slate-500 text-[11px] truncate max-w-xs">{r.details}</p>
                  </div>
                  <Badge variant={r.status === 'PENDING' ? 'warning' : 'neutral'} size="sm">
                    {r.status}
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
