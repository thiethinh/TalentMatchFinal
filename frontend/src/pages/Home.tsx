import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Home: React.FC = () => {
  const { projects, freelancers, currentUser, openAuthModal } = useApp();
  const navigate = useNavigate();

  const getCatCount = (query: string) => {
    const matched = projects.filter(
      (p) =>
        p.category?.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(p.category?.toLowerCase() || '')
    ).length;
    return `${matched} Dự án`;
  };

  // 4 Danh mục nghề nghiệp cốt lõi của sàn Freelance số (Dữ liệu động theo MySQL)
  const categories = [
    {
      name: 'IT & Lập trình Web/App',
      icon: <i className="fa-solid fa-code text-[#2563EB] text-lg" />,
      count: getCatCount('IT & Lập trình'),
      color: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      query: 'IT & Lập trình'
    },
    {
      name: 'Thiết kế UI/UX & Branding',
      icon: <i className="fa-solid fa-pen-ruler text-[#4338CA] text-lg" />,
      count: getCatCount('Thiết kế'),
      color: 'bg-indigo-50 border-indigo-100 text-indigo-700',
      query: 'Thiết kế & Đồ họa'
    },
    {
      name: 'Video Editing & TikTok Ads',
      icon: <i className="fa-solid fa-video text-purple-600 text-lg" />,
      count: getCatCount('Video'),
      color: 'bg-purple-50 border-purple-100 text-purple-700',
      query: 'Video & Animation'
    },
    {
      name: 'Digital Marketing & Content',
      icon: <i className="fa-solid fa-chart-line text-[#059669] text-lg" />,
      count: getCatCount('Marketing'),
      color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
      query: 'Digital Marketing'
    }
  ];

  return (
    <div className="space-y-10 pb-10">

      {/* ================= 1. Ultra-Minimal & Smart Hero Banner (#DBEAFE, #1E3A8A) ================= */}
      <section className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mx-auto text-center space-y-3.5">
          
          {/* Subtle Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 text-[#1D4ED8] border border-[#BFDBFE] px-3 py-1 rounded-full text-xs font-semibold shadow-2xs">
            <i className="fa-solid fa-shield-halved text-[#059669] text-xs" />
            <span>Bảo chứng 100% tiền cọc tại Ví Escrow VNPAY</span>
          </div>

          {/* Clean, Authoritative Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1E3A8A] leading-tight">
            Kết Nối Nhân Tài Số — Hợp Tác Minh Bạch
          </h1>

          {/* Concise Single-Sentence Subtitle */}
          <p className="text-[#1E3A8A]/85 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-normal">
            Sàn giao dịch việc làm freelance chất lượng cao. Khám phá các dự án lập trình, thiết kế và marketing số có sẵn ngân sách ký quỹ an toàn.
          </p>

          {/* Smart & Focused Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <Link
              to="/projects"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-briefcase text-xs" />
              <span>Khám Phá Việc Làm Đang Mở</span>
            </Link>

            {currentUser.role === 'employer' || currentUser.role === 'guest' ? (
              <Link
                to="/create-project"
                className="px-5 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#1E3A8A] font-bold text-xs sm:text-sm rounded-xl border border-[#BFDBFE] shadow-2xs transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-plus text-xs text-[#059669]" />
                <span>Đăng Dự Án Mới</span>
              </Link>
            ) : (
              <Link
                to="/freelancers"
                className="px-5 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#1E3A8A] font-bold text-xs sm:text-sm rounded-xl border border-[#BFDBFE] shadow-2xs transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-users text-xs text-[#2563EB]" />
                <span>Khám Phá Freelancer</span>
              </Link>
            )}
          </div>

          {/* Smart Inline Highlights Strip (Replaces bulky cards, minimal & high contrast) */}
          <div className="pt-4 border-t border-[#BFDBFE]/80 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] font-medium text-[#1E3A8A]/90">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-[#059669] text-xs" />
              <span>Cọc tạm giữ Escrow 100%</span>
            </span>
            <span className="text-[#BFDBFE] hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-star text-[#D97706] text-xs" />
              <span>Đánh giá thực từ hợp đồng hoàn tất</span>
            </span>
            <span className="text-[#BFDBFE] hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-scale-balanced text-[#2563EB] text-xs" />
              <span>Hỗ trợ trọng tài xử lý tranh chấp 24/7</span>
            </span>
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
              className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs hover:border-[#93C5FD] transition-colors cursor-pointer group flex items-start space-x-3.5"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}>
                {cat.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#0F172A] text-sm group-hover:text-[#2563EB] transition-colors leading-snug">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-[#64748B] font-medium block mt-1">
                  {cat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. Quy Trình Giao Dịch Escrow 4 Bước ================= */}
      <section id="how" className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-widest bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 rounded-full inline-block">
            QUY TRÌNH HỢP TÁC AN TOÀN
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Chỉ 4 Bước Để Hoàn Tất Dự Án
          </h2>
          <p className="text-xs text-[#64748B]">
            Hệ sinh thái tự động bảo vệ quyền lợi cả nhà tuyển dụng và freelancer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Đăng Bài Tuyển Dụng',
              desc: 'Nhà tuyển dụng tạo dự án với mô tả chi tiết, kỹ năng yêu cầu và ngân sách dự kiến.',
              badgeColor: 'bg-[#2563EB] text-white'
            },
            {
              step: '02',
              title: 'Freelancer Nộp Proposal',
              desc: 'Freelancer gửi báo giá, thời hạn bàn giao, giải pháp thực hiện kèm link Portfolio chứng minh năng lực.',
              badgeColor: 'bg-[#4338CA] text-white'
            },
            {
              step: '03',
              title: 'Ký Hợp Đồng & Nạp Cọc VNPAY',
              desc: 'Nhà tuyển dụng chấp nhận báo giá và nạp 100% tiền cọc vào Ví Tạm Giữ Escrow qua cổng VNPAY.',
              badgeColor: 'bg-[#2563EB] text-white'
            },
            {
              step: '04',
              title: 'Nghiệm Thu & Giải Ngân',
              desc: 'Freelancer nộp sản phẩm. Nhà tuyển dụng kiểm tra, yêu cầu sửa đổi hoặc nghiệm thu để giải ngân tiền.',
              badgeColor: 'bg-[#059669] text-white'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E5E7EB] space-y-2 relative hover:border-[#93C5FD] hover:bg-white transition-colors group"
            >
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono ${item.badgeColor}`}>
                BƯỚC {item.step}
              </span>
              <h3 className="font-bold text-[#0F172A] text-sm group-hover:text-[#2563EB] transition-colors pt-1">
                {item.title}
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. Featured Open Projects (Dự Án Mới Nhất Đang Mở) ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">
              Dự Án Tuyển Dụng Mới Nhất Đang Mở
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">Các dự án đang nhận hồ sơ báo giá từ Freelancer.</p>
          </div>

          <Link
            to="/projects"
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1"
          >
            <span>Xem tất cả dự án</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((proj) => (
            <div
              key={proj.id}
              className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs hover:border-[#93C5FD] transition-colors space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#BFDBFE]">
                    {proj.category}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] font-medium">Hạn chót: {proj.deadline}</span>
                </div>

                <Link to={`/jobs/${proj.id}`} className="block font-bold text-[#0F172A] text-base line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                  {proj.title}
                </Link>
                <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {proj.requiredSkills.map((sk) => (
                    <span key={sk} className="bg-[#F1F5F9] text-[#475569] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#64748B] text-[11px]">Ngân sách: </span>
                  <span className="font-bold text-[#1D4ED8] text-sm">{proj.budget.toLocaleString('vi-VN')} đ</span>
                </div>

                <Link
                  to={`/jobs/${proj.id}`}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  Xem & Nộp Giá ({proj.proposalsCount})
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. Top Rated Freelancer Talents Showcase ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">
              Freelancer Nổi Bật & Portfolio Năng Lực
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">Freelancer có điểm TalentCredit xuất sắc, sẵn sàng nhận dự án.</p>
          </div>

          <Link
            to="/freelancers"
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1"
          >
            <span>Khám phá tất cả hồ sơ</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freelancers.slice(0, 3).map((free) => (
            <div
              key={free.id}
              className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs hover:border-[#93C5FD] transition-colors space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={free.avatar}
                    alt={free.name}
                    className="w-11 h-11 rounded-lg object-cover border border-[#E5E7EB]"
                  />
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-sm group-hover:text-[#2563EB] transition-colors">{free.name}</h3>
                    <p className="text-[11px] text-[#2563EB] font-semibold line-clamp-1">{free.title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-[#D97706] font-bold mt-0.5">
                      <i className="fa-solid fa-star text-amber-400 text-[11px]" />
                      <span>{free.rating} ({free.reviewCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#475569] italic line-clamp-3 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E7EB]">
                  "{free.bio}"
                </p>

                {free.portfolioUrl && (
                  <a
                    href={free.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    <span>Xem link Portfolio cá nhân &rarr;</span>
                  </a>
                )}
              </div>

              <Link
                to="/freelancers"
                className="w-full text-center py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg transition-colors block shadow-xs"
              >
                Xem Hồ Sơ & Mời Báo Giá
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 6. Bottom Call to Action (Nền xanh lam nhạt phẳng #DBEAFE, Chữ tiêu đề #1E3A8A - Tuyệt đối không dùng gradient) ================= */}
      <section className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-2xl p-8 sm:p-10 text-[#1E3A8A] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E3A8A]">
            Sẵn Sàng Bắt Đầu Dự Án Của Bạn?
          </h2>
          <p className="text-xs sm:text-sm text-[#1E3A8A]/85 max-w-xl leading-relaxed font-normal">
            Đăng tin tuyển dụng miễn phí ngay hôm nay hoặc tạo hồ sơ Freelancer chuyên nghiệp để tiếp cận các hợp đồng giá trị.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/create-project"
            className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            + Đăng Tin Tuyển Dụng
          </Link>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="px-6 py-3 bg-white hover:bg-[#F8FAFC] text-[#1E3A8A] rounded-xl font-bold text-xs sm:text-sm border border-[#BFDBFE] shadow-2xs transition-colors cursor-pointer"
          >
            Tạo Tài Khoản Mới
          </button>
        </div>
      </section>

    </div>
  );
};
