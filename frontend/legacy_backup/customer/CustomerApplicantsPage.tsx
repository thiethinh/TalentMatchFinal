import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { JobApplication } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, ExternalLink, Star } from 'lucide-react';

export const CustomerApplicantsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = () => {
    setLoading(true);
    apiClient
      .get('/customer/applicants')
      .then((res) => {
        setApplications(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleShortlist = async (id: number) => {
    try {
      await apiClient.post(`/customer/applications/${id}/shortlist`);
      alert('Đã thêm ứng viên vào danh sách tiềm năng (Shortlist).');
      fetchApplicants();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật.');
    }
  };

  const handleAccept = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn chọn ứng viên này và khởi tạo hợp đồng?')) return;
    try {
      const res = await apiClient.post(`/customer/applications/${id}/accept`);
      alert('Đã phê duyệt ứng viên! Hợp đồng đã được tạo.');
      if (res.data?.projectId) {
        window.location.href = `/projects/${res.data.projectId}`;
      } else {
        fetchApplicants();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phê duyệt.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Toàn bộ Ứng viên ứng tuyển</h1>
          <p className="text-xs text-slate-500 mt-0.5">Duyệt hồ sơ đề xuất, phỏng vấn và khởi tạo hợp đồng</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Đang tải danh sách ứng viên...
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có ứng viên nào"
          description="Các đề xuất và thư chào giá từ các Freelancer sẽ xuất hiện tại đây khi họ ứng tuyển vào công việc của bạn."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                    {app.freelancer?.fullName ? app.freelancer.fullName.charAt(0) : 'F'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/freelancers/${app.freelancer?.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {app.freelancer?.fullName}
                      </Link>
                      {app.freelancer?.rating && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {app.freelancer.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ứng tuyển cho:{' '}
                      <Link to={`/jobs/${app.job?.id}`} className="text-blue-600 hover:underline">
                        {app.job?.title}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Giá đề xuất</p>
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(app.proposedPrice)}</p>
                  </div>
                  <Badge
                    variant={
                      app.status === 'ACCEPTED'
                        ? 'success'
                        : app.status === 'SHORTLISTED'
                        ? 'purple'
                        : app.status === 'REJECTED'
                        ? 'danger'
                        : 'brand'
                    }
                  >
                    {app.status === 'SUBMITTED' ? 'Mới nộp' : app.status}
                  </Badge>
                </div>
              </div>

              {/* Proposal Content */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thư chào giá / Proposal</p>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                  {app.proposal}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex items-center gap-4 text-slate-500">
                  <span>Thời gian hoàn thành: <strong>{app.estimatedDays} ngày</strong></span>
                  {app.portfolioLink && (
                    <a
                      href={app.portfolioLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Portfolio <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="text-slate-400">Nộp: {formatDate(app.createdAt || '')}</span>
                </div>

                {app.status === 'SUBMITTED' && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShortlist(app.id)}>
                      Lưu Shortlist
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleAccept(app.id)}>
                      Nhận việc & Ký hợp đồng
                    </Button>
                  </div>
                )}
                {app.status === 'SHORTLISTED' && (
                  <Button variant="primary" size="sm" onClick={() => handleAccept(app.id)}>
                    Nhận việc & Ký hợp đồng
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
