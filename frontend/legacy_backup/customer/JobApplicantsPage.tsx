import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Job, JobApplication } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Star, CheckCircle, ThumbsDown, ArrowLeft } from 'lucide-react';

export const JobApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isSingleJob = Boolean(id);

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = () => {
    setLoading(true);
    const endpoint = isSingleJob ? `/customer/jobs/${id}/applicants` : `/customer/applicants`;
    apiClient.get(endpoint)
      .then((res) => {
        if (isSingleJob) {
          setJob(res.data.job);
          setApplications(res.data.applications || []);
        } else {
          setApplications(res.data.applications || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, [id, isSingleJob]);

  const handleShortlist = async (appId: number, value: boolean) => {
    try {
      await apiClient.post(`/customer/applications/${appId}/shortlist?value=${value}`);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleAccept = async (appId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn chọn Freelancer này và tạo Hợp đồng dự án?')) return;
    try {
      const res = await apiClient.post(`/customer/applications/${appId}/accept`);
      alert('Đã chấp thuận ứng viên và tạo hợp đồng thành công!');
      window.location.href = `/projects/${res.data.projectId}`;
    } catch (err: any) {
      alert(err.message || 'Lỗi khi chấp thuận.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <div>
          {isSingleJob && (
            <Link to="/customer/jobs" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-2 font-bold">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách tin
            </Link>
          )}
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {job ? `Ứng viên cho: ${job.title}` : 'Quản lý toàn bộ Ứng viên'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Xem hồ sơ, so sánh báo giá đề xuất và lựa chọn đối tác phù hợp
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          Đang tải danh sách ứng viên...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-2">
          <p className="font-extrabold text-slate-900 text-sm">Chưa có ứng viên nào nộp hồ sơ</p>
          <p className="text-xs text-slate-500 font-medium">Các đề xuất báo giá mới từ Freelancer sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-5"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 border border-white/20 shadow-xs flex items-center justify-center font-black text-base text-white flex-shrink-0">
                    {app.freelancer?.fullName?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <Link to={`/freelancers/${app.freelancer?.id}`} className="font-black text-base text-slate-900 hover:text-blue-600 transition-colors">
                      {app.freelancer?.fullName}
                    </Link>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{app.freelancer?.professionalTitle || app.freelancer?.field || 'Freelancer'}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-700 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{app.freelancer?.rating?.toFixed(1) || '5.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="md:text-right flex-shrink-0">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Báo giá đề xuất</span>
                  <span className="text-xl font-black text-blue-700 block mt-0.5">{formatCurrency(app.proposedPrice)}</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Thời gian hoàn thành: <span className="font-bold text-slate-700">{app.estimatedDays} ngày</span></p>
                </div>
              </div>

              {/* Proposal Text */}
              <div className="text-xs text-slate-700 space-y-2">
                <span className="font-extrabold text-slate-900 block">Nội dung đề xuất giải pháp:</span>
                <p className="whitespace-pre-line leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 font-medium">
                  {app.proposal}
                </p>
                {app.portfolioLink && (
                  <p className="pt-1 flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-semibold">Portfolio đính kèm: </span>
                    <a href={app.portfolioLink} target="_blank" rel="noreferrer" className="text-blue-700 font-bold hover:underline">
                      {app.portfolioLink}
                    </a>
                  </p>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Nộp ngày {formatDate(app.createdAt)}</span>
                  <span>•</span>
                  <Badge
                    variant={
                      app.status === 'ACCEPTED' ? 'success' :
                      app.status === 'SHORTLISTED' ? 'warning' :
                      app.status === 'REJECTED' ? 'danger' : 'neutral'
                    }
                    size="sm"
                  >
                    {app.status === 'ACCEPTED' ? 'Đã chọn' :
                     app.status === 'SHORTLISTED' ? 'Ưu tiên' :
                     app.status === 'REJECTED' ? 'Đã từ chối' : 'Mới nộp'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {app.status === 'SUBMITTED' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShortlist(app.id, false)}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> Từ chối
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleShortlist(app.id, true)}
                      >
                        Ưu tiên
                      </Button>
                    </>
                  )}

                  {app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAccept(app.id)}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Chấp thuận & Tạo hợp đồng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
