import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Job } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Briefcase, CheckCircle, PauseCircle, XCircle } from 'lucide-react';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    setLoading(true);
    apiClient
      .get('/admin/jobs')
      .then((res) => {
        setJobs(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiClient.post(`/admin/jobs/${id}/status?status=${status}`);
      alert(`Đã cập nhật trạng thái tin thành ${status}!`);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Kiểm duyệt Tin tuyển dụng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Giám sát các tin đăng dự án, tạm dừng hoặc đóng tin vi phạm</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách tin...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Tiêu đề dự án</th>
                  <th className="py-3 px-4">Doanh nghiệp đăng</th>
                  <th className="py-3 px-4">Ngân sách</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Kiểm duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      <Link to={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{job.customer?.fullName}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{formatCurrency(job.budget)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={job.status === 'OPEN' ? 'brand' : job.status === 'CLOSED' ? 'danger' : 'neutral'}
                        size="sm"
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(job.createdAt || '')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status !== 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(job.id, 'OPEN')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Mở lại tin"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(job.id, 'PAUSED')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Tạm dừng tin"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        )}
                        {job.status !== 'CLOSED' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(job.id, 'CLOSED')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Đóng tin vĩnh viễn"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
