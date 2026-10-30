import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Project } from '../types';

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
      { id: 'web_frontend', name: 'Web Frontend (React, Vue, Next.js)', skills: ['ReactJS', 'Next.js', 'Tailwind CSS', 'Responsive UI', 'HTML/CSS'] },
      { id: 'backend_api', name: 'Backend & Database (Node.js, Python, PostgreSQL)', skills: ['Node.js', 'REST API', 'PostgreSQL', 'MySQL', 'Docker', 'Java', 'Spring Boot'] },
      { id: 'mobile_app', name: 'Mobile App (Flutter, React Native, iOS/Android)', skills: ['Flutter', 'QR Code Scan', 'Mobile UI'] },
      { id: 'ai_chatbot', name: 'AI, LLM & Chatbot Tự Động', skills: ['Python', 'FastAPI', 'AI/LLM'] }
    ]
  },
  {
    id: 'Thiết kế & Đồ họa',
    name: 'Thiết kế & Đồ họa (UI/UX, 3D)',
    subcategories: [
      { id: 'all_design', name: 'Tất cả Thiết kế', skills: [] },
      { id: 'ui_ux', name: 'UI/UX Mobile App & Website', skills: ['UI/UX Design', 'Figma', 'Design System', 'Mobile UI'] },
      { id: 'branding_logo', name: 'Logo & Nhận Diện Thương Hiệu (Branding)', skills: ['Branding', 'Logo Design', 'Adobe Illustrator'] },
      { id: 'banner_posm', name: 'Banner Quảng Cáo, Poster & POSM', skills: ['Photoshop', 'Banner Design', 'Adobe Illustrator'] },
      { id: 'design_3d', name: 'Thiết kế 3D, Phối cảnh & Animation', skills: ['3D Animation', 'Blender', '3Ds Max'] }
    ]
  },
  {
    id: 'Video & Animation',
    name: 'Video & Animation (TikTok, Reels)',
    subcategories: [
      { id: 'all_video', name: 'Tất cả Video', skills: [] },
      { id: 'tiktok_reels', name: 'Video Ngắn TikTok Ads, Reels, Shorts', skills: ['TikTok Ads', 'Premiere Pro', 'Motion Graphics', 'Color Grading'] },
      { id: 'motion_animation', name: 'Motion Graphics & 2D Animation', skills: ['After Effects', 'Motion Graphics'] }
    ]
  },
  {
    id: 'Digital Marketing',
    name: 'Digital Marketing & Bán hàng',
    subcategories: [
      { id: 'all_mkt', name: 'Tất cả Marketing', skills: [] },
      { id: 'seo_content', name: 'SEO Google & Content Marketing', skills: ['SEO Google', 'Content Marketing', 'Google Analytics', 'Technical SEO', 'SEO'] },
      { id: 'paid_ads', name: 'Quảng Cáo Paid Ads (Facebook, Google, TikTok)', skills: ['Facebook Ads', 'Google Ads', 'Meta Ads'] }
    ]
  },
  {
    id: 'Viết lách & Nội dung',
    name: 'Viết lách & Dịch thuật',
    subcategories: [
      { id: 'all_writing', name: 'Tất cả Viết lách & Dịch thuật', skills: [] },
      { id: 'seo_writing', name: 'Viết bài chuẩn SEO, PR báo chí', skills: ['Content', 'SEO Writing', 'Copywriting'] },
      { id: 'translation', name: 'Biên dịch & Phiên dịch (Anh, Nhật, Trung)', skills: ['Translation', 'Localization'] }
    ]
  }
];

const BUDGET_PRESETS = [
  { label: 'Tất cả mức giá', min: 0, max: Infinity },
  { label: 'Dưới 3 triệu', min: 0, max: 3000000 },
  { label: '3 - 8 triệu', min: 3000000, max: 8000000 },
  { label: '8 - 15 triệu', min: 8000000, max: 15000000 },
  { label: '15 - 30 triệu', min: 15000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: Infinity }
];

const POPULAR_SKILLS = [
  'ReactJS',
  'Flutter',
  'Figma',
  'UI/UX Design',
  'Node.js',
  'Python',
  'TikTok Ads',
  'Branding',
  'SEO Google',
  'After Effects',
  'Tailwind CSS',
  'AI/LLM'
];

