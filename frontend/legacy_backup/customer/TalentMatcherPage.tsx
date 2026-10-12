import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { Job, User } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Star, Mail, Sparkles } from 'lucide-react';

export const TalentMatcherPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [targetFreelancer, setTargetFreelancer] = useState<User | null>(null);
  const [inviteJobId, setInviteJobId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('Mời bạn xem công việc và gửi Proposal báo giá.');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const fetchTalent = () => {
    setLoading(true);
    const query = selectedJobId ? `?jobId=${selectedJobId}` : '';
    apiClient.get(`/customer/talent${query}`)
      .then((res) => {
        setJobs(res.data.jobs || []);
        setSuggestions(res.data.suggestions || []);
        if (res.data.selectedJob) {
          setSelectedJobId(res.data.selectedJob.id.toString());
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTalent();
  }, [selectedJobId]);

  const openInviteModal = (freelancer: User) => {
    setTargetFreelancer(freelancer);
    setInviteJobId(selectedJobId || (jobs.length > 0 ? jobs[0].id.toString() : ''));
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFreelancer || !inviteJobId) return;
    setSubmittingInvite(true);
    try {
      await apiClient.post('/customer/invitations', {
        jobId: Number(inviteJobId),
        freelancerId: targetFreelancer.id,
        message: inviteMessage,
      });
      alert('Đã gửi lời mời hợp tác thành công!');
      setInviteModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi lời mời.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" /> Gợi ý & Kết nối Freelancer
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Thuật toán đối chiếu kỹ năng, kinh nghiệm và lĩnh vực chuyên môn để chấm điểm mức độ phù hợp
          </p>
        </div>

        {/* Job selector */}
        {jobs.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700 flex-shrink-0">Đối chiếu theo tin:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Tất cả Freelancer --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          Đang tính toán điểm phù hợp...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-2">
          <p className="font-extrabold text-slate-900 text-sm">Chưa tìm thấy gợi ý phù hợp</p>
          <p className="text-xs text-slate-500 font-medium">Hãy chọn một công việc cụ thể để tính toán độ phù hợp chính xác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((row, idx) => {
            const f: User = row.user;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 border border-white/20 shadow-xs flex items-center justify-center font-black text-base text-white flex-shrink-0">
                        {f.fullName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-extrabold text-sm text-slate-900">{f.fullName}</h2>
                        <p className="text-xs font-semibold text-slate-500">{f.professionalTitle || f.field || 'Freelancer'}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-700 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{f.rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-slate-400 font-normal ml-2">
                            {f.experienceYears ? `${f.experienceYears} năm KN` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant={row.score >= 70 ? 'success' : row.score >= 40 ? 'brand' : 'neutral'}>
                        Khớp {row.score}%
                      </Badge>
                      <p className="text-sm font-black text-blue-700 mt-2">
                        {f.hourlyRate ? `${formatCurrency(f.hourlyRate)}/h` : 'Thỏa thuận'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed font-medium">
                    {f.bio || 'Chưa cập nhật mô tả chi tiết.'}
                  </p>

                  {/* Reason badge */}
                  {row.reason && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 font-medium">
                      <span className="font-bold text-slate-800">Lý do gợi ý: </span>
                      {row.reason}
                    </div>
                  )}

                  {f.skills && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                      {f.skills.split(',').slice(0, 5).map((skill, sIdx) => (
                        <span key={sIdx} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-200/50">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openInviteModal(f)}
                  >
                    <Mail className="w-3.5 h-3.5" /> Mời ứng tuyển
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Gửi lời mời hợp tác đến ${targetFreelancer?.fullName}`}
      >
        <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Chọn công việc mời *</label>
            <select
              required
              value={inviteJobId}
              onChange={(e) => setInviteJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">-- Chọn công việc đang tuyển --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Lời nhắn kèm theo</label>
            <textarea
              rows={3}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setInviteModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={submittingInvite}>
              Gửi lời mời
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
