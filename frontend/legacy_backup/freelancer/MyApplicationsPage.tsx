import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { JobApplication } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FileText } from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    setLoading(true);
    apiClient.get('/freelancer/applications')
      .then((res) => setApplications(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển này?')) return;
    try {
      await apiClient.post(`/freelancer/applications/${id}/withdraw`);
      alert('Đã rút đơn ứng tuyển.');
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi rút đơn.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Đơn ứng tuyển của tôi</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Theo dõi phản hồi và trạng thái các báo giá bạn đã gửi cho khách hàng</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          Đang tải danh sách đơn ứng tuyển...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="font-extrabold text-slate-900 text-sm">Bạn chưa nộp đơn ứng tuyển nào</p>
          <p className="text-xs text-slate-500 font-medium">Khám phá các công việc phù hợp và gửi đề xuất ngay.</p>
          <div className="pt-2">
            <Link to="/jobs">
              <Button variant="primary" size="md">
                Tìm việc ngay
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant={
                        app.status === 'ACCEPTED' ? 'success' :
                        app.status === 'SHORTLISTED' ? 'warning' :
                        app.status === 'REJECTED' ? 'danger' : 'neutral'
                      }
                      size="sm"
                    >
                      {app.status === 'ACCEPTED' ? 'Đã trúng thầu' :
                       app.status === 'SHORTLISTED' ? 'Khách hàng ưu tiên' :
                       app.status === 'REJECTED' ? 'Bị từ chối' :
                       app.status === 'WITHDRAWN' ? 'Đã rút đơn' : 'Đang xét duyệt'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">Nộp lúc {formatDate(app.createdAt)}</span>
                  </div>

                  <Link to={`/jobs/${app.job?.id}`} className="font-black text-base text-slate-900 hover:text-blue-600 transition-colors">
                    {app.job?.title}
                  </Link>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{app.job?.category}</p>
                </div>

                <div className="sm:text-right flex-shrink-0">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Báo giá của bạn</span>
                  <span className="text-xl font-black text-blue-700 block mt-0.5">{formatCurrency(app.proposedPrice)}</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dự kiến hoàn thành: <span className="font-bold text-slate-700">{app.estimatedDays} ngày</span></p>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 font-medium">
                <span className="font-bold text-slate-900 block mb-1">Đề xuất gửi đi:</span>
                <p className="whitespace-pre-line line-clamp-3 leading-relaxed text-slate-600">{app.proposal}</p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <Link to={`/jobs/${app.job?.id}`} className="text-blue-700 hover:text-blue-900 font-bold transition-colors">
                  Xem tin tuyển dụng gốc →
                </Link>

                {app.status === 'SUBMITTED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdraw(app.id)}
                  >
                    Rút đơn ứng tuyển
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
