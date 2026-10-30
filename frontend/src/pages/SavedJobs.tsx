import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const SavedJobs: React.FC = () => {
  const {
    projects,
    savedProjectIds,
    toggleSaveProject,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filter only saved projects (EXCLUDE COMPANIES as required by user)
  const savedProjects = projects.filter((p) => savedProjectIds.includes(p.id));

  // Get available categories among saved projects
  const categories = ['ALL', ...Array.from(new Set(savedProjects.map((p) => p.category)))];

  const filteredProjects = savedProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <i className="fa-solid fa-heart text-xs" />
            <span>Danh Sách Theo Dõi Riêng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Công Việc Quan Tâm Đã Lưu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Tất cả các dự án bạn đã đánh dấu để chuẩn bị báo giá. Chỉ lưu công việc theo đúng nhu cầu chuyên môn của bạn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <i className="fa-solid fa-magnifying-glass text-xs" />
            <span>Khám Phá Thêm Việc Làm</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên công việc, kỹ năng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
          <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Lĩnh vực:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Jobs List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            <i className="fa-regular fa-heart" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {savedProjects.length === 0
              ? 'Bạn chưa lưu công việc nào'
              : 'Không tìm thấy công việc phù hợp với bộ lọc'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {savedProjects.length === 0
              ? 'Duyệt danh sách Việc làm & Dự án và bấm biểu tượng Trái Tim để lưu lại các bài đăng bạn quan tâm.'
              : 'Thử xóa từ khóa tìm kiếm hoặc chọn danh mục khác để xem lại các công việc đã lưu.'}
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            <i className="fa-solid fa-briefcase text-xs" />
            <span>Tìm việc làm ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-5 sm:p-6 transition-all hover:shadow-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {proj.category}
                    </span>
                    <span className="text-[11px] text-slate-400">• Đăng ngày {proj.createdAt}</span>
                    <span className="text-[11px] text-slate-400">• Hạn: {proj.deadline}</span>
                  </div>

                  <Link
                    to={`/jobs/${proj.id}`}
                    className="block text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {proj.title}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{proj.employerName}</span>
                    {proj.employerVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <i className="fa-solid fa-circle-check text-emerald-600 text-[10px]" />
                        <span>Doanh nghiệp xác thực</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Budget Box */}
                <div className="text-right shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200/80 min-w-[170px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Ngân sách</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-blue-700">
                    {proj.budget.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center justify-end gap-1">
                    <i className="fa-solid fa-shield-halved text-emerald-600 text-[10px]" />
                    <span>{proj.budgetType === 'FIXED' ? 'Trọn gói' : 'Cột mốc Escrow'}</span>
                  </div>
                </div>
              </div>

              {/* Description preview */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {proj.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium mr-1">Kỹ năng:</span>
                {proj.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    toggleSaveProject(proj.id);
                    addToast('Đã bỏ lưu công việc này khỏi danh sách quan tâm.', 'info');
                  }}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <i className="fa-solid fa-trash-can text-xs" />
                  <span>Bỏ lưu việc</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${proj.id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                  >
                    Xem Chi Tiết
                  </Link>

                  <Link
                    to={`/jobs/${proj.id}`}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-paper-plane text-xs" />
                    <span>Nộp Báo Giá</span>
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
