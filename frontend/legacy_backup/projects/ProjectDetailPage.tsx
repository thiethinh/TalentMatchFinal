import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Project, Milestone, Payment, TalentReview } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import {
  ShieldCheck,
  FileCheck,
  CheckCircle,
  Plus,
  Upload,
  AlertCircle,
  Star,
  ExternalLink,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<TalentReview[]>([]);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mAmount, setMAmount] = useState('');
  const [mDeadline, setMDeadline] = useState('');

  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryMilestoneId, setDeliveryMilestoneId] = useState<string>('');
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchProject = () => {
    setLoading(true);
    apiClient.get(`/projects/${id}`)
      .then((res) => {
        setProject(res.data.project);
        setMilestones(res.data.milestones || []);
        setPayments(res.data.payments || []);
        setReviews(res.data.reviews || []);
        setAlreadyReviewed(res.data.alreadyReviewed || false);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleSignAgreement = async () => {
    try {
      await apiClient.post(`/projects/${id}/agreement/sign`);
      alert('Đã xác nhận ký hợp đồng điện tử thành công!');
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi ký hợp đồng.');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${id}/milestones`, {
        title: mTitle,
        description: mDesc,
        amount: Number(mAmount),
        deadline: mDeadline || null,
      });
      alert('Đã tạo Milestone thành công!');
      setMilestoneModalOpen(false);
      setMTitle('');
      setMDesc('');
      setMAmount('');
      setMDeadline('');
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo Milestone.');
    }
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (deliveryMilestoneId) formData.append('milestoneId', deliveryMilestoneId);
    if (deliveryUrl) formData.append('externalUrl', deliveryUrl);
    if (deliveryNote) formData.append('note', deliveryNote);
    if (deliveryFile) formData.append('file', deliveryFile);

    try {
      await apiClient.post(`/projects/${id}/deliveries`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Đã bàn giao sản phẩm thành công!');
      setDeliveryModalOpen(false);
      setDeliveryUrl('');
      setDeliveryNote('');
      setDeliveryFile(null);
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi bàn giao sản phẩm.');
    }
  };

  const handleCompleteProject = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn nghiệm thu và hoàn thành toàn bộ hợp đồng?')) return;
    try {
      await apiClient.post(`/projects/${id}/complete`);
      alert('Dự án đã được nghiệm thu và hoàn tất!');
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nghiệm thu dự án.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Đã gửi đánh giá chất lượng thành công!');
      setReviewModalOpen(false);
      setReviewComment('');
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi đánh giá.');
    }
  };

  const handleCancelProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${id}/cancel`, { reason: cancelReason });
      alert('Đã gửi yêu cầu hủy hợp đồng tới Quản trị viên!');
      setCancelModalOpen(false);
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi yêu cầu hủy.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải thông tin hợp đồng dự án...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-xs text-slate-500">Không tìm thấy thông tin dự án.</div>;
  }

  const isCustomer = user?.id === project.customer?.id;
  const isFreelancer = user?.id === project.freelancer?.id;

  return (
    <div className="space-y-6">
      {/* Contract Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">HỢP ĐỒNG #{project.id}</span>
              <Badge
                variant={
                  project.status === 'COMPLETED' ? 'success' :
                  project.status === 'IN_PROGRESS' ? 'brand' :
                  project.status === 'DISPUTED' ? 'danger' : 'warning'
                }
              >
                {project.status === 'COMPLETED' ? 'Đã hoàn thành' :
                 project.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
                 project.status === 'WAITING_PAYMENT' ? 'Chờ thanh toán ký quỹ' :
                 project.status === 'DISPUTED' ? 'Tranh chấp' : project.status}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {project.application?.job?.title || `Dự án Hợp đồng #${project.id}`}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Khởi tạo lúc: {formatDate(project.createdAt)}
            </p>
          </div>

          <div className="md:text-right flex-shrink-0">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Tổng giá trị hợp đồng</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-700 block mt-0.5">{formatCurrency(project.totalPrice)}</span>
          </div>
        </div>

        {/* E-Signature Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900">Khách hàng: {project.customer?.fullName}</span>
              <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                {project.customerSignedAt ? `Đã ký điện tử: ${formatDate(project.customerSignedAt)}` : 'Chưa xác nhận ký'}
              </p>
            </div>
            {isCustomer && !project.customerSignedAt && (
              <Button size="sm" variant="primary" onClick={handleSignAgreement}>
                <FileCheck className="w-3.5 h-3.5" /> Ký hợp đồng
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-5">
            <div>
              <span className="font-extrabold text-slate-900">Freelancer: {project.freelancer?.fullName}</span>
              <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                {project.freelancerSignedAt ? `Đã ký điện tử: ${formatDate(project.freelancerSignedAt)}` : 'Chưa xác nhận ký'}
              </p>
            </div>
            {isFreelancer && !project.freelancerSignedAt && (
              <Button size="sm" variant="primary" onClick={handleSignAgreement}>
                <FileCheck className="w-3.5 h-3.5" /> Ký hợp đồng
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Milestones & Escrow */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Các mốc thanh toán & tiến độ (Milestones)</h2>
            <p className="text-xs text-slate-500">Mỗi mốc được ký quỹ riêng để bảo đảm tài chính</p>
          </div>
          {isCustomer && project.status !== 'COMPLETED' && (
            <Button size="sm" variant="outline" onClick={() => setMilestoneModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Thêm Milestone
            </Button>
          )}
        </div>

        {milestones.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Dự án thanh toán trọn gói một lần khi hoàn tất.</p>
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-slate-50 rounded-[8px] border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{m.title}</span>
                    <Badge variant={m.status === 'COMPLETED' ? 'success' : m.status === 'PAID' ? 'brand' : 'neutral'} size="sm">
                      {m.status === 'COMPLETED' ? 'Hoàn thành' :
                       m.status === 'PAID' ? 'Đã ký quỹ' :
                       m.status === 'SUBMITTED' ? 'Đã nộp bài' :
                       m.status === 'IN_PROGRESS' ? 'Đang làm' : 'Chưa thanh toán'}
                    </Badge>
                  </div>
                  {m.description && <p className="text-slate-600">{m.description}</p>}
                  <p className="text-slate-400 text-[11px]">Hạn chót: {formatDate(m.deadline)}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-bold text-sm text-slate-900">{formatCurrency(m.amount)}</span>

                  {isCustomer && m.status === 'UNPAID' && (
                    <Link to={`/payment/project/${project.id}?milestoneId=${m.id}`}>
                      <Button size="sm" variant="primary">
                        Ký quỹ mốc này
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions & Deliveries */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Thao tác dự án & Bàn giao</h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Deliver Work */}
          {isFreelancer && project.status !== 'COMPLETED' && (
            <Button size="sm" variant="primary" onClick={() => setDeliveryModalOpen(true)}>
              <Upload className="w-3.5 h-3.5" /> Bàn giao sản phẩm
            </Button>
          )}

          {/* Complete Project */}
          {isCustomer && project.status !== 'COMPLETED' && (
            <Button size="sm" variant="primary" onClick={handleCompleteProject}>
              <CheckCircle className="w-3.5 h-3.5" /> Nghiệm thu & Hoàn tất
            </Button>
          )}

          {/* Review Partner */}
          {project.status === 'COMPLETED' && !alreadyReviewed && (
            <Button size="sm" variant="outline" onClick={() => setReviewModalOpen(true)}>
              <Star className="w-3.5 h-3.5" /> Viết đánh giá đối tác
            </Button>
          )}

          {/* Cancel Project */}
          {project.status !== 'COMPLETED' && project.status !== 'CANCELLED' && (
            <Button size="sm" variant="danger" onClick={() => setCancelModalOpen(true)}>
              Yêu cầu hủy hợp đồng
            </Button>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-4 text-xs">
          <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Đánh giá dự án</h2>
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{rev.author?.fullName}</span>
                  <div className="flex items-center gap-1.5 text-amber-700 font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {rev.rating} / 5
                  </div>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Milestone */}
      <Modal isOpen={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} title="Thêm Milestone mới">
        <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
          <Input label="Tiêu đề mốc *" required value={mTitle} onChange={(e) => setMTitle(e.target.value)} />
          <Input label="Mô tả công việc mốc" value={mDesc} onChange={(e) => setMDesc(e.target.value)} />
          <Input label="Số tiền thanh toán (VNĐ) *" type="number" required value={mAmount} onChange={(e) => setMAmount(e.target.value)} />
          <Input label="Hạn chót" type="date" value={mDeadline} onChange={(e) => setMDeadline(e.target.value)} />
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setMilestoneModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Lưu Milestone</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delivery */}
      <Modal isOpen={deliveryModalOpen} onClose={() => setDeliveryModalOpen(false)} title="Bàn giao sản phẩm">
        <form onSubmit={handleSubmitDelivery} className="space-y-3 text-xs">
          <Input
            label="Đường dẫn sản phẩm (Figma, GitHub, Drive...)"
            type="url"
            value={deliveryUrl}
            onChange={(e) => setDeliveryUrl(e.target.value)}
            placeholder="https://..."
          />
          <div>
            <label className="block font-medium text-slate-700 mb-1">Hoặc đính kèm tệp tin</label>
            <input
              type="file"
              onChange={(e) => setDeliveryFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-[4px] file:border-0 file:text-xs file:bg-slate-100"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Ghi chú bàn giao</label>
            <textarea
              rows={3}
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Ghi chú thêm cho khách hàng..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[6px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setDeliveryModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Gửi bàn giao</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Review */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Đánh giá đối tác">
        <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Số sao (1 - 5) *</label>
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              className="w-full p-2 text-xs border rounded-[6px]"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 sao - Tuyệt vời)</option>
              <option value={4}>⭐⭐⭐⭐ (4 sao - Tốt)</option>
              <option value={3}>⭐⭐⭐ (3 sao - Trung bình)</option>
              <option value={2}>⭐⭐ (2 sao - Chưa đạt)</option>
              <option value={1}>⭐ (1 sao - Rất tệ)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Nhận xét chi tiết (tối thiểu 10 ký tự) *</label>
            <textarea
              required
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm làm việc cùng đối tác..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[6px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setReviewModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Gửi đánh giá</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cancel Project */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Yêu cầu hủy hợp đồng">
        <form onSubmit={handleCancelProject} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Lý do yêu cầu hủy *</label>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nêu rõ lý do muốn dừng hợp đồng..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[6px]"
            />
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded">
            Lưu ý: Các khoản tiền đã ký quỹ sẽ được Admin xem xét và giải quyết phân xử theo quy định sàn.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setCancelModalOpen(false)}>Quay lại</Button>
            <Button variant="danger" type="submit">Xác nhận gửi yêu cầu</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
