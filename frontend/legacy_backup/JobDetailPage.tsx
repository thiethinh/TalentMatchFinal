import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { Job, JobQuestion } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../app/providers/AuthProvider';
import { Bookmark, Clock, ShieldCheck, MapPin, Building, MessageSquare, Send } from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [proposal, setProposal] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('14');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  // Discussion
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const fetchJob = () => {
    setLoading(true);
    apiClient.get(`/jobs/${id}`)
      .then((res) => {
        setJob(res.data.job);
        setIsSaved(res.data.isSaved);
        setHasApplied(res.data.hasApplied);
        setMatchScore(res.data.matchScore || 0);
        setSimilarJobs(res.data.similarJobs || []);
        if (res.data.job?.budget) {
          setProposedPrice(res.data.job.budget.toString());
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    apiClient.get(`/jobs/${id}/discussion`)
      .then((res) => setQuestions(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const toggleSave = async () => {
    if (!job) return;
    try {
      const res = await apiClient.post(`/jobs/${job.id}/save`);
      setIsSaved(res.data.saved);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu.');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSubmittingApply(true);
    try {
      await apiClient.post(`/jobs/${job.id}/apply`, {
        proposal,
        proposedPrice: Number(proposedPrice),
        estimatedDays: Number(estimatedDays),
        portfolioLink,
      });
      alert('Nộp đề xuất ứng tuyển thành công!');
      setApplyModalOpen(false);
      setHasApplied(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi ứng tuyển.');
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !newQuestion.trim()) return;
    setSubmittingQuestion(true);
    try {
      await apiClient.post(`/jobs/${job.id}/discussion`, { text: newQuestion.trim() });
      setNewQuestion('');
      const res = await apiClient.get(`/jobs/${id}/discussion`);
      setQuestions(res.data || []);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi câu hỏi.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải thông tin chi tiết dự án...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-xs text-slate-500">Không tìm thấy công việc này.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="brand">{job.category}</Badge>
              {job.workType && <Badge variant="neutral">{job.workType}</Badge>}
              {job.experienceLevel && <Badge variant="neutral">{job.experienceLevel}</Badge>}
              {matchScore > 0 && <Badge variant="success">Điểm phù hợp: {matchScore}%</Badge>}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{job.title}</h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span>Đăng lúc: {formatDate(job.createdAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Hạn nộp: {formatDate(job.deadline)}
              </span>
            </div>
          </div>

          <div className="md:text-right flex flex-col md:items-end justify-between flex-shrink-0">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ngân sách dự kiến</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">{formatCurrency(job.budget)}</p>
              <span className="text-[11px] text-slate-400 font-medium">{job.priceType === 'HOURLY' ? 'Theo giờ' : 'Gói trọn gói (Fixed)'}</span>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={isSaved ? 'danger' : 'outline'}
                size="sm"
                onClick={toggleSave}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                {isSaved ? 'Đã lưu' : 'Lưu tin'}
              </Button>

              {user?.role === 'FREELANCER' && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={hasApplied}
                  onClick={() => setApplyModalOpen(true)}
                >
                  {hasApplied ? 'Đã nộp đơn' : 'Gửi báo giá ngay'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-4 text-xs text-slate-700 leading-relaxed">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Mô tả chi tiết công việc</h2>
            <div className="whitespace-pre-line">{job.description}</div>

            {job.acceptanceCriteria && (
              <>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pt-3 pb-2">Tiêu chí nghiệm thu sản phẩm</h3>
                <div className="whitespace-pre-line text-slate-600">{job.acceptanceCriteria}</div>
              </>
            )}

            {job.requiredSkills && (
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 mb-2">Kỹ năng yêu cầu</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {job.requiredSkills.split(',').map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-[4px] font-medium">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Discussion */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-5">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Hỏi đáp công khai về dự án ({questions.length})
            </h2>

            {user?.role === 'FREELANCER' && (
              <form onSubmit={handleAskQuestion} className="space-y-3">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Đặt câu hỏi làm rõ yêu cầu dự án..."
                  rows={2}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <Button type="submit" size="sm" loading={submittingQuestion} disabled={!newQuestion.trim()}>
                  <Send className="w-3.5 h-3.5" /> Gửi câu hỏi
                </Button>
              </form>
            )}

            <div className="space-y-3 pt-2">
              {questions.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-900">{q.author?.fullName || 'Freelancer'}</span>
                      <span className="text-[11px] font-medium text-slate-400">{formatDate(q.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{q.question}</p>
                    {q.answer ? (
                      <div className="pl-3 border-l-2 border-blue-600 mt-2 text-slate-700 bg-blue-50/50 p-2.5 rounded-r-xl">
                        <span className="font-bold text-blue-800 block text-[11px] mb-0.5">Phản hồi từ Khách hàng:</span>
                        <p>{q.answer}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-700 font-medium italic">Đang chờ khách hàng phản hồi...</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Client Info */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3">Thông tin khách hàng</h3>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Building className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900">{job.customer?.companyName || job.customer?.fullName || 'Doanh nghiệp'}</span>
            </div>
            {job.customer?.location && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{job.customer.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Ký quỹ Escrow bảo vệ 100% ngân sách</span>
            </div>
          </div>

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3">Công việc tương tự</h3>
              <div className="space-y-2.5">
                {similarJobs.map((sim) => (
                  <Link key={sim.id} to={`/jobs/${sim.id}`} className="block p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all">
                    <p className="font-bold text-slate-900 truncate">{sim.title}</p>
                    <div className="flex items-center justify-between text-slate-500 mt-1.5">
                      <span className="text-[11px] font-medium">{sim.category}</span>
                      <span className="font-extrabold text-blue-700">{formatCurrency(sim.budget)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Proposal Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Gửi Báo Giá & Đề Xuất Ứng Tuyển"
        maxWidth="lg"
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Đề xuất giải pháp (Proposal) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Trình bày giải pháp, kinh nghiệm và cách bạn sẽ thực hiện dự án này..."
              className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">Tối thiểu 30 ký tự để thuyết phục khách hàng.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Báo giá đề xuất (VNĐ) *"
              type="number"
              required
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
            />
            <Input
              label="Thời gian hoàn thành (ngày) *"
              type="number"
              required
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
            />
          </div>

          <Input
            label="Liên kết Portfolio / Sản phẩm liên quan"
            type="url"
            value={portfolioLink}
            onChange={(e) => setPortfolioLink(e.target.value)}
            placeholder="https://behance.net/sample hoặc github.com/..."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setApplyModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={submittingApply}>
              Xác nhận nộp đơn
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
