import React, { useState } from 'react';
import { Star, X, Award, ThumbsUp, ShieldCheck } from 'lucide-react';
import type { Order } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSubmitReview: (reviewData: {
    orderId: string;
    orderTitle: string;
    targetName: string;
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
  const [rating, setRating] = useState<number>(5);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [deadlineRating, setDeadlineRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Vui lòng nhập lời nhận xét đánh giá!');
      return;
    }

    onSubmitReview({
      orderId: order.id,
      orderTitle: order.serviceTitle,
      targetName: order.freelancerName,
      rating,
      qualityRating,
      deadlineRating,
      communicationRating,
      comment
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
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-800 ml-2 w-4">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Đánh Giá & Nghiệm Thu Dịch Vụ</h3>
              <p className="text-[11px] text-slate-500">Đơn hàng: {order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Target Freelancer Info */}
          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <img
              src={order.freelancerAvatar}
              alt={order.freelancerName}
              className="w-11 h-11 rounded-full object-cover border border-slate-300 ring-2 ring-blue-500/20"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">{order.freelancerName}</div>
              <div className="text-slate-500 text-[11px] line-clamp-1">{order.serviceTitle}</div>
            </div>
          </div>

          {/* Overall Star Rating */}
          <div className="text-center py-2 bg-amber-50/50 rounded-2xl border border-amber-200/60 p-4 space-y-2">
            <div className="text-xs font-bold text-amber-900">Đánh giá mức độ hài lòng chung:</div>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-extrabold text-amber-800">
              {rating === 5 && '⭐⭐⭐⭐⭐ Tuyệt vời! Rất hài lòng'}
              {rating === 4 && '⭐⭐⭐⭐ Tốt, đáp ứng đầy đủ cam kết'}
              {rating === 3 && '⭐⭐⭐ Tạm ổn, cần cải thiện thêm'}
              {rating === 2 && '⭐⭐ Chưa hài lòng'}
              {rating === 1 && '⭐ Kém, không đáp ứng yêu cầu'}
            </div>
          </div>

          {/* 3 Detail Criteria */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Đánh giá theo từng tiêu chí cụ thể:
            </div>
            <StarSelector
              label="1. Chất lượng sản phẩm & Chuyên môn:"
              value={qualityRating}
              onChange={setQualityRating}
            />
            <StarSelector
              label="2. Đúng thời hạn cam kết (Deadline):"
              value={deadlineRating}
              onChange={setDeadlineRating}
            />
            <StarSelector
              label="3. Thái độ giao tiếp & Hợp tác:"
              value={communicationRating}
              onChange={setCommunicationRating}
            />
          </div>

          {/* Comment Text */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nhận xét chi tiết của bạn:</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm làm việc cùng Freelancer, chất lượng bàn giao, thái độ hỗ trợ sửa bài..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              required
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đánh giá của bạn sẽ giúp xây dựng điểm uy tín <strong>TalentCredit</strong> minh bạch trên sàn.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
            >
              Để sau
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Gửi Đánh Giá</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
