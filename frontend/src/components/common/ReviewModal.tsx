import React, { useState } from 'react';
import type { Order } from '../../types';
import { useDemo } from '../../context/DemoContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSubmitReview: (reviewData: {
    orderId: string;
    orderTitle: string;
    targetName: string;
    targetId?: string;
    rating: number;
    qualityRating: number;
    deadlineRating: number;
    communicationRating: number;
    comment: string;
  }) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitReview
}) => {
  const { currentUser } = useDemo();
  const isFreelancer = currentUser.role === 'freelancer';

  const [rating, setRating] = useState<number>(5);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [deadlineRating, setDeadlineRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  if (!isOpen) return null;

  const targetName = isFreelancer
    ? order.employerName
    : order.freelancerName;
  const targetAvatar = isFreelancer ? order.employerAvatar : order.freelancerAvatar;
  const targetRole = isFreelancer ? 'Nhà Tuyển Dụng / Khách Hàng' : 'Freelancer / Chuyên Gia';
  const targetId = isFreelancer ? order.employerId : order.freelancerId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = comment || (document.getElementById('review-comment-textarea') as HTMLTextAreaElement)?.value || '';
    if (!finalComment.trim()) {
      alert('Vui lòng nhập lời nhận xét đánh giá!');
      return;
    }

    onSubmitReview({
      orderId: order.id,
      orderTitle: order.serviceTitle,
      targetName,
      targetId,
      rating,
      qualityRating,
      deadlineRating,
      communicationRating,
      comment: finalComment.trim()
    });

    onClose();
  };

  const StarSelector = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
          >
            <i className={`text-sm ${star <= value ? 'fa-solid fa-star text-amber-400' : 'fa-regular fa-star text-slate-300'}`} />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-800 ml-2 w-4">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center">
              <i className="fa-solid fa-award text-sm" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isFreelancer ? 'Đánh Giá Khách Hàng / Nhà Tuyển Dụng' : 'Đánh Giá & Nghiệm Thu Freelancer'}
              </h3>
              <p className="text-[11px] text-slate-500">Đơn hàng: {order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer">
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Target Info */}
          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-md border border-slate-200">
            <img
              src={targetAvatar}
              alt={targetName}
              className="w-10 h-10 rounded-full object-cover border border-slate-300"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{targetName}</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.2 rounded-xs">
                  {targetRole}
                </span>
              </div>
              <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{order.serviceTitle}</div>
            </div>
          </div>

          {/* Overall Star Rating */}
          <div className="text-center py-2 bg-amber-50/50 rounded-md border border-amber-200/60 p-4 space-y-2">
            <div className="text-xs font-bold text-amber-900">
              {isFreelancer ? 'Đánh giá mức độ hài lòng khi hợp tác cùng Khách hàng:' : 'Đánh giá mức độ hài lòng chung:'}
            </div>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <i className={`text-2xl ${star <= rating ? 'fa-solid fa-star text-amber-400' : 'fa-regular fa-star text-slate-200'}`} />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-amber-800">
              {rating === 5 && 'Tuyệt vời! Rất hài lòng'}
              {rating === 4 && 'Tốt, đáp ứng đầy đủ cam kết'}
              {rating === 3 && 'Tạm ổn, cần cải thiện thêm'}
              {rating === 2 && 'Chưa hài lòng'}
              {rating === 1 && 'Kém, không đáp ứng yêu cầu'}
            </div>
          </div>

          {/* 3 Detail Criteria */}
          <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Đánh giá theo từng tiêu chí cụ thể:
            </div>
            <StarSelector
              label={isFreelancer ? '1. Yêu cầu & mô tả công việc rõ ràng:' : '1. Chất lượng sản phẩm & Chuyên môn:'}
              value={qualityRating}
              onChange={setQualityRating}
            />
            <StarSelector
              label={isFreelancer ? '2. Hỗ trợ & phản hồi trao đổi kịp thời:' : '2. Đúng thời hạn cam kết (Deadline):'}
              value={deadlineRating}
              onChange={setDeadlineRating}
            />
            <StarSelector
              label={isFreelancer ? '3. Tác phong nghiệm thu & giải ngân:' : '3. Thái độ giao tiếp & Hợp tác:'}
              value={communicationRating}
              onChange={setCommunicationRating}
            />
          </div>

          {/* Comment Text */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isFreelancer ? 'Nhận xét chi tiết về Khách hàng / Doanh nghiệp:' : 'Nhận xét chi tiết của bạn:'}
            </label>
            <textarea
              id="review-comment-textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isFreelancer
                  ? 'Chia sẻ trải nghiệm hợp tác cùng Khách hàng, mức độ rõ ràng của yêu cầu, sự hỗ trợ trong quá trình thực hiện dự án...'
                  : 'Chia sẻ trải nghiệm làm việc cùng Freelancer, chất lượng bàn giao, thái độ hỗ trợ sửa bài...'
              }
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              required
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200">
            <i className="fa-solid fa-shield-halved text-emerald-600 text-xs shrink-0" />
            <span>Đánh giá của bạn sẽ giúp xây dựng điểm uy tín <strong>TalentCredit</strong> minh bạch hai chiều trên sàn.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md transition-all cursor-pointer"
            >
              Để sau
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-thumbs-up text-xs" />
              <span>Gửi Đánh Giá</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
