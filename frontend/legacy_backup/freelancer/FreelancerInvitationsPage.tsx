import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { JobInvitation } from '../../types';
import { formatDate, formatCurrency } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Mail, Clock, Check, X } from 'lucide-react';

export const FreelancerInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<JobInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = () => {
    setLoading(true);
    apiClient
      .get('/freelancer/invitations')
      .then((res) => {
        setInvitations(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAnswer = async (id: number, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      await apiClient.post(`/freelancer/invitations/${id}/answer?status=${status}`);
      alert(status === 'ACCEPTED' ? 'Đã chấp nhận lời mời!' : 'Đã từ chối lời mời.');
      fetchInvitations();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phản hồi lời mời.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Lời mời phỏng vấn & Hợp tác</h1>
          <p className="text-xs text-slate-500 mt-0.5">Các doanh nghiệp đã chủ động gửi đề nghị tham gia dự án tới bạn</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Đang tải lời mời...
        </div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Chưa có lời mời nào"
          description="Khi hồ sơ của bạn nổi bật và phù hợp với tiêu chí của nhà tuyển dụng, các lời mời hợp tác trực tiếp sẽ hiển thị ở đây."
        />
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] text-slate-400">Từ doanh nghiệp:</span>
                  <p className="text-xs font-bold text-slate-900">{inv.customer?.fullName}</p>
                </div>
                <Badge
                  variant={
                    inv.status === 'ACCEPTED'
                      ? 'success'
                      : inv.status === 'DECLINED'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {inv.status === 'SENT' ? 'Chờ bạn phản hồi' : inv.status}
                </Badge>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dự án được mời</p>
                <Link
                  to={`/jobs/${inv.job?.id}`}
                  className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {inv.job?.title}
                </Link>
                {inv.job?.budget && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ngân sách dự kiến: <span className="font-semibold text-blue-600">{formatCurrency(inv.job.budget)}</span>
                  </p>
                )}
                {inv.message && (
                  <p className="text-xs text-slate-700 italic mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{inv.message}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(inv.createdAt || '')}
                </span>

                {inv.status === 'SENT' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnswer(inv.id, 'DECLINED')}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Từ chối
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAnswer(inv.id, 'ACCEPTED')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Đồng ý tham gia
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
