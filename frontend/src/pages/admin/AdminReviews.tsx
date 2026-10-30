import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Pagination } from '../../components/common/Pagination';

export const AdminReviews: React.FC = () => {
  const { reviews, deleteReview } = useApp();

  // Search & Filter States
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingRev, setDeletingRev] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Rating filter
      if (ratingFilter !== 'ALL') {
        if (ratingFilter === '5' && rev.rating !== 5) return false;
        if (ratingFilter === '4' && rev.rating !== 4) return false;
        if (ratingFilter === '3' && rev.rating !== 3) return false;
        if (ratingFilter === '1-2' && (rev.rating > 2 || rev.rating < 1)) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const reviewer = (rev.reviewerName || '').toLowerCase();
        const target = (rev.targetName || '').toLowerCase();
        const comment = (rev.comment || '').toLowerCase();
        return reviewer.includes(q) || target.includes(q) || comment.includes(q);
      }

      return true;
    });
  }, [reviews, ratingFilter, searchQuery]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, searchQuery]);

  // Pagination calculations
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  // Review statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { total: 0, avg: 0, fiveStar: 0, lowStar: 0 };
    const avg = Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / total).toFixed(1));
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    const lowStar = reviews.filter((r) => (r.rating || 0) <= 2).length;
    return { total, avg, fiveStar, lowStar };
  }, [reviews]);

  const handleConfirmDelete = async () => {
    if (!deletingRev) return;
    await deleteReview(deletingRev.id);
    setDeletingRev(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Header */}
      <AdminHeader
        title="Kiểm Duyệt & Quản Lý Đánh Giá Đơn Hàng"
        subtitle="Giám sát mọi đánh giá 2 chiều giữa Employer và Freelancer, kịp thời can thiệp các hành vi spam hoặc đánh giá quấy rối."
        icon="fa-star"
        badge={`${reviews.length} đánh giá`}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng số đánh giá</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{stats.total}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Toàn nền tảng</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Điểm trung bình</div>
          <div className="text-xl font-extrabold text-amber-500 mt-1 font-mono flex items-center gap-1">
            <span>{stats.avg}</span>
            <i className="fa-solid fa-star text-sm" />
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Thang điểm 5.0</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đánh giá 5 sao</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">{stats.fiveStar}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Xuất sắc</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đánh giá thấp (≤ 2★)</div>
          <div className="text-xl font-extrabold text-rose-600 mt-1 font-mono">{stats.lowStar}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Cần chú ý</div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-comments text-amber-500 text-sm" />
              <span>Danh Sách Đánh Giá Khách Quan</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredReviews.length} nhận xét
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lọc theo số sao hoặc tìm kiếm theo tên người đánh giá, người nhận và nội dung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                placeholder="Tìm người gửi, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả số sao</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Sao</option>
              <option value="4">⭐⭐⭐⭐ 4 Sao</option>
              <option value="3">⭐⭐⭐ 3 Sao</option>
              <option value="1-2">⭐/⭐⭐ 1-2 Sao</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {paginatedReviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fa-solid fa-comment-slash text-3xl mb-2 block" />
              Không có đánh giá nào khớp với tiêu chuẩn tìm kiếm.
            </div>
          ) : (
            paginatedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={rev.reviewerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${rev.reviewerName}`}
                      alt={rev.reviewerName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{rev.reviewerName}</span>
                        <span className="text-slate-400 font-normal">đánh giá cho</span>
                        <strong className="text-blue-700">{rev.targetName}</strong>
                      </div>
                      <span className="text-slate-400 text-[10px] font-mono">
                        {rev.date || '15/10/2026'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <span>{rev.rating}</span>
                      <i className="fa-solid fa-star text-amber-400 text-xs ml-1" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeletingRev(rev)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Xóa đánh giá vi phạm"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium pt-1">
                  <span>Chất lượng: ⭐ {rev.qualityRating || 5}/5</span>
                  <span>Đúng hạn: ⭐ {rev.deadlineRating || 5}/5</span>
                  <span>Giao tiếp: ⭐ {rev.communicationRating || 5}/5</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Universal Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Confirm Delete Review Modal */}
      {deletingRev && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-trash-can" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Xác Nhận Xóa Đánh Giá?</h3>
              <p className="text-xs text-slate-500">
                Đánh giá của <strong>{deletingRev.reviewerName}</strong> dành cho <strong>{deletingRev.targetName}</strong> sẽ bị gỡ bỏ vĩnh viễn khỏi cơ sở dữ liệu.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRev(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

