import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { Job, JobQuestion } from '../types';
import { useAuth } from '../app/providers/AuthProvider';
import { MessageSquare, Send, ArrowLeft, CheckCircle2, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';

export const JobDiscussionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscussion = () => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/jobs/${id}`).then((r) => r.data.job),
      apiClient.get(`/jobs/${id}/discussion`).then((r) => r.data || []),
    ])
      .then(([j, qList]) => {
        setJob(j);
        setQuestions(qList);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/jobs/${id}/discussion`, { text: questionText.trim() });
      setQuestionText('');
      const res = await apiClient.get(`/jobs/${id}/discussion`);
      setQuestions(res.data || []);
      alert('Đã gửi câu hỏi tới nhà tuyển dụng.');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi câu hỏi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to={`/jobs/${id}`}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hỏi đáp & Thảo luận công việc</h1>
          {job && <p className="text-xs text-slate-500 mt-0.5">Dự án: {job.title}</p>}
        </div>
      </div>

      {/* Ask Box */}
      {user?.role === 'FREELANCER' && (
        <form
          onSubmit={handleAsk}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
        >
          <label className="block text-xs font-bold text-slate-900">
            Đặt câu hỏi công khai cho khách hàng
          </label>
          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Đặt câu hỏi chi tiết về yêu cầu kỹ thuật, mốc bàn giao, tài liệu liên quan..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
            required
            minLength={8}
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              <Send className="w-3.5 h-3.5 mr-1.5" /> Gửi câu hỏi
            </Button>
          </div>
        </form>
      )}

      {/* List of Questions */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Đang tải thảo luận...
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Chưa có câu hỏi nào"
          description="Chưa có ứng viên nào đặt câu hỏi cho dự án này. Hãy là người đầu tiên đặt câu hỏi để làm rõ yêu cầu!"
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                    {q.author?.fullName ? q.author.fullName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {q.author?.fullName || 'Freelancer'}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {formatDate(q.createdAt || '')}
                    </span>
                  </div>
                </div>
                {q.answer ? (
                  <Badge variant="success" size="sm">
                    Đã trả lời
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Chờ phản hồi
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-800 leading-relaxed pl-9">{q.question}</p>

              {q.answer && (
                <div className="ml-9 p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Phản hồi từ Khách hàng:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-5">{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
