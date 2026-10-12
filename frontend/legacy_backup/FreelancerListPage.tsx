import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { User } from '../types';
import { formatCurrency } from '../utils/format';
import { Search, Star, MapPin, Users, Award, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const FreelancerListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(q);

  const fetchFreelancers = () => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    apiClient
      .get(`/freelancers?${params.toString()}`)
      .then((res) => {
        setFreelancers(res.data.freelancers || []);
      })
      .catch((err) => {
        console.warn('API error, keeping fallback data:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFreelancers();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputVal.trim()) next.set('q', inputVal.trim());
    else next.delete('q');
    setSearchParams(next);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Hero Banner from frontend2 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-indigo-300">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Đội Ngũ Freelancer Đã Xác Thực Danh Tính eKYC & Năng Lực Thực Tế</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Khám Phá Hồ Sơ Freelancer Chuyên Nghiệp
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Xem hồ sơ năng lực chi tiết, điểm tín nhiệm TalentCredit, đánh giá từ khách hàng trước và các dự án thực tế trong Portfolio của từng chuyên gia.
          </p>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <span className="font-extrabold text-slate-900 text-sm">
          Tìm thấy <span className="text-indigo-600 font-black">{freelancers.length}</span> chuyên gia phù hợp
        </span>

        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tìm theo tên hoặc kỹ năng (React, Flutter, Figma)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* 3. Freelancer Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : freelancers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy ứng viên phù hợp"
          description="Hãy thử tìm kiếm với các từ khóa kỹ năng khác hoặc mở rộng tiêu chí tuyển dụng."
          actionText="Xóa bộ lọc tìm kiếm"
          onAction={() => {
            setInputVal('');
            setSearchParams(new URLSearchParams());
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-4 group ring-1 ring-slate-100"
            >
              <div className="space-y-3.5">
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-13 h-13 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center font-black text-lg shadow-sm border border-slate-200 ring-2 ring-indigo-500/20">
                      {f.fullName ? f.fullName.charAt(0) : 'F'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full ring-2 ring-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link to={`/freelancers/${f.id}`} className="block">
                      <h2 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {f.fullName}
                      </h2>
                    </Link>
                    <p className="text-xs text-indigo-600 font-semibold truncate mt-0.5">
                      {f.professionalTitle || f.field || 'Freelancer Chuyên nghiệp'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{f.rating ? f.rating.toFixed(1) : '5.0'}</span>
                      {f.location && (
                        <span className="text-slate-400 font-normal flex items-center gap-0.5 ml-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-rose-500" /> {f.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  "{f.bio || 'Chuyên gia công nghệ sẵn sàng nhận các dự án yêu cầu chất lượng cao.'}"
                </p>

                {f.skills && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {f.skills
                      .split(',')
                      .slice(0, 4)
                      .map((skill, idx) => (
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

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">Mức thù lao</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {f.hourlyRate ? `${formatCurrency(f.hourlyRate)}/h` : 'Thương lượng'}
                  </span>
                </div>

                <Link
                  to={`/freelancers/${f.id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-sm"
                >
                  Xem Hồ Sơ &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
