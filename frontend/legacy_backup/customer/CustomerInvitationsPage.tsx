import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { JobInvitation } from '../../types';
import { formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Mail, Clock, User } from 'lucide-react';

export const CustomerInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<JobInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/customer/invitations')
      .then((res) => {
        setInvitations(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Lời mời đã gửi cho Freelancer</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý các đề nghị hợp tác trực tiếp gửi tới ứng viên</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Đang tải lời mời...
        </div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Chưa gửi lời mời nào"
          description="Bạn chưa gửi lời mời hợp tác nào tới Freelancer. Hãy ghé trang Tìm ứng viên để mời nhân tài phù hợp!"
        />
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                  {inv.freelancer?.fullName?.charAt(0) || 'F'}
                </div>
                <div>
                  <Link
                    to={`/freelancers/${inv.freelancer?.id}`}
                    className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {inv.freelancer?.fullName}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mời vào dự án:{' '}
                    <Link to={`/jobs/${inv.job?.id}`} className="text-blue-600 hover:underline">
                      {inv.job?.title}
                    </Link>
                  </p>
                  {inv.message && (
                    <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-2 rounded-lg">
                      "{inv.message}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
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
                  {inv.status === 'SENT' ? 'Đang chờ trả lời' : inv.status}
                </Badge>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(inv.createdAt || '')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