export const Projects: React.FC = () => {
  const {
    projects,
    submitProposal,
    currentUser,
    toggleSaveProject,
    isProjectSaved,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [selectedBudgetPreset, setSelectedBudgetPreset] = useState<number>(0);
  const [minBudgetInput, setMinBudgetInput] = useState<string>('');
  const [maxBudgetInput, setMaxBudgetInput] = useState<string>('');
  const [selectedBudgetType, setSelectedBudgetType] = useState<'ALL' | 'FIXED' | 'MILESTONE'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'budget_desc' | 'budget_asc' | 'proposals_asc'>('newest');

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

  // Keep search input synced with URL query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Proposal modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(10000000);
  const [estimatedDays, setEstimatedDays] = useState<number>(7);
  const [coverLetter, setCoverLetter] = useState<string>('');

  // Toggle skill selection
  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Pagination State
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMainCategory('ALL');
    setSelectedSubcategory('ALL');
    setSelectedBudgetPreset(0);
    setMinBudgetInput('');
    setMaxBudgetInput('');
    setSelectedBudgetType('ALL');
    setSelectedStatus('ALL');
    setSelectedSkills([]);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = proj.title.toLowerCase().includes(query);
        const matchDesc = proj.description.toLowerCase().includes(query);
        const matchCompany = proj.employerCompany?.toLowerCase().includes(query) || false;
        const matchEmployer = proj.employerName.toLowerCase().includes(query);
        const matchSkills = proj.requiredSkills.some((s) => s.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchCompany && !matchEmployer && !matchSkills) {
          return false;
        }
      }

      // 2. Main Category Filter
      if (selectedMainCategory !== 'ALL') {
        const pCat = proj.category.toLowerCase();
        const sCat = selectedMainCategory.toLowerCase();
        const matches = pCat === sCat ||
          (sCat.includes('lập trình') && (pCat.includes('lập trình') || pCat.includes('it') || pCat.includes('cntt'))) ||
          (sCat.includes('thiết kế') && (pCat.includes('thiết kế') || pCat.includes('đồ họa') || pCat.includes('sáng tạo'))) ||
          (sCat.includes('video') && (pCat.includes('video') || pCat.includes('animation') || pCat.includes('media'))) ||
          (sCat.includes('marketing') && (pCat.includes('marketing') || pCat.includes('bán hàng'))) ||
          (sCat.includes('viết lách') && (pCat.includes('viết lách') || pCat.includes('nội dung') || pCat.includes('dịch thuật'))) ||
          (sCat.includes('kiến trúc') && (pCat.includes('kiến trúc') || pCat.includes('kỹ thuật'))) ||
          (sCat.includes('tài chính') && (pCat.includes('tài chính') || pCat.includes('kế toán'))) ||
          (sCat.includes('giáo dục') && (pCat.includes('giáo dục') || pCat.includes('đào tạo'))) ||
          (sCat.includes('nhân sự') && (pCat.includes('nhân sự') || pCat.includes('hành chính'))) ||
          (sCat.includes('pháp lý') && (pCat.includes('luật') || pCat.includes('pháp lý')));
        if (!matches) return false;
      }

      // 3. Subcategory Filter
      if (selectedSubcategory !== 'ALL') {
        const activeCategory = CATEGORY_DATA.find((c) => c.id === selectedMainCategory);
        const sub = activeCategory?.subcategories.find((s) => s.id === selectedSubcategory);
        if (sub && sub.skills.length > 0) {
          const matchSubSkill = proj.requiredSkills.some((sk) => sub.skills.includes(sk));
          if (!matchSubSkill) return false;
        }
      }

      // 4. Budget Range Filter
      const customMin = minBudgetInput ? parseInt(minBudgetInput.replace(/\D/g, ''), 10) : 0;
      const customMax = maxBudgetInput ? parseInt(maxBudgetInput.replace(/\D/g, ''), 10) : Infinity;

      if (minBudgetInput || maxBudgetInput) {
        if (proj.budget < customMin || proj.budget > customMax) {
          return false;
        }
      } else if (selectedBudgetPreset > 0) {
        const preset = BUDGET_PRESETS[selectedBudgetPreset];
        if (proj.budget < preset.min || proj.budget > preset.max) {
          return false;
        }
      }

      // 5. Budget Type
      if (selectedBudgetType !== 'ALL' && proj.budgetType !== selectedBudgetType) {
        return false;
      }

      // 6. Project Status
      if (selectedStatus !== 'ALL' && proj.status !== selectedStatus) {
        return false;
      }

      // 7. Multi-Skill Filter
      if (selectedSkills.length > 0) {
        const hasAnySkill = selectedSkills.some((s) => proj.requiredSkills.includes(s));
        if (!hasAnySkill) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'budget_desc') return b.budget - a.budget;
      if (sortBy === 'budget_asc') return a.budget - b.budget;
      if (sortBy === 'proposals_asc') return a.proposalsCount - b.proposalsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    projects,
    searchQuery,
    selectedMainCategory,
    selectedSubcategory,
    selectedBudgetPreset,
    minBudgetInput,
    maxBudgetInput,
    selectedBudgetType,
    selectedStatus,
    selectedSkills,
    sortBy
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedMainCategory !== 'ALL') count++;
    if (selectedSubcategory !== 'ALL') count++;
    if (selectedBudgetPreset > 0 || minBudgetInput || maxBudgetInput) count++;
    if (selectedBudgetType !== 'ALL') count++;
    if (selectedStatus !== 'ALL') count++;
    if (selectedSkills.length > 0) count += selectedSkills.length;
    return count;
  }, [
    searchQuery,
    selectedMainCategory,
    selectedSubcategory,
    selectedBudgetPreset,
    minBudgetInput,
    maxBudgetInput,
    selectedBudgetType,
    selectedStatus,
    selectedSkills
  ]);

  // Reset page to 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedMainCategory,
    selectedSubcategory,
    selectedBudgetPreset,
    minBudgetInput,
    maxBudgetInput,
    selectedBudgetType,
    selectedStatus,
    selectedSkills,
    sortBy
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

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

  const handleOpenProposal = (proj: Project) => {
    setSelectedProject(proj);
    setBidAmount(proj.budget);
    setShowProposalModal(true);
  };

  const handleSubmitProposalForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    submitProposal({
      projectId: selectedProject.id,
      freelancerId: currentUser.id,
      freelancerName: currentUser.name,
      freelancerAvatar: currentUser.avatar,
      freelancerTitle: 'Senior Specialist',
      freelancerRating: 4.9,
      freelancerCompletedCount: 45,
      bidAmount,
      estimatedDays,
      coverLetter
    });

    setShowProposalModal(false);
    setCoverLetter('');
  };

  // Reusable filter content for both Desktop sidebar and Mobile Drawer
  const renderFilterContent = (showTitle = true) => (
    <div className="space-y-5">
      {/* Filter Header */}
      {showTitle && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 font-bold text-[#0F172A] text-sm">
            <i className="fa-solid fa-sliders text-[#2563EB] text-xs" />
            <span>Bộ Lọc Nâng Cao</span>
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

      {/* 1. Category Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800">Lĩnh vực chính:</label>
        <div className="relative">
          <select
            value={selectedMainCategory}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              setSelectedSubcategory('ALL');
            }}
            className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
          >
            <option value="ALL">Tất cả lĩnh vực ngành</option>
            {CATEGORY_DATA.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down text-slate-500 text-xs absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 2. Detailed Subcategory Selector (Chips / List, NO nested scroll trap) */}
      {selectedMainCategory !== 'ALL' && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-blue-700 flex items-center gap-1.5">
            <i className="fa-solid fa-chevron-right text-blue-600 text-xs" />
            <span>Chuyên môn chi tiết:</span>
          </label>
          <div className="space-y-1 bg-blue-50/40 p-2 rounded-lg border border-blue-100">
            {CATEGORY_DATA.find((c) => c.id === selectedMainCategory)?.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedSubcategory === sub.id
                    ? 'bg-[#2563EB] text-white shadow-2xs'
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

      {/* 3. Budget Range Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <i className="fa-solid fa-dong-sign text-emerald-600 text-xs" />
          <span>Ngân sách dự án (VND):</span>
        </label>

        {/* Min - Max Input Fields */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tối thiểu (Min)</span>
            <input
              type="number"
              placeholder="VD: 3000000"
              value={minBudgetInput}
              onChange={(e) => {
                setMinBudgetInput(e.target.value);
                setSelectedBudgetPreset(0);
              }}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-bold text-slate-900"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tối đa (Max)</span>
            <input
              type="number"
              placeholder="VD: 20000000"
              value={maxBudgetInput}
              onChange={(e) => {
                setMaxBudgetInput(e.target.value);
                setSelectedBudgetPreset(0);
              }}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Quick Budget Presets */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khoảng giá nhanh:</div>
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_PRESETS.map((p, idx) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setSelectedBudgetPreset(idx);
                  setMinBudgetInput('');
                  setMaxBudgetInput('');
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  selectedBudgetPreset === idx && !minBudgetInput && !maxBudgetInput
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Budget Type Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800">Hình thức thanh toán:</label>
        <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setSelectedBudgetType('ALL')}
            className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
              selectedBudgetType === 'ALL' ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setSelectedBudgetType('FIXED')}
            className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
              selectedBudgetType === 'FIXED' ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Trọn gói
          </button>
          <button
            type="button"
            onClick={() => setSelectedBudgetType('MILESTONE')}
            className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
              selectedBudgetType === 'MILESTONE' ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Cột mốc
          </button>
        </div>
      </div>

      {/* 5. Popular Skills Filter (No nested scroll trap) */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <i className="fa-solid fa-tag text-[#2563EB] text-xs" />
            <span>Kỹ năng yêu cầu:</span>
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
            className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-bold inline-flex items-center gap-1 cursor-pointer pt-1"
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
      
      {/* 1. Header Hero Banner - Compact & Clean */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 sm:p-5 text-[#1E3A8A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-white text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <i className="fa-solid fa-shield-halved text-[#059669] text-xs" />
            <span>Thị Trường Dự Án Chuẩn Escrow VNPAY — Ký quỹ 100% trước khi làm</span>
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1E3A8A]">
            Tìm Kiếm Dự Án & Cơ Hội Việc Làm Freelance
          </h1>

          <p className="text-[#1E3A8A]/80 text-xs font-normal">
            Kết nối trực tiếp doanh nghiệp uy tín. Toàn bộ tiền thù lao được bảo vệ an toàn qua cổng VNPAY.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-white text-[#1E3A8A] border border-[#BFDBFE] px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5">
            <i className="fa-solid fa-bolt text-[#059669] text-xs" />
            <span><strong className="text-[#1D4ED8]">{filteredProjects.length}</strong> dự án đang mở</span>
          </span>
        </div>
      </div>

      {/* 2. Main Search & Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Detailed Filters (Desktop: Sticky, independent scroll, never cut off) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
            {renderFilterContent()}
          </div>
        </div>

        {/* Right Section: Sticky Search Bar, Results & Toolbar */}
        <div className="lg:col-span-3 space-y-4 min-w-0">
          
          {/* Sticky Toolbar: Search Input, Mobile Filter Trigger, Counter, Sort */}
          <div className="sticky top-16 z-20 bg-[#F8FAFC]/95 backdrop-blur-md pt-1 pb-2 space-y-2.5">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E5E7EB] shadow-xs space-y-3">
              
              {/* Row 1: Search Box + Mobile Filter Button */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên dự án, kỹ năng (React, Figma, Flutter, SEO)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:outline-none transition-all font-medium text-slate-900"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                      title="Xóa từ khóa"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}
                </div>

                {/* Mobile Filter Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden shrink-0 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-sliders text-[#2563EB] text-xs" />
                  <span>Bộ lọc</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Row 2: Status / Filter count, Sort, and Reset */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#0F172A]">
                    Tìm thấy <span className="text-[#2563EB] font-bold">{filteredProjects.length}</span> dự án phù hợp
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
                      className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-bold underline cursor-pointer ml-1"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <i className="fa-solid fa-arrow-down-wide-short text-slate-400 text-xs" />
                    <span className="font-semibold hidden sm:inline text-xs">Sắp xếp:</span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none pl-2.5 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs rounded-lg focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="newest">Mới nhất đăng lên</option>
                        <option value="budget_desc">Ngân sách: Cao đến Thấp</option>
                        <option value="budget_asc">Ngân sách: Thấp đến Cao</option>
                        <option value="proposals_asc">Số báo giá: Ít cạnh tranh</option>
                      </select>
                      <i className="fa-solid fa-chevron-down text-slate-400 text-[10px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Active Selected Skills Chips */}
            {selectedSkills.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap px-1">
                <span className="text-[11px] font-bold text-slate-500">Kỹ năng đang lọc:</span>
                {selectedSkills.map((sk) => (
                  <button
                    key={sk}
                    onClick={() => handleToggleSkill(sk)}
                    className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                    title={`Bỏ lọc ${sk}`}
                  >
                    <span>{sk}</span>
                    <i className="fa-solid fa-xmark text-[10px]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Projects List */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-[#F1F5F9] text-[#64748B] rounded-xl flex items-center justify-center mx-auto">
                <i className="fa-solid fa-magnifying-glass text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Không tìm thấy dự án nào phù hợp</h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại khoảng giá ngân sách, bỏ bớt kỹ năng lọc hoặc tìm kiếm với từ khóa khác.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
              {paginatedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white p-5 sm:p-6 rounded-xl border border-[#E5E7EB] shadow-xs hover:border-[#93C5FD] transition-colors space-y-3.5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      
                      {/* Meta Tags */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-bold px-2.5 py-0.5 rounded-md">
                          {proj.category}
                        </span>
                        <span className="text-[#CBD5E1] text-xs">•</span>
                        <span className="text-[#64748B] text-xs flex items-center gap-1.5">
                          <i className="fa-regular fa-clock text-[#94A3B8] text-xs" />
                          <span>Hạn nộp: {proj.deadline}</span>
                        </span>
                        <span className="text-[#CBD5E1] text-xs">•</span>
                        <span className="text-[#94A3B8] text-xs">Đăng ngày {proj.createdAt}</span>
                      </div>

                      {/* Project Title */}
                      <Link
                        to={`/jobs/${proj.id}`}
                        className="block font-bold text-[#0F172A] text-base sm:text-lg group-hover:text-[#2563EB] transition-colors leading-snug cursor-pointer"
                      >
                        {proj.title}
                      </Link>

                      {/* Employer Info & Save Employer Button */}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#475569]">
                        <div className="flex items-center space-x-1.5">
                          <img
                            src={proj.employerAvatar}
                            alt={proj.employerName}
                            className="w-5 h-5 rounded-full object-cover border border-[#E5E7EB]"
                          />
                          <span className="font-bold text-[#0F172A]">{proj.employerName}</span>
                          {proj.employerCompany && (
                            <span className="text-[#64748B]">({proj.employerCompany})</span>
                          )}
                        </div>

                        {proj.employerVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#065F46] bg-[#D1FAE5] px-2 py-0.5 rounded-md font-bold border border-[#A7F3D0]">
                            <i className="fa-solid fa-circle-check text-[#059669] text-[9px]" />
                            <span>Doanh nghiệp xác thực</span>
                          </span>
                        )}


                      </div>
                    </div>

                    {/* Budget Badge & Project Bookmark Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <div className="text-right shrink-0 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 min-w-[170px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Ngân sách:</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveProject(proj.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isProjectSaved(proj.id)
                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                : 'bg-white border-[#E5E7EB] text-[#94A3B8] hover:text-rose-500'
                            }`}
                            title={isProjectSaved(proj.id) ? 'Bỏ lưu dự án' : 'Lưu dự án để theo dõi'}
                          >
                            <i className={`text-xs ${isProjectSaved(proj.id) ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart'}`} />
                          </button>
                        </div>
                        <div className="text-lg sm:text-xl font-bold font-mono text-[#1D4ED8] mt-0.5">
                          {proj.budget.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[10px] text-[#065F46] font-bold mt-1 flex items-center justify-end gap-1">
                          <i className="fa-solid fa-shield-halved text-[#059669] text-[10px]" />
                          <span>{proj.budgetType === 'FIXED' ? 'Trọn gói' : 'Cột mốc Escrow'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-[#334155] text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {proj.description}
                  </p>

                  {/* Milestones Preview if available */}
                  {proj.budgetType === 'MILESTONE' && proj.milestones && proj.milestones.length > 0 && (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#334155]">
                        <span className="flex items-center gap-1.5 text-[#2563EB]">
                          <i className="fa-solid fa-list-check text-xs" />
                          <span>Lộ trình {proj.milestones.length} Cột mốc tiến độ</span>
                        </span>
                        <span className="text-[10px] text-[#059669] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Ký quỹ Escrow từng đợt
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-0.5">
                        {proj.milestones.map((m, idx) => (
                          <div
                            key={m.id || idx}
                            className="bg-white border border-[#E2E8F0] rounded-lg p-2 text-[11px] flex flex-col justify-between shadow-2xs hover:border-blue-200 transition-colors"
                          >
                            <span className="font-semibold text-[#0F172A] line-clamp-1" title={m.title}>
                              #{idx + 1}. {m.title}
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono mt-1 pt-1 border-t border-slate-100">
                              <span className="text-[#2563EB] font-bold">
                                {Number(m.amount).toLocaleString('vi-VN')} đ
                              </span>
                              <span>{m.dueDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Skills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F1F5F9]">
                    <span className="text-xs text-[#64748B] font-bold mr-1">Kỹ năng:</span>
                    {proj.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] text-xs">
                    <div className="text-[#64748B] flex items-center gap-1.5">
                      <i className="fa-solid fa-users text-[#94A3B8] text-xs" />
                      <span>
                        Đã có <strong className="text-[#0F172A] font-bold">{proj.proposalsCount} Báo giá</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${proj.id}`}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Xem Chi Tiết
                      </Link>
                      {currentUser.role === 'freelancer' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenProposal(proj)}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-paper-plane text-xs" />
                        <span>Nộp Báo Giá</span>
                      </button>
                    ) : currentUser.role === 'guest' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenProposal(proj)}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-paper-plane text-xs" />
                        <span>Đăng Nhập Để Nộp Báo Giá</span>
                      </button>
                    ) : (
                      <span className="text-[#94A3B8] italic text-[11px]">
                        (Chuyển vai trò Freelancer để nộp báo giá)
                      </span>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="text-xs text-[#64748B]">
                  Hiển thị <span className="font-bold text-[#0F172A]">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)}</span> trong tổng số <span className="font-bold text-[#0F172A]">{filteredProjects.length}</span> dự án
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

      {/* Mobile Filter Slide-over Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <i className="fa-solid fa-sliders text-[#2563EB]" />
                <span>Bộ Lọc Nâng Cao</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                aria-label="Đóng bộ lọc"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {renderFilterContent(false)}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2.5">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="py-2.5 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
              >
                Xem {filteredProjects.length} dự án phù hợp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB]"
          title="Cuộn lên đầu trang"
          aria-label="Cuộn lên đầu trang"
        >
          <i className="fa-solid fa-arrow-up text-sm" />
        </button>
      )}

      {/* Submit Proposal Modal */}
      {showProposalModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitProposalForm}
            className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-base">
                <i className="fa-solid fa-paper-plane text-blue-600 text-sm" />
                <span>Nộp Báo Giá (Proposal) Dự Án</span>
              </div>
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-md cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-900 text-sm">{selectedProject.title}</div>
                <div className="flex items-center justify-between text-slate-500 flex-wrap gap-2">
                  <span>
                    Ngân sách đề xuất: <strong className="font-bold text-blue-700">{selectedProject.budget.toLocaleString('vi-VN')} đ</strong>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {selectedProject.budgetType === 'MILESTONE' ? 'Chia Cột Mốc Escrow' : 'Trọn Gói Cố Định'}
                  </span>
                </div>

                {/* Milestones list in proposal modal if project has milestones */}
                {selectedProject.budgetType === 'MILESTONE' && selectedProject.milestones && selectedProject.milestones.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <i className="fa-solid fa-list-check text-blue-600 text-xs" />
                      <span>Lộ trình {selectedProject.milestones.length} cột mốc khách hàng yêu cầu:</span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {selectedProject.milestones.map((m, idx) => (
                        <div key={m.id || idx} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-[11px]">
                          <div className="truncate">
                            <span className="font-bold text-slate-800">#{idx + 1}.</span>{' '}
                            <span className="text-slate-700">{m.title}</span>
                          </div>
                          <div className="shrink-0 font-mono font-bold text-blue-600">
                            {Number(m.amount).toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức giá bạn chào (VND):</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold text-blue-700 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian hoàn thành (ngày):</label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Thư chào & Giải pháp thực hiện (Cover Letter):
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Mô tả năng lực, kinh nghiệm với các dự án tương tự, giải pháp kỹ thuật đề xuất và cam kết tiến độ..."
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="bg-blue-50 p-3.5 rounded-md border border-blue-200 text-blue-800 text-[11px] flex items-start space-x-2.5 leading-relaxed">
                <i className="fa-solid fa-shield-halved text-blue-600 text-sm shrink-0 mt-0.5" />
                <span>
                  Hệ thống tự động bảo vệ giao dịch qua Escrow VNPAY. Nghiêm cấm gửi Số điện thoại / Zalo để giao dịch ngoài sàn nhằm tránh rủi ro mất tiền.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-md transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md transition-all shadow-sm cursor-pointer"
              >
                Gửi Đề Xuất Báo Giá
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
