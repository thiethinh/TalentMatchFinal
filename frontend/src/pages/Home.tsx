import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import {
  Search,
  Star,
  Code,
  Palette,
  Video,
  TrendingUp
} from 'lucide-react';

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
    { name: 'IT & Lập trình Web/App', icon: <Code className="w-6 h-6 text-blue-600" />, count: '140+ Dự án', color: 'bg-blue-50' },
    { name: 'Thiết kế UI/UX & Branding', icon: <Palette className="w-6 h-6 text-indigo-600" />, count: '95+ Dự án', color: 'bg-indigo-50' },
    { name: 'Video Editing & TikTok Ads', icon: <Video className="w-6 h-6 text-purple-600" />, count: '60+ Dự án', color: 'bg-purple-50' },
    { name: 'Digital Marketing & Content', icon: <TrendingUp className="w-6 h-6 text-emerald-600" />, count: '80+ Dự án', color: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Fresh & Bright Daylight Hero Section */}
      <section className="relative min-h-[660px] lg:min-h-[720px] flex items-center justify-center text-slate-900 py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-sky-50/90 via-slate-50/80 to-white">
        
        {/* Real High-Resolution Bright Modern Workspace Video Background with Light Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=85&w=2200"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-multiply"
          >
            <source
              src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4"
              type="video/mp4"
            />
            <source
              src="https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4"
              type="video/mp4"
            />
          </video>
          {/* Fresh bright radiant light overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100/70 via-white/80 to-white" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-sky-300/25 via-blue-200/20 to-transparent blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[450px] h-[260px] bg-emerald-300/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[250px] bg-sky-300/20 blur-[100px] rounded-full pointer-events-none" />
        </div>
        
        {/* Main Center Content */}
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          
          {/* Top Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/90 border border-sky-200/90 px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-sky-950 backdrop-blur-md shadow-xs hover:border-sky-300 transition-all">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sàn Tuyển Dụng Freelancer Uy Tín — Bảo Đảm 100% Tiền Cọc Escrow VNPAY</span>
          </div>

          {/* Headline with Clean, Bold, Fresh Typography */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] text-slate-900">
              <span className="block text-slate-900">Kết Nối Đúng Người</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 font-black">
                Hợp Tác Minh Bạch
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 font-black">
                Kiến Tạo Giá Trị
              </span>
            </h1>
          </div>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
            Hệ sinh thái tuyển dụng dự án & nhân tài số hàng đầu Việt Nam. Nơi kết nối doanh nghiệp với chuyên gia lập trình, thiết kế, marketing chất lượng cao — Toàn bộ tiền cọc được bảo chứng an toàn tại Ví Escrow VNPAY.
          </p>

          {/* Bright Search Box with High-Converting Elements */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-center gap-2.5 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xl shadow-sky-900/5 ring-4 ring-sky-500/10 focus-within:ring-sky-500/30 focus-within:border-sky-400 transition-all"
            >
              <div className="flex-1 flex items-center px-4 w-full">
                <Search className="w-5 h-5 text-sky-600 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên hoặc dự án (ReactJS, Figma, Flutter, TikTok Ads, AI)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
              >
                Tìm Kiếm
              </button>
            </form>

            {/* Quick Search Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
              <span className="text-slate-500 font-semibold">Kỹ năng thịnh hành:</span>
              {['Flutter App', 'Figma UI/UX', 'ReactJS', 'TikTok Ads', 'Python AI', 'Branding'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickTag(tag)}
                  className="bg-white hover:bg-sky-50 text-slate-700 hover:text-blue-700 hover:border-sky-300 px-3 py-1 rounded-full border border-slate-200/90 shadow-xs backdrop-blur-md transition-all font-semibold cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/create-project"
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
            >
              Đăng Tin Tuyển Dụng Ngay
            </Link>
            <Link
              to="/freelancers"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-sm transition-all hover:border-sky-400"
            >
              Xem Hồ Sơ & Portfolio Ứng Viên
            </Link>
          </div>

          {/* 3 Live Feature Highlight Cards with Clean Minimalism */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 text-left">
            <div className="bg-white/95 border-l-4 border-l-sky-500 border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all backdrop-blur-md">
              <h4 className="text-slate-900 font-extrabold text-xs sm:text-sm">Bảo Đảm Escrow VNPAY</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Cọc 100% tạm giữ an toàn, chỉ giải ngân khi chấp nhận nghiệm thu.</p>
            </div>

            <div className="bg-white/95 border-l-4 border-l-emerald-500 border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all backdrop-blur-md">
              <h4 className="text-slate-900 font-extrabold text-xs sm:text-sm">eKYC & TalentCredit</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Xác minh danh tính minh bạch, đánh giá năng lực qua dự án thực tế.</p>
            </div>

            <div className="bg-white/95 border-l-4 border-l-indigo-500 border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all backdrop-blur-md">
              <h4 className="text-slate-900 font-extrabold text-xs sm:text-sm">Rút Tiền Napas 24/7</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Freelancer nhận thù lao nhanh chóng về mọi ngân hàng tại Việt Nam.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Top Categories with Clean Elevation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-3 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/8 hover:-translate-y-1.5 transition-all duration-300 ring-1 ring-slate-100 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                {c.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{c.name}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{c.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Escrow & VNPay 4-Step Process with Clean Step Numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Quy Trình Hợp Tác Tuyển Dụng & Bảo Đảm Escrow VNPAY
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            Mô hình sàn minh bạch loại bỏ hoàn toàn rủi ro bùng tiền, trễ hạn hoặc làm sai cam kết.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              badgeColor: 'bg-sky-600 text-white'
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
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-3 relative hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/8 hover:-translate-y-1.5 transition-all duration-300 ring-1 ring-slate-100 group"
              >
                <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black font-mono shadow-xs ${item.badgeColor}`}>
                  BƯỚC {item.step}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors pt-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Open Projects with Clean Typography */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Dự Án Tuyển Dụng Mới Nhất Đang Mở
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Các dự án đang nhận hồ sơ báo giá từ Freelancer.</p>
          </div>

          <Link
            to="/projects"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Xem tất cả dự án &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.slice(0, 4).map((proj) => (
            <div
              key={proj.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/8 hover:-translate-y-1.5 transition-all duration-300 ring-1 ring-slate-100 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-blue-100">
                    {proj.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Hạn chót: {proj.deadline}</span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">{proj.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{proj.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {proj.requiredSkills.map((sk) => (
                    <span key={sk} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-slate-200/60">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] font-medium">Ngân sách: </span>
                  <span className="font-extrabold text-blue-700 text-sm">{proj.budget.toLocaleString('vi-VN')} đ</span>
                </div>

                <Link
                  to="/projects"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  Nộp Báo Giá ({proj.proposalsCount})
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Top Rated Freelancer Talents Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Ứng Viên Top Rated & Portfolio Năng Lực
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Freelancer có điểm TalentCredit xuất sắc, sẵn sàng nhận dự án.</p>
          </div>

          <Link
            to="/freelancers"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Khám phá tất cả hồ sơ &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelancers.slice(0, 3).map((free) => (
            <div
              key={free.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/8 hover:-translate-y-1.5 transition-all duration-300 ring-1 ring-slate-100 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={free.avatar}
                    alt={free.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{free.name}</h3>
                    <p className="text-[11px] text-blue-600 font-semibold line-clamp-1">{free.title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{free.rating} ({free.reviewCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
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
                className="w-full text-center py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all block shadow-sm"
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
