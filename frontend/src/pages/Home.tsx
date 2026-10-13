import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';

export const Home: React.FC = () => {
  const { projects, freelancers } = useDemo();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleQuickTag = (tag: string) => {
    navigate(`/projects?q=${encodeURIComponent(tag)}`);
  };

  const categories = [
    { name: 'IT & Lập trình Web/App', icon: <i className="fa-solid fa-code text-blue-600 text-lg" />, count: '140+ Dự án', color: 'bg-blue-50' },
    { name: 'Thiết kế UI/UX & Branding', icon: <i className="fa-solid fa-pen-ruler text-indigo-600 text-lg" />, count: '95+ Dự án', color: 'bg-indigo-50' },
    { name: 'Video Editing & TikTok Ads', icon: <i className="fa-solid fa-video text-purple-600 text-lg" />, count: '60+ Dự án', color: 'bg-purple-50' },
    { name: 'Digital Marketing & Content', icon: <i className="fa-solid fa-chart-line text-emerald-600 text-lg" />, count: '80+ Dự án', color: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Fresh & Professional Daylight Hero Section */}
      <section className="relative flex items-center justify-center text-slate-900 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
        
        {/* Main Center Content */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sàn Tuyển Dụng Freelancer Uy Tín — Bảo Đảm 100% Tiền Cọc Escrow VNPAY</span>
          </div>

          {/* Headline with Clean, High-Contrast Typography */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight text-slate-900">
              <span className="block text-slate-900">Kết Nối Đúng Người — </span>
              <span className="block text-blue-700">Hợp Tác Minh Bạch, Kiến Tạo Giá Trị</span>
            </h1>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Hệ sinh thái tuyển dụng dự án & nhân tài số hàng đầu Việt Nam. Nơi kết nối doanh nghiệp với chuyên gia lập trình, thiết kế, marketing chất lượng cao — Toàn bộ tiền cọc được bảo chứng an toàn tại Ví Escrow VNPAY.
          </p>

          {/* Search Box */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10 transition-all"
            >
              <div className="flex-1 flex items-center px-3 w-full">
                <i className="fa-solid fa-magnifying-glass text-slate-400 mr-3 text-sm shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên hoặc dự án (ReactJS, Figma, Flutter, TikTok Ads, AI)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none py-1.5"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-md transition-all shrink-0 cursor-pointer shadow-xs"
              >
                Tìm Kiếm
              </button>
            </form>

            {/* Quick Search Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-500 font-medium text-[11px]">Kỹ năng thịnh hành:</span>
              {['Flutter App', 'Figma UI/UX', 'ReactJS', 'TikTok Ads', 'Python AI', 'Branding'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickTag(tag)}
                  className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs transition-all text-[11px] font-medium cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/create-project"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-md shadow-sm transition-all"
            >
              <i className="fa-solid fa-circle-plus mr-1.5 text-xs" />
              Đăng Tin Tuyển Dụng Ngay
            </Link>
            <Link
              to="/freelancers"
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-md border border-slate-300 shadow-2xs transition-all hover:border-blue-400"
            >
              <i className="fa-solid fa-user-tie mr-1.5 text-xs text-slate-600" />
              Xem Hồ Sơ & Portfolio Ứng Viên
            </Link>
          </div>

          {/* 3 Live Feature Highlight Cards with Clean Minimalism */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-left">
            <div className="bg-white border-l-3 border-l-blue-600 border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <h4 className="text-slate-900 font-bold text-xs sm:text-sm">Bảo Đảm Escrow VNPAY</h4>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">Cọc 100% tạm giữ an toàn, chỉ giải ngân khi chấp nhận nghiệm thu.</p>
            </div>

            <div className="bg-white border-l-3 border-l-emerald-500 border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <h4 className="text-slate-900 font-bold text-xs sm:text-sm">eKYC & TalentCredit</h4>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">Xác minh danh tính minh bạch, đánh giá năng lực qua dự án thực tế.</p>
            </div>

            <div className="bg-white border-l-3 border-l-indigo-500 border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <h4 className="text-slate-900 font-bold text-xs sm:text-sm">Rút Tiền Napas 24/7</h4>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">Freelancer nhận thù lao nhanh chóng về mọi ngân hàng tại Việt Nam.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Top Categories with Clean Elevation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${c.color}`}>
                {c.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{c.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{c.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Escrow & VNPay 4-Step Process with Clean Step Numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quy Trình Hợp Tác Tuyển Dụng & Bảo Đảm Escrow VNPAY
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
            Mô hình sàn minh bạch loại bỏ hoàn toàn rủi ro bùng tiền, trễ hạn hoặc làm sai cam kết.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Đăng Bài Tuyển Dụng',
              desc: 'Nhà tuyển dụng tạo dự án với mô tả chi tiết, kỹ năng yêu cầu và ngân sách dự kiến.',
              badgeColor: 'bg-blue-600 text-white'
            },
            {
              step: '02',
              title: 'Freelancer Nộp Proposal',
              desc: 'Ứng viên gửi báo giá, thời hạn bàn giao, giải pháp thực hiện kèm link Portfolio chứng minh năng lực.',
              badgeColor: 'bg-indigo-600 text-white'
            },
            {
              step: '03',
              title: 'Ký Hợp Đồng & Nạp Cọc VNPAY',
              desc: 'Nhà tuyển dụng chấp nhận báo giá và nạp 100% tiền cọc vào Ví Tạm Giữ Escrow qua cổng VNPAY.',
              badgeColor: 'bg-blue-600 text-white'
            },
            {
              step: '04',
              title: 'Nghiệm Thu & Giải Ngân',
              desc: 'Freelancer nộp sản phẩm. Nhà tuyển dụng kiểm tra, yêu cầu sửa đổi hoặc nghiệm thu để giải ngân tiền.',
              badgeColor: 'bg-emerald-600 text-white'
            }
          ].map((item, idx) => {
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2 relative hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono ${item.badgeColor}`}>
                  BƯỚC {item.step}
                </span>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors pt-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Open Projects with Clean Typography */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Dự Án Tuyển Dụng Mới Nhất Đang Mở
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Các dự án đang nhận hồ sơ báo giá từ Freelancer.</p>
          </div>

          <Link
            to="/projects"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Xem tất cả dự án &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((proj) => (
            <div
              key={proj.id}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                    {proj.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Hạn chót: {proj.deadline}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">{proj.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{proj.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {proj.requiredSkills.map((sk) => (
                    <span key={sk} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200/60">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Ngân sách: </span>
                  <span className="font-bold text-blue-700 text-sm">{proj.budget.toLocaleString('vi-VN')} đ</span>
                </div>

                <Link
                  to="/projects"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-md transition-all shadow-2xs"
                >
                  Nộp Báo Giá ({proj.proposalsCount})
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Top Rated Freelancer Talents Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Ứng Viên Top Rated & Portfolio Năng Lực
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Freelancer có điểm TalentCredit xuất sắc, sẵn sàng nhận dự án.</p>
          </div>

          <Link
            to="/freelancers"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Khám phá tất cả hồ sơ &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {freelancers.slice(0, 3).map((free) => (
            <div
              key={free.id}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={free.avatar}
                    alt={free.name}
                    className="w-11 h-11 rounded-md object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{free.name}</h3>
                    <p className="text-[11px] text-blue-600 font-semibold line-clamp-1">{free.title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                      <i className="fa-solid fa-star text-amber-400 text-[11px]" />
                      <span>{free.rating} ({free.reviewCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic line-clamp-3 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                  "{free.bio}"
                </p>

                {free.portfolioUrl && (
                  <a
                    href={free.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <span>Xem link Portfolio cá nhân &rarr;</span>
                  </a>
                )}
              </div>

              <Link
                to="/freelancers"
                className="w-full text-center py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-md transition-all block shadow-2xs"
              >
                Xem Hồ Sơ & Mời Báo Giá
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
