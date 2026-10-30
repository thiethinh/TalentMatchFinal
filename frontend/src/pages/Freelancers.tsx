import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { FreelancerProfile, PortfolioItem, Project } from '../types';

interface CategoryConfig {
  id: string;
  name: string;
  subcategories: { id: string; name: string; skills: string[] }[];
}

const CATEGORY_DATA: CategoryConfig[] = [
  {
    id: 'IT & Lập trình',
    name: 'IT & Lập trình Web/App',
    subcategories: [
      { id: 'all_it', name: 'Tất cả IT & Lập trình', skills: [] },
      { id: 'web_frontend', name: 'Web Frontend (React, Vue, Next.js)', skills: ['ReactJS', 'Next.js', 'Tailwind CSS', 'TypeScript'] },
      { id: 'backend_api', name: 'Backend & API (Node.js, Python, MySQL)', skills: ['Node.js', 'REST API', 'MySQL', 'PostgreSQL', 'Java', 'Spring Boot'] },
      { id: 'mobile_app', name: 'Mobile App (Flutter, React Native)', skills: ['Flutter', 'Mobile UI'] },
      { id: 'ai_data', name: 'AI, LLM & Backend Python', skills: ['Python', 'FastAPI', 'AI/LLM'] }
    ]
  },
  {
    id: 'Thiết kế & Đồ họa',
    name: 'Thiết kế & Sáng tạo',
    subcategories: [
      { id: 'all_design', name: 'Tất cả Thiết kế', skills: [] },
      { id: 'ui_ux', name: 'UI/UX App & Web Design (Figma)', skills: ['UI/UX Design', 'Figma', 'Design System'] },
      { id: 'branding_logo', name: 'Branding & Logo Design', skills: ['Branding', 'Logo Design', 'Adobe Illustrator'] },
      { id: 'design_3d', name: '3D Game & Hoạt Họa Animation', skills: ['Blender', '3Ds Max', 'Unreal Engine 5'] }
    ]
  },
  {
    id: 'Video & Animation',
    name: 'Video & Media Animation',
    subcategories: [
      { id: 'all_video', name: 'Tất cả Video', skills: [] },
      { id: 'tiktok_ads', name: 'Video Ngắn TikTok Ads & Reels', skills: ['TikTok Ads', 'Premiere Pro', 'Color Grading'] },
      { id: 'motion_2d', name: 'Motion Graphics & After Effects', skills: ['After Effects', 'Motion Graphics'] }
    ]
  },
  {
    id: 'Digital Marketing',
    name: 'Digital Marketing & SEO',
    subcategories: [
      { id: 'all_mkt', name: 'Tất cả Marketing', skills: [] },
      { id: 'seo_content', name: 'SEO Google & Content Marketing', skills: ['SEO Google', 'Content Marketing', 'Copywriting'] },
      { id: 'performance_ads', name: 'Chạy Ads Facebook/Google', skills: ['Facebook Ads', 'Google Ads', 'Meta Ads'] }
    ]
  },
  {
    id: 'Viết lách & Nội dung',
    name: 'Viết lách & Dịch thuật',
    subcategories: [
      { id: 'all_writing', name: 'Tất cả Viết lách & Dịch thuật', skills: [] },
      { id: 'content_writing', name: 'Content Marketing & Copywriting', skills: ['Content Strategy', 'SEO Writing', 'Copywriting'] },
      { id: 'translation', name: 'Biên phiên dịch Anh - Nhật - Trung', skills: ['Dịch thuật Anh - Việt', 'Nhật - Việt', 'Localization'] }
    ]
  }
];

const HOURLY_RATE_PRESETS = [
  { label: 'Tất cả mức giá', min: 0, max: Infinity },
  { label: 'Dưới 200k/giờ', min: 0, max: 200000 },
  { label: '200k - 350k/giờ', min: 200000, max: 350000 },
  { label: '350k - 500k/giờ', min: 350000, max: 500000 },
  { label: 'Trên 500k/giờ', min: 500000, max: Infinity }
];

const POPULAR_SKILLS = [
  'ReactJS',
  'Next.js',
  'Node.js',
  'TypeScript',
  'Flutter',
  'Figma',
  'UI/UX Design',
  'Branding',
  'Premiere Pro',
  'After Effects',
  'TikTok Ads',
  'Facebook Ads',
  'Google Ads',
  'SEO Google',
  'Python',
  'FastAPI'
];

