import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';

export const Home: React.FC = () => {
  const { projects, freelancers, currentUser, openAuthModal } = useDemo();
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

  // 4 Danh mục nghề nghiệp cốt lõi của sàn Freelance số
  const categories = [
    {
      name: 'IT & Lập trình Web/App',
      icon: <i className="fa-solid fa-code text-blue-600 text-lg" />,
      count: '140+ Dự án',
      color: 'bg-blue-50 border-blue-100 text-blue-700',
      query: 'IT & Lập trình'
    },
    {
      name: 'Thiết kế UI/UX & Branding',
      icon: <i className="fa-solid fa-pen-ruler text-indigo-600 text-lg" />,
      count: '95+ Dự án',
      color: 'bg-indigo-50 border-indigo-100 text-indigo-700',
      query: 'Thiết kế & Đồ họa'
    },
    {
      name: 'Video Editing & TikTok Ads',
      icon: <i className="fa-solid fa-video text-purple-600 text-lg" />,
      count: '60+ Dự án',
      color: 'bg-purple-50 border-purple-100 text-purple-700',
      query: 'Video & Animation'
    },
    {
      name: 'Digital Marketing & Content',
      icon: <i className="fa-solid fa-chart-line text-emerald-600 text-lg" />,
      count: '80+ Dự án',
      color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
      query: 'Digital Marketing'
    }
  ];

  return (
    <div className="space-y-10 pb-10">

      {/* ================= 1. Fresh & Professional Daylight Hero Section ================= */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        
        {/* Main Content */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          
          {/* Top Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sàn Tuyển Dụng Freelancer Uy Tín — Bảo Đảm 100% Tiền Cọc Escrow VNPAY</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            <span>Kết Nối Đúng Người — </span>
            <span className="text-blue-700">Hợp Tác Minh Bạch, Kiến Tạo Giá Trị</span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Hệ sinh thái tuyển dụng dự án & nhân tài số hàng đầu Việt Nam. Nơi kết nối doanh nghiệp với chuyên gia lập trình, thiết kế, marketing chất lượng cao — Toàn bộ tiền cọc được bảo chứng an toàn tại Ví Escrow VNPAY.
          </p>

          {/* Search Box */}
          <div className="space-y-3 pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10 transition-all"
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
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition-all shrink-0 cursor-pointer shadow-xs"
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
                  type="button"
                  onClick={() => handleQuickTag(tag)}
                  className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs transition-all text-[11px] font-medium cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {currentUser.role === 'employer' || currentUser.role === 'guest' ? (
              <Link
                to="/create-project"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all"
              >
                <i className="fa-solid fa-circle-plus mr-1.5 text-xs" />
                Đăng Dự Án Tuyển Dụng Ngay
              </Link>
            ) : null}

            <Link
              to="/projects"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all"
            >
              <i className="fa-solid fa-briefcase mr-1.5 text-xs" />
              Khám Phá Việc Làm Đang Mở
            </Link>

            <Link
              to="/freelancers"
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-lg border border-slate-300 shadow-2xs transition-all"
            >
              <i className="fa-solid fa-users mr-1.5 text-xs text-slate-500" />
              Xem Hồ Sơ Ứng Viên
            </Link>
          </div>
        </div>

        {/* 3 Core Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3">
            <i className="fa-solid fa-shield-halved text-emerald-600 text-lg shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Bảo Vệ Tiền Cọc 100%</h4>
              <p className="text-[11px] text-slate-500">Giữ trong ví Escrow, chỉ giải ngân khi khách hàng hài lòng.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3">
            <i className="fa-solid fa-star text-amber-500 text-lg shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Đánh Giá Thực 5 Sao</h4>
              <p className="text-[11px] text-slate-500">Dữ liệu từ hợp đồng đã hoàn thành, minh bạch không thể giả mạo.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3">
            <i className="fa-solid fa-clock-rotate-left text-blue-600 text-lg shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Hỗ Trợ Trọng Tài 24/7</h4>
              <p className="text-[11px] text-slate-500">Hội đồng trọng tài xử lý khiếu nại công bằng trong 72 giờ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. 4 Danh Mục Nghề Nghiệp Cốt Lõi Của Sàn ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Danh Mục Chuyên Môn Nổi Bật
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Khám phá các lĩnh vực dịch vụ có nhu cầu tuyển dụng cao nhất.</p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Tất cả danh mục</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/projects?category=${encodeURIComponent(cat.query)}`)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex items-start space-x-3.5"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}>
                {cat.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors leading-snug">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium block mt-1">
                  {cat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. Quy Trình Giao Dịch Escrow 4 Bước ================= */}
      <section id="how" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full inline-block">
            QUY TRÌNH HỢP TÁC AN TOÀN
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Chỉ 4 Bước Để Hoàn Tất Dự Án
          </h2>
          <p className="text-xs text-slate-500">
            Hệ sinh thái tự động bảo vệ quyền lợi cả nhà tuyển dụng và freelancer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2 relative hover:border-blue-300 hover:bg-white hover:shadow-sm transition-all group"
            >
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono ${item.badgeColor}`}>
                BƯỚC {item.step}
              </span>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors pt-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. Featured Open Projects (Dự Án Mới Nhất Đang Mở) ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Dự Án Tuyển Dụng Mới Nhất Đang Mở
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Các dự án đang nhận hồ sơ báo giá từ Freelancer.</p>
          </div>

          <Link
            to="/projects"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Xem tất cả dự án</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((proj) => (
            <div
              key={proj.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                    {proj.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Hạn chót: {proj.deadline}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

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

      {/* ================= 5. Top Rated Freelancer Talents Showcase ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Ứng Viên Top Rated & Portfolio Năng Lực
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Freelancer có điểm TalentCredit xuất sắc, sẵn sàng nhận dự án.</p>
          </div>

          <Link
            to="/freelancers"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Khám phá tất cả hồ sơ</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freelancers.slice(0, 3).map((free) => (
            <div
              key={free.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between group"
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

      {/* ================= 6. Bottom Call to Action ================= */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Sẵn Sàng Bắt Đầu Dự Án Của Bạn?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Đăng tin tuyển dụng miễn phí ngay hôm nay hoặc tạo hồ sơ Freelancer chuyên nghiệp để tiếp cận các hợp đồng giá trị.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/create-project"
            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            + Đăng Tin Tuyển Dụng
          </Link>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="px-6 py-3 bg-blue-900/60 hover:bg-blue-900 text-white rounded-xl font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
          >
            Tạo Tài Khoản Mới
          </button>
        </div>
      </section>

    </div>
  );
};
