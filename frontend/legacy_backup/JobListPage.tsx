import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { Job } from '../types';
import { formatCurrency } from '../utils/format';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { Search, Filter, Bookmark, Briefcase, ShieldCheck } from 'lucide-react';

export const JobListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    apiClient
      .get(`/jobs?${params.toString()}`)
      .then((res) => {
        setJobs(res.data.items || []);
        setCategories(res.data.categories || []);
        setTotalItems(res.data.totalItems || 0);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSave = async (jobId: number) => {
    try {
      const res = await apiClient.post(`/jobs/${jobId}/save`);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: res.data.saved } : j))
      );
    } catch (err: any) {
      alert(err.message || 'Không thể lưu công việc.');
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Hero Banner styled as in frontend2 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Thị Trường Dự Án Dịch Vụ Số Chuẩn Escrow VNPAY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Tìm Kiếm Dự Án & Cơ Hội Việc Làm Freelance
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Nơi kết nối các dự án lập trình, thiết kế, video từ các doanh nghiệp uy tín. Mọi hợp đồng đều bắt buộc nạp 100% tiền cọc Escrow trước khi thực hiện.
          </p>
        </div>
      </div>

      {/* 2. Main Search & Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Column */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 font-extrabold text-slate-900 text-sm">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Bộ Lọc Nâng Cao</span>
              </div>
              {(q || category) && (
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Keyword */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800">Từ khóa tìm kiếm:</label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue={q}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateParam('q', (e.target as HTMLInputElement).value);
                    }
                  }}
                  onBlur={(e) => updateParam('q', e.target.value)}
                  placeholder="React, Flutter, Figma..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800">Lĩnh vực chuyên môn:</label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    !category
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả lĩnh vực ({totalItems})
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateParam('category', c)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer truncate ${
                      category === c
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Sort */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800">Sắp xếp theo:</label>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="latest">Mới nhất</option>
                <option value="budget_desc">Ngân sách cao nhất</option>
                <option value="budget_asc">Ngân sách thấp nhất</option>
                <option value="deadline_asc">Hạn chót gần nhất</option>
                <option value="match_desc">Phù hợp nhất</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Right Job List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-extrabold text-slate-900 text-sm">
              Tìm thấy <span className="text-blue-600 font-black">{totalItems}</span> dự án phù hợp
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-3xl" />
              <Skeleton className="h-44 w-full rounded-3xl" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-extrabold text-slate-800 text-base">Không tìm thấy công việc phù hợp</p>
              <p className="text-xs text-slate-500">Hãy thử xóa bớt bộ lọc hoặc tìm kiếm từ khóa khác.</p>
              <button
                onClick={() => setSearchParams(new URLSearchParams())}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/8 hover:-translate-y-1 transition-all duration-300 ring-1 ring-slate-100 space-y-4 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-blue-100">
                          {job.category}
                        </span>
                        {job.featured && (
                          <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                            Nổi bật
                          </span>
                        )}
                        {job.matchScore !== undefined && job.matchScore > 0 && (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                            Phù hợp {job.matchScore}%
                          </span>
                        )}
                      </div>
                      <Link to={`/jobs/${job.id}`}>
                        <h2 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h2>
                      </Link>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-extrabold text-blue-700">{formatCurrency(job.budget)}</p>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {job.priceType === 'HOURLY' ? 'Theo giờ' : 'Giá cố định'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {job.requiredSkills && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
                      {job.requiredSkills.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-slate-200/60"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">{job.customerName || 'Doanh nghiệp'}</span>
                    <span>•</span>
                    <span>{job.postedAgo || 'Vừa đăng'}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-bold">{job.proposalCount || 0} báo giá</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        job.isSaved
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 bg-slate-50'
                      }`}
                      title={job.isSaved ? 'Bỏ lưu' : 'Lưu công việc'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm"
                    >
                      Nộp Báo Giá &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};