export const Freelancers: React.FC = () => {
  const {
    freelancers,
    projects,
    currentUser,
    addToast,
    toggleSaveFreelancer,
    isFreelancerSaved,
    sendProjectInvitation
  } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [selectedRatePreset, setSelectedRatePreset] = useState<number>(0);
  const [minRateInput, setMinRateInput] = useState<string>('');
  const [maxRateInput, setMaxRateInput] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<string>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [minCompletedOrders, setMinCompletedOrders] = useState<number>(0);
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'credit_desc' | 'rating_desc' | 'orders_desc' | 'rate_asc' | 'rate_desc'>('credit_desc');

  // Modals
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerProfile | null>(null);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  // Toggle skills
  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Mobile Drawer & UI States
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close mobile filter drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFilterOpen) {
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileFilterOpen]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMainCategory('ALL');
    setSelectedSubcategory('ALL');
    setSelectedRatePreset(0);
    setMinRateInput('');
    setMaxRateInput('');
    setSelectedBadge('ALL');
    setMinRating(0);
    setMinCompletedOrders(0);
    setSelectedLocation('ALL');
    setSelectedSkills([]);
    setSortBy('credit_desc');
    setCurrentPage(1);
  };

  // Filter logic
  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((f) => {
      // 1. Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchTitle = f.title.toLowerCase().includes(q);
        const matchBio = f.bio.toLowerCase().includes(q);
        const matchLocation = f.location.toLowerCase().includes(q);
        const matchSkills = f.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchBio && !matchLocation && !matchSkills) {
          return false;
        }
      }

      // 2. Category & Subcategory
      if (selectedMainCategory !== 'ALL') {
        const catConfig = CATEGORY_DATA.find((c) => c.id === selectedMainCategory);
        if (selectedSubcategory !== 'ALL') {
          const sub = catConfig?.subcategories.find((s) => s.id === selectedSubcategory);
          if (sub && sub.skills.length > 0) {
            const hasSubSkill = f.skills.some((sk) => sub.skills.includes(sk));
            if (!hasSubSkill) return false;
          }
        } else {
          // Check if matches any subcategory skill or portfolio category
          const hasPortfolioCat = f.portfolio.some((p) => p.category.includes(selectedMainCategory));
          const allCatSkills = catConfig?.subcategories.flatMap((s) => s.skills) || [];
          const hasAnyCatSkill = f.skills.some((sk) => allCatSkills.includes(sk));
          if (!hasPortfolioCat && !hasAnyCatSkill) return false;
        }
      }

      // 3. Hourly Rate Range Filter
      const rate = f.hourlyRate || 300000;
      const customMin = minRateInput ? parseInt(minRateInput.replace(/\D/g, ''), 10) : 0;
      const customMax = maxRateInput ? parseInt(maxRateInput.replace(/\D/g, ''), 10) : Infinity;

      if (minRateInput || maxRateInput) {
        if (rate < customMin || rate > customMax) return false;
      } else if (selectedRatePreset > 0) {
        const preset = HOURLY_RATE_PRESETS[selectedRatePreset];
        if (rate < preset.min || rate > preset.max) return false;
      }

      // 4. TalentCredit Badge Filter
      if (selectedBadge !== 'ALL' && f.talentCreditBadge !== selectedBadge) {
        return false;
      }

      // 5. Min Rating Filter
      if (minRating > 0 && f.rating < minRating) {
        return false;
      }

      // 6. Min Completed Orders Filter
      if (minCompletedOrders > 0 && f.completedOrders < minCompletedOrders) {
        return false;
      }

      // 7. Location Filter
      if (selectedLocation !== 'ALL') {
        if (!f.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 8. Selected Skills Filter
      if (selectedSkills.length > 0) {
        const hasAllSelected = selectedSkills.some((s) => f.skills.includes(s));
        if (!hasAllSelected) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'credit_desc') return b.talentCreditScore - a.talentCreditScore;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'orders_desc') return b.completedOrders - a.completedOrders;
      if (sortBy === 'rate_asc') return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      if (sortBy === 'rate_desc') return (b.hourlyRate || 0) - (a.hourlyRate || 0);
      return 0;
    });
  }, [
    freelancers,
    searchQuery,
    selectedMainCategory,
    selectedSubcategory,
    selectedRatePreset,
    minRateInput,
    maxRateInput,
    selectedBadge,
    minRating,
    minCompletedOrders,
    selectedLocation,
    selectedSkills,
    sortBy
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedMainCategory !== 'ALL') count++;
    if (selectedSubcategory !== 'ALL') count++;
    if (selectedRatePreset > 0 || minRateInput || maxRateInput) count++;
    if (selectedBadge !== 'ALL') count++;
    if (minRating > 0) count++;
    if (minCompletedOrders > 0) count++;
    if (selectedLocation !== 'ALL') count++;
    if (selectedSkills.length > 0) count += selectedSkills.length;
    return count;
  }, [
    searchQuery,
    selectedMainCategory,
    selectedSubcategory,
    selectedRatePreset,
    minRateInput,
    maxRateInput,
    selectedBadge,
    minRating,
    minCompletedOrders,
    selectedLocation,
    selectedSkills
  ]);

  // Reset page to 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedMainCategory,
    selectedSubcategory,
    selectedRatePreset,
    minRateInput,
    maxRateInput,
    selectedBadge,
    minRating,
    minCompletedOrders,
    selectedLocation,
    selectedSkills,
    sortBy
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage) || 1;
  const paginatedFreelancers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFreelancers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFreelancers, currentPage, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleOpenInvite = (free: FreelancerProfile) => {
    setSelectedFreelancer(free);
    setInviteMessage(`Chào ${free.name}, mình đại diện doanh nghiệp rất ấn tượng với profile của bạn và muốn mời bạn phụ trách dự án này.`);
    setShowInviteModal(true);
  };

  const handleInviteToProject = (proj: Project) => {
    if (!selectedFreelancer) return;
    sendProjectInvitation({
      projectId: proj.id,
      freelancerId: selectedFreelancer.id,
      message: inviteMessage
    });
    setShowInviteModal(false);
  };

  const renderFilterContent = (showTitle = true) => (
    <div className="space-y-5">
      {showTitle && (
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center space-x-2 font-bold text-[#0F172A] text-sm">
            <i className="fa-solid fa-sliders text-[#2563EB] text-xs" />
            <span>Bộ Lọc Freelancer</span>
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-bold flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-xs" />
              <span>Xóa lọc ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Main Category */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800">Lĩnh vực chuyên môn:</label>
        <div className="relative">
          <select
            value={selectedMainCategory}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              setSelectedSubcategory('ALL');
            }}
            className="w-full appearance-none pl-3.5 pr-9 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
          >
            <option value="ALL">Tất cả lĩnh vực</option>
            {CATEGORY_DATA.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down text-slate-500 text-xs absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Subcategory Selector */}
      {selectedMainCategory !== 'ALL' && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-[#2563EB] flex items-center gap-1.5">
            <i className="fa-solid fa-chevron-right text-[#2563EB] text-xs" />
            <span>Nhóm nhỏ chuyên sâu:</span>
          </label>
          <div className="space-y-1 bg-blue-50/40 p-2 rounded-lg border border-blue-100">
            {CATEGORY_DATA.find((c) => c.id === selectedMainCategory)?.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedSubcategory === sub.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'hover:bg-blue-100/70 text-slate-700'
                }`}
              >
                <span className="truncate">{sub.name}</span>
                {selectedSubcategory === sub.id && <i className="fa-solid fa-circle-check text-white text-xs shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hourly Rate Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <i className="fa-solid fa-money-bill text-[#059669] text-xs" />
          <span>Mức thù lao / giờ (VND):</span>
        </label>

        {/* Custom Min - Max input */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tối thiểu (Min)</label>
            <input
              type="text"
              placeholder="VD: 200000"
              value={minRateInput}
              onChange={(e) => {
                setMinRateInput(e.target.value);
                setSelectedRatePreset(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tối đa (Max)</label>
            <input
              type="text"
              placeholder="VD: 500000"
              value={maxRateInput}
              onChange={(e) => {
                setMaxRateInput(e.target.value);
                setSelectedRatePreset(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Rate Presets */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Khoảng giá nhanh:</span>
          <div className="flex flex-wrap gap-1">
            {HOURLY_RATE_PRESETS.map((p, idx) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setSelectedRatePreset(idx);
                  setMinRateInput('');
                  setMaxRateInput('');
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                  selectedRatePreset === idx && !minRateInput && !maxRateInput
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TalentCredit Badge Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <i className="fa-solid fa-award text-amber-500 text-xs" />
          <span>Huy hiệu Tín Nhiệm (Credit):</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {['ALL', 'TOP_RATED_PLUS', 'TOP_RATED', 'RISING_TALENT'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBadge(b)}
              className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-bold transition-all cursor-pointer truncate ${
                selectedBadge === b ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {b === 'ALL'
                ? 'Tất cả'
                : b === 'TOP_RATED_PLUS'
                ? '★ Top Rated Plus'
                : b === 'TOP_RATED'
                ? 'Top Rated'
                : 'Rising Talent'}
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating Filter */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <i className="fa-solid fa-star text-amber-400 text-xs" />
          <span>Đánh giá sao tối thiểu:</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
          {[0, 4.0, 4.5, 4.8].map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setMinRating(rt)}
              className={`py-1 rounded-lg border text-center text-[11px] transition-all cursor-pointer ${
                minRating === rt ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {rt === 0 ? 'Tất cả' : `${rt}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <i className="fa-solid fa-location-dot text-rose-500 text-xs" />
          <span>Khu vực địa lý:</span>
        </label>
        <div className="relative">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full appearance-none pl-3.5 pr-9 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
          >
            <option value="ALL">Toàn quốc (Tất cả khu vực)</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
          <i className="fa-solid fa-chevron-down text-slate-500 text-xs absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Skills Filter (No nested scroll trap) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <i className="fa-solid fa-tag text-[#2563EB] text-xs" />
            <span>Kỹ năng chuyên môn:</span>
          </label>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedSkills([])}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Bỏ chọn ({selectedSkills.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(showAllSkills ? POPULAR_SKILLS : POPULAR_SKILLS.slice(0, 8)).map((sk) => {
            const isSelected = selectedSkills.includes(sk);
            return (
              <button
                key={sk}
                type="button"
                onClick={() => handleToggleSkill(sk)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isSelected ? `✓ ${sk}` : `+ ${sk}`}
              </button>
            );
          })}
        </div>
        {POPULAR_SKILLS.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-bold inline-flex items-center gap-1 cursor-pointer pt-0.5"
          >
            <span>{showAllSkills ? 'Thu gọn kỹ năng' : `Xem thêm (+${POPULAR_SKILLS.length - 8} kỹ năng)`}</span>
            <i className={`fa-solid text-[9px] ${showAllSkills ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* 1. Header Hero Banner - Ultra-Minimal & Smart */}
      <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-2xl p-4 sm:p-5 text-[#1E3A8A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-white text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <i className="fa-solid fa-circle-check text-[#059669] text-xs" />
            <span>Freelancer Đã Xác Thực eKYC & Năng Lực</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E3A8A]">
            Khám Phá Hồ Sơ Freelancer Chuyên Nghiệp
          </h1>

          <p className="text-[#1E3A8A]/80 text-xs sm:text-sm font-normal">
            Hồ sơ năng lực thực tế, điểm tín nhiệm TalentCredit và đánh giá hợp đồng hoàn tất.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-white text-[#1E3A8A] border border-[#BFDBFE] px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5">
            <i className="fa-solid fa-users text-[#2563EB] text-xs" />
            <span>{filteredFreelancers.length} chuyên gia sẵn sàng</span>
          </span>
        </div>
      </div>

      {/* Mobile Slide-over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <i className="fa-solid fa-sliders text-[#2563EB]" />
                  <span>Bộ Lọc Freelancer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200">
                {renderFilterContent(false)}
              </div>

              <div className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex-1 py-2.5 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Xóa tất cả lọc
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Xem {filteredFreelancers.length} chuyên gia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Search & Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar: Detailed Filters (Desktop - Sticky with independent scroll) */}
        <div className="hidden lg:block lg:col-span-1 space-y-5">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4.5 shadow-xs sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
            {renderFilterContent(true)}
          </div>
        </div>

        {/* Right Section: Results & Cards */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Toolbar: Search, Mobile Filter Button, Counter & Sort (Sticky) */}
          <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm theo tên chuyên gia, kỹ năng (React, Figma, AI)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all"
                />
                <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                    title="Xóa từ khóa"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Drawer Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-sliders text-[#2563EB] text-xs" />
                <span>Bộ lọc</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-[#0F172A]">
                  Tìm thấy <span className="text-[#2563EB] font-bold">{filteredFreelancers.length}</span> chuyên gia phù hợp
                </span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                    Đang lọc {activeFiltersCount} tiêu chí
                  </span>
                )}
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] underline font-bold cursor-pointer ml-1"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs text-[#475569]">
                <i className="fa-solid fa-arrow-down-wide-short text-[#64748B] text-xs" />
                <span className="font-bold hidden sm:inline">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] font-bold text-xs rounded-lg focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="credit_desc">Điểm TalentCredit cao nhất</option>
                    <option value="rating_desc">Đánh giá sao cao nhất</option>
                    <option value="orders_desc">Dự án hoàn thành nhiều nhất</option>
                    <option value="rate_asc">Giá theo giờ: Thấp đến Cao</option>
                    <option value="rate_desc">Giá theo giờ: Cao đến Thấp</option>
                  </select>
                  <i className="fa-solid fa-chevron-down text-[#64748B] text-xs absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Skills Badges */}
          {selectedSkills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#64748B]">Kỹ năng lọc:</span>
              {selectedSkills.map((sk) => (
                <button
                  key={sk}
                  onClick={() => handleToggleSkill(sk)}
                  className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{sk}</span>
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              ))}
            </div>
          )}

          {/* Freelancers Grid */}
          {filteredFreelancers.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-[#F1F5F9] text-[#64748B] rounded-xl flex items-center justify-center mx-auto">
                <i className="fa-solid fa-magnifying-glass text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Không tìm thấy Freelancer nào phù hợp</h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại mức thù lao, giảm yêu cầu điểm đánh giá hoặc chọn lại lĩnh vực chuyên môn.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedFreelancers.map((free) => (
                <div
                  key={free.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs hover:border-[#93C5FD] transition-colors flex flex-col justify-between space-y-5 group relative"
                >
                  <div className="space-y-4">
                    
                    {/* Header: Avatar, Name, Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={free.avatar}
                            alt={free.name}
                            className="w-14 h-14 rounded-md object-cover border border-slate-200 ring-1 ring-slate-200"
                          />
                          {free.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                              <i className="fa-solid fa-check text-[9px]" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                            {free.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 font-medium">{free.title}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <i className="fa-solid fa-location-dot text-rose-500 text-[11px]" />
                            <span>{free.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badge & Bookmark Button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveFreelancer(free.id);
                          }}
                          className={`p-2 rounded-md border transition-all cursor-pointer shadow-2xs ${
                            isFreelancerSaved(free.id)
                              ? 'bg-rose-50 border-rose-300 text-rose-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'
                          }`}
                          title={isFreelancerSaved(free.id) ? 'Bỏ lưu Freelancer' : 'Lưu nhanh Freelancer vào danh sách quan tâm'}
                        >
                          <i className={`text-xs ${isFreelancerSaved(free.id) ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart'}`} />
                        </button>

                        <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                          <i className="fa-solid fa-certificate text-amber-500 text-xs" />
                          <span>{free.talentCreditBadge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-100 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Điểm Tín Nhiệm</div>
                        <div className="font-bold text-amber-700 mt-0.5">{free.talentCreditScore}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Đánh Giá</div>
                        <div className="font-bold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                          <span>{free.rating}</span>
                          <i className="fa-solid fa-star text-amber-400 text-xs" />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Thù Lao/Giờ</div>
                        <div className="font-bold text-emerald-700 mt-0.5">
                          {((free.hourlyRate || 300000) / 1000).toFixed(0)}k đ
                        </div>
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                      <div className="font-bold text-slate-900 text-[11px] mb-1 flex items-center gap-1.5">
                        <i className="fa-solid fa-briefcase text-indigo-600 text-xs" />
                        <span>Mô Tả Năng Lực Bản Thân:</span>
                      </div>
                      <p className="line-clamp-3 text-slate-600 text-[11px] leading-relaxed">
                        {free.bio}
                      </p>
                    </div>

                    {/* Skills Tags */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500">Kỹ năng thành thạo:</div>
                      <div className="flex flex-wrap gap-1">
                        {free.skills.slice(0, 5).map((sk) => (
                          <span
                            key={sk}
                            className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                          >
                            {sk}
                          </span>
                        ))}
                        {free.skills.length > 5 && (
                          <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">
                            +{free.skills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Portfolio Preview Samples */}
                    {free.portfolio && free.portfolio.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                          <span>Dự án thực tế (Portfolio):</span>
                          {free.portfolioUrl && (
                            <a
                              href={free.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold flex items-center gap-1"
                            >
                              <span>Xem Portfolio đầy đủ</span>
                              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {free.portfolio.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedPortfolioItem(item)}
                              className="group/item relative h-20 rounded-md overflow-hidden cursor-pointer border border-slate-200"
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2 py-1 flex items-center">
                                <span className="text-[10px] font-semibold text-white truncate">
                                  {item.title}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Footer Action Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      Đã hoàn thành <strong className="text-slate-900 font-bold">{free.completedOrders} đơn</strong>
                    </div>

                    {currentUser.role === 'employer' ? (
                      <button
                        onClick={() => handleOpenInvite(free)}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-paper-plane text-xs" />
                        <span>Mời Báo Giá</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (free.portfolioUrl) {
                            window.open(free.portfolioUrl, '_blank');
                          } else {
                            addToast(`Đang xem hồ sơ của ${free.name}`, 'info');
                          }
                        }}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-eye text-xs" />
                        <span>Xem Chi Tiết</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredFreelancers.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-xs text-[#64748B]">
                    Hiển thị <span className="font-bold text-[#0F172A]">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredFreelancers.length)}</span> trong tổng số <span className="font-bold text-[#0F172A]">{filteredFreelancers.length}</span> chuyên gia
                  </div>

                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] pl-2 border-l border-slate-200">
                    <span>Mỗi trang:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value={6}>6 hồ sơ</option>
                      <option value={8}>8 hồ sơ</option>
                      <option value={12}>12 hồ sơ</option>
                      <option value={20}>20 hồ sơ</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-chevron-left text-[10px]" />
                    <span>Trước</span>
                  </button>

                  {/* Page numbers */}
                  {pageNumbers.map((p, idx) => (
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-[#94A3B8] font-bold">...</span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => handlePageChange(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === p
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'bg-white border border-[#E5E7EB] text-[#475569] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  ))}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Sau</span>
                    <i className="fa-solid fa-chevron-right text-[10px]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        </div>

      </div>

      {/* Portfolio Item Zoom Modal */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-64 bg-slate-900">
              <img
                src={selectedPortfolioItem.image}
                alt={selectedPortfolioItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPortfolioItem(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedPortfolioItem.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{selectedPortfolioItem.title}</h3>

              <p className="text-slate-600 leading-relaxed text-xs">
                {selectedPortfolioItem.description}
              </p>

              {selectedPortfolioItem.projectUrl && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Link sản phẩm thực tế:</span>
                  <a
                    href={selectedPortfolioItem.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 underline"
                  >
                    <span>{selectedPortfolioItem.projectUrl}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                  </a>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setSelectedPortfolioItem(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal for Employer */}
      {showInviteModal && selectedFreelancer && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-indigo-700 font-bold text-base">
                <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <i className="fa-solid fa-paper-plane text-indigo-600 text-sm" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-sm">Gửi Lời Mời Nhận Dự Án</h3>
                  <p className="text-[11px] text-slate-500 font-normal">Freelancer: <strong className="text-indigo-600 font-bold">{selectedFreelancer.name}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">
                  Tin nhắn / Lời nhắn gửi kèm:
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Nhập lời chào hoặc ghi chú đặc biệt cho Freelancer..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">
                  Chọn 1 dự án đang tuyển của bạn để gửi lời mời:
                </label>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {projects
                    .filter((p) => p.status === 'OPEN')
                    .map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => handleInviteToProject(proj)}
                        className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-400 rounded-md text-left transition-all space-y-1.5 cursor-pointer group"
                      >
                        <div className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-indigo-700">
                          {proj.title}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Ngân sách: <strong className="text-blue-700 font-bold">{proj.budget.toLocaleString('vi-VN')} đ</strong></span>
                          <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Gửi lời mời ngay</span>
                            <span>→</span>
                          </span>
                        </div>
                      </button>
                    ))}
                  {projects.filter((p) => p.status === 'OPEN').length === 0 && (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-md">
                      Bạn chưa có dự án nào đang ở trạng thái mở tuyển dụng.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Cuộn lên đầu trang"
          title="Cuộn lên đầu trang"
        >
          <i className="fa-solid fa-arrow-up text-sm" />
        </button>
      )}
    </div>
  );
};
