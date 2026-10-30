import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Pagination } from '../../components/common/Pagination';

export const AdminProjects: React.FC = () => {
  const { projects, adminUpdateProjectStatus, categories } = useApp();

  // Search & Filter States
  const [projectSearch, setProjectSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | 'expiring'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Category filter
      if (categoryFilter !== 'ALL' && proj.category !== categoryFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && proj.status !== statusFilter) return false;

      // Time filter
      if (timeFilter !== 'all') {
        const projDate = proj.createdAt ? new Date(proj.createdAt).getTime() : 0;
        const now = new Date().getTime();
        if (timeFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (projDate < today.getTime()) return false;
        } else if (timeFilter === '7days') {
          if (now - projDate > 7 * 86400000) return false;
        } else if (timeFilter === 'expiring') {
          const deadline = proj.deadline ? new Date(proj.deadline).getTime() : 0;
          const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
          if (diffDays > 7 || diffDays < 0) return false;
        }
      }

      // Search match
      if (projectSearch.trim()) {
        const q = projectSearch.toLowerCase();
        const title = (proj.title || '').toLowerCase();
        const emp = (proj.employerName || '').toLowerCase();
        const comp = (proj.employerCompany || '').toLowerCase();
        const desc = (proj.description || '').toLowerCase();
        return title.includes(q) || emp.includes(q) || comp.includes(q) || desc.includes(q);
      }

      return true;
    });
  }, [projects, categoryFilter, statusFilter, timeFilter, projectSearch]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, timeFilter, projectSearch]);

  // Pagination calculations
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = projects.length;
    const open = projects.filter((p) => p.status === 'OPEN').length;
    const inProgress = projects.filter((p) => p.status === 'IN_PROGRESS').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    return { total, open, inProgress, completed, totalBudget };
  }, [projects]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Header */}
      <AdminHeader
        title="Quản Lý & Kiểm Duyệt Bài Tuyển Dụng"
        subtitle="Giám sát mọi tin đăng dự án từ Nhà tuyển dụng, quản lý ngân sách, hồ sơ ứng tuyển và thời hạn nộp báo giá."
        icon="fa-briefcase"
        badge={`${projects.length} dự án`}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng dự án</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{summary.total}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Tất cả trạng thái</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang tuyển (OPEN)</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">{summary.open}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Nhận hồ sơ báo giá</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang làm (IN_PROGRESS)</div>
          <div className="text-xl font-extrabold text-purple-600 mt-1 font-mono">{summary.inProgress}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">Đã chốt Freelancer</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã hoàn thành</div>
          <div className="text-xl font-extrabold text-indigo-600 mt-1 font-mono">{summary.completed}</div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Nghiệm thu xong</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng giá trị ngân sách</div>
          <div className="text-base font-extrabold text-blue-700 mt-1 font-mono truncate">
            {summary.totalBudget.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Toàn sàn</div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-blue-600 text-sm" />
              <span>Danh Sách Tin Tuyển Dụng Dự Án</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredProjects.length} tin
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lọc theo ngành nghề, trạng thái, thời hạn hoặc từ khóa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-44">
              <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, người đăng..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả lĩnh vực</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">🟢 OPEN (Đang nhận báo giá)</option>
              <option value="IN_PROGRESS">🟣 IN_PROGRESS (Đang làm)</option>
              <option value="COMPLETED">🔵 COMPLETED (Đã xong)</option>
              <option value="CANCELLED">🔴 CANCELLED (Đã hủy/Tạm dừng)</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">Mọi thời gian</option>
              <option value="today">Đăng hôm nay</option>
              <option value="7days">Đăng 7 ngày qua</option>
              <option value="expiring">Sắp hết hạn (≤ 7 ngày)</option>
            </select>
          </div>
        </div>

        {/* Project Items List */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {paginatedProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fa-solid fa-folder-open text-3xl mb-2 block" />
              Không có dự án nào khớp với tiêu chí tìm kiếm.
            </div>
          ) : (
            paginatedProjects.map((proj) => {
              const deadlineDate = new Date(proj.deadline || '2026-10-30');
              const now = new Date();
              const diffTime = deadlineDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={proj.id}
                  className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-blue-200">
                          {proj.category}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                            proj.status === 'OPEN'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : proj.status === 'IN_PROGRESS'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : proj.status === 'COMPLETED'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {proj.status}
                        </span>

                        <span className="text-slate-500 text-xs flex items-center gap-1 font-mono">
                          <i className="fa-regular fa-calendar-plus text-slate-400" />
                          <span>Đăng ngày: {proj.createdAt ? proj.createdAt.substring(0, 10) : '2026-10-15'}</span>
                        </span>

                        {proj.deadline && (
                          <span
                            className={`text-xs flex items-center gap-1 font-medium px-2 py-0.5 rounded-md ${
                              diffDays > 5
                                ? 'bg-slate-200/80 text-slate-700'
                                : diffDays > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <i className="fa-regular fa-clock" />
                            <span>Hạn chót: {proj.deadline}</span>
                            <span className="font-bold">
                              ({diffDays > 0 ? `Còn ${diffDays} ngày` : 'Đã hết hạn'})
                            </span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                        {proj.title}
                      </h3>

                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <span>
                          Người đăng: <strong className="text-slate-800">{proj.employerName}</strong>
                          {proj.employerCompany && (
                            <span className="text-slate-500 font-medium"> ({proj.employerCompany})</span>
                          )}
                        </span>
                        {proj.id && <span className="font-mono text-slate-400">ID #{proj.id}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0 bg-white p-3 rounded-lg border border-slate-200/80">
                      <div className="text-[11px] text-slate-500 font-medium">Ngân sách dự kiến:</div>
                      <div className="text-base font-extrabold text-blue-700 font-mono">
                        {(proj.budget || 0).toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        <i className="fa-solid fa-file-invoice text-emerald-600 mr-1" />
                        {proj.proposalsCount || 0} Báo giá gửi đến
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-slate-100">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Kỹ năng:</span>
                      {(proj.requiredSkills || []).map((sk) => (
                        <span
                          key={sk}
                          className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={proj.status}
                        onChange={(e) => adminUpdateProjectStatus(proj.id, e.target.value as any)}
                        className="bg-white border border-slate-300 rounded-lg text-xs px-2.5 py-1 font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="OPEN">OPEN (Đang mở)</option>
                        <option value="IN_PROGRESS">IN_PROGRESS (Đang làm)</option>
                        <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
                        <option value="CANCELLED">CANCELLED (Hủy / Đóng)</option>
                      </select>

                      {proj.status === 'OPEN' ? (
                        <button
                          type="button"
                          onClick={() => adminUpdateProjectStatus(proj.id, 'CANCELLED')}
                          className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg border border-rose-200 text-xs cursor-pointer transition-colors"
                        >
                          Tạm Dừng Tin
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => adminUpdateProjectStatus(proj.id, 'OPEN')}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg border border-emerald-200 text-xs cursor-pointer transition-colors"
                        >
                          Mở Lại Tin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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
    </div>
  );
};
