import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Job } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, Users, Edit, PauseCircle, PlayCircle } from 'lucide-react';

export const CustomerJobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicantCounts, setApplicantCounts] = useState<{ [id: number]: number }>({});
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || 'ALL';

  const fetchJobs = () => {
    setLoading(true);
    apiClient.get(`/customer/jobs?status=${status}`)
      .then((res) => {
        setJobs(res.data.jobs || []);
        setApplicantCounts(res.data.applicantCounts || {});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  const changeStatus = async (jobId: number, newStatus: string) => {
    try {
      await apiClient.post(`/customer/jobs/${jobId}/status?status=${newStatus}`);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Quản lý Công việc đã đăng</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Theo dõi hồ sơ ứng tuyển và quản lý vòng đời tin tuyển dụng</p>
        </div>
        <Link to="/customer/jobs/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" /> Đăng công việc mới
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'OPEN', 'PAUSED', 'CLOSED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setSearchParams({ status: st })}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              status === st
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'Tất cả' : st === 'OPEN' ? 'Đang tuyển' : st === 'PAUSED' ? 'Tạm ẩn' : st === 'CLOSED' ? 'Đã đóng' : 'Đã hủy'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          Đang tải danh sách công việc...
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-2">
          <p className="font-extrabold text-slate-900 text-sm">Chưa có công việc nào trong danh mục này</p>
          <p className="text-xs text-slate-500 font-medium">Bấm "Đăng công việc mới" để bắt đầu tìm kiếm nhân tài.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {jobs.map((job) => {
            const count = applicantCounts[job.id] || 0;
            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 transition-all shadow-md shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === 'OPEN' ? 'brand' : 'neutral'} size="sm">
                      {job.status === 'OPEN' ? 'Đang tuyển' : job.status}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">• Đăng ngày {formatDate(job.createdAt)}</span>
                  </div>

                  <Link to={`/customer/jobs/${job.id}/applicants`}>
                    <h2 className="text-base font-black text-slate-900 hover:text-blue-600 transition-colors">
                      {job.title}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                    <span>Lĩnh vực: <span className="text-slate-800 font-semibold">{job.category}</span></span>
                    <span>•</span>
                    <span>Ngân sách: <span className="font-black text-blue-700">{formatCurrency(job.budget)}</span></span>
                    <span>•</span>
                    <span>Hạn chót: {formatDate(job.deadline)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/customer/jobs/${job.id}/applicants`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" /> Ứng viên ({count})
                  </Link>

                  {job.status === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeStatus(job.id, 'PAUSED')}
                    >
                      <PauseCircle className="w-3.5 h-3.5" /> Tạm ẩn
                    </Button>
                  )}

                  {job.status === 'PAUSED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeStatus(job.id, 'OPEN')}
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Mở lại
                    </Button>
                  )}

                  {job.status !== 'CLOSED' && job.status !== 'CANCELLED' && (
                    <Link
                      to={`/customer/jobs/${job.id}/edit`}
                      className="p-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Chỉnh sửa tin"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
