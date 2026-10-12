import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import type { Project } from '../types';
import {
  Search,
  Send,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  Tag,
  DollarSign,
  Clock,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Users,
  Heart,
  Building2
} from 'lucide-react';

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
      { id: 'backend_api', name: 'Backend & Database (Node.js, Python, PostgreSQL)', skills: ['Node.js', 'REST API', 'PostgreSQL', 'MySQL', 'Docker'] },
      { id: 'mobile_app', name: 'Mobile App (Flutter, React Native, iOS/Android)', skills: ['Flutter', 'QR Code Scan', 'Mobile UI'] },
      { id: 'ai_chatbot', name: 'AI, LLM & Chatbot Tự Động', skills: ['Python', 'FastAPI', 'AI/LLM'] }
    ]
  },
  {
    id: 'Thiết kế & Đồ họa',
    name: 'Thiết kế & Đồ họa',
    subcategories: [
      { id: 'all_design', name: 'Tất cả Thiết kế', skills: [] },
      { id: 'ui_ux', name: 'UI/UX Mobile App & Website', skills: ['UI/UX Design', 'Figma', 'Design System', 'Mobile UI'] },
      { id: 'branding_logo', name: 'Logo & Nhận Diện Thương Hiệu (Branding)', skills: ['Branding', 'Logo Design', 'Adobe Illustrator'] },
      { id: 'banner_posm', name: 'Banner Quảng Cáo, Poster & POSM', skills: ['Photoshop', 'Banner Design', 'Adobe Illustrator'] }
    ]
  },
  {
    id: 'Video & Animation',
    name: 'Video & Animation',
    subcategories: [
      { id: 'all_video', name: 'Tất cả Video', skills: [] },
      { id: 'tiktok_reels', name: 'Video Ngắn TikTok Ads, Reels, Shorts', skills: ['TikTok Ads', 'Premiere Pro', 'Motion Graphics', 'Color Grading'] },
      { id: 'motion_animation', name: 'Motion Graphics & 2D Animation', skills: ['After Effects', 'Motion Graphics'] }
    ]
  },
  {
    id: 'Digital Marketing',
    name: 'Digital Marketing & Content',
    subcategories: [
      { id: 'all_mkt', name: 'Tất cả Marketing', skills: [] },
      { id: 'seo_content', name: 'SEO Google & Content Marketing', skills: ['SEO Google', 'Content Marketing', 'Google Analytics', 'Technical SEO'] },
      { id: 'paid_ads', name: 'Quảng Cáo Paid Ads (Facebook, Google, TikTok)', skills: ['Facebook Ads', 'Google Ads', 'TikTok Ads'] }
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
    toggleSaveEmployer,
    isProjectSaved,
    isEmployerSaved
  } = useDemo();
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
      if (selectedMainCategory !== 'ALL' && proj.category !== selectedMainCategory) {
        return false;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header Hero Banner */}
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
        
        {/* Left Sidebar: Detailed Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 font-extrabold text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Bộ Lọc Nâng Cao</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Xóa bộ lọc ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Keyword Search Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800">Từ khóa tìm kiếm:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="React, Flutter, Figma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800">Lĩnh vực chính:</label>
              <div className="relative">
                <select
                  value={selectedMainCategory}
                  onChange={(e) => {
                    setSelectedMainCategory(e.target.value);
                    setSelectedSubcategory('ALL');
                  }}
                  className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
                >
                  <option value="ALL">Tất cả lĩnh vực ngành</option>
                  {CATEGORY_DATA.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Detailed Subcategory Small Group Selector */}
            {selectedMainCategory !== 'ALL' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-xs font-extrabold text-blue-700 flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nhóm chuyên môn chi tiết:</span>
                </label>
                <div className="space-y-1 bg-blue-50/50 p-2 rounded-2xl border border-blue-100 max-h-48 overflow-y-auto">
                  {CATEGORY_DATA.find((c) => c.id === selectedMainCategory)?.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedSubcategory === sub.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'hover:bg-blue-100/70 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      {selectedSubcategory === sub.id && <CheckCircle2 className="w-3 h-3 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mức ngân sách dự án (VND):</span>
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
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
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
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Quick Budget Presets */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khoảng giá nhanh:</div>
                <div className="flex flex-wrap gap-1.5">
                  {BUDGET_PRESETS.map((p, idx) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setSelectedBudgetPreset(idx);
                        setMinBudgetInput('');
                        setMaxBudgetInput('');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        selectedBudgetPreset === idx && !minBudgetInput && !maxBudgetInput
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Type Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800">Hình thức thanh toán:</label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  onClick={() => setSelectedBudgetType('ALL')}
                  className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedBudgetType === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setSelectedBudgetType('FIXED')}
                  className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedBudgetType === 'FIXED' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Trọn gói
                </button>
                <button
                  onClick={() => setSelectedBudgetType('MILESTONE')}
                  className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedBudgetType === 'MILESTONE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Cột mốc
                </button>
              </div>
            </div>

            {/* Popular Skills Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Kỹ năng yêu cầu:</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {POPULAR_SKILLS.map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      onClick={() => handleToggleSkill(sk)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Section: Results & Toolbar */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Toolbar: Counter, Sort & Status */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">
                Tìm thấy <span className="text-blue-600 font-black">{filteredProjects.length}</span> dự án phù hợp
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Đang lọc {activeFiltersCount} tiêu chí
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold hidden sm:inline">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="newest">Mới nhất đăng lên</option>
                    <option value="budget_desc">Ngân sách: Cao đến Thấp</option>
                    <option value="budget_asc">Ngân sách: Thấp đến Cao</option>
                    <option value="proposals_asc">Số báo giá: Ít cạnh tranh</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Skill Filter Badges */}
          {selectedSkills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">Kỹ năng đang chọn:</span>
              {selectedSkills.map((sk) => (
                <button
                  key={sk}
                  onClick={() => handleToggleSkill(sk)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>{sk}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Projects List */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy dự án nào phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại khoảng giá ngân sách, bỏ bớt kỹ năng lọc hoặc tìm kiếm với từ khóa khác.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-4 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      
                      {/* Meta Tags */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-md">
                          {proj.category}
                        </span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Hạn nộp: {proj.deadline}</span>
                        </span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-400 text-xs">Đăng ngày {proj.createdAt}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-snug">
                        {proj.title}
                      </h3>

                      {/* Employer Info & Save Employer Button */}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <img
                            src={proj.employerAvatar}
                            alt={proj.employerName}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-800">{proj.employerName}</span>
                          {proj.employerCompany && (
                            <span className="text-slate-500">({proj.employerCompany})</span>
                          )}
                        </div>

                        {proj.employerVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Doanh nghiệp xác thực</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveEmployer(proj.employerId);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                            isEmployerSaved(proj.employerId)
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                          }`}
                          title={isEmployerSaved(proj.employerId) ? 'Bỏ lưu nhà tuyển dụng' : 'Lưu nhà tuyển dụng này'}
                        >
                          <Building2 className="w-3 h-3" />
                          <span>{isEmployerSaved(proj.employerId) ? '✓ Đã lưu Cty' : '+ Lưu Cty'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Budget Badge & Project Bookmark Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[180px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Ngân sách:</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveProject(proj.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isProjectSaved(proj.id)
                                ? 'bg-rose-50 border-rose-300 text-rose-600'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
                            }`}
                            title={isProjectSaved(proj.id) ? 'Bỏ lưu dự án' : 'Lưu dự án để theo dõi'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isProjectSaved(proj.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-blue-700 mt-0.5">
                          {proj.budget.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Hình thức: {proj.budgetType === 'FIXED' ? 'Trọn gói' : 'Cột mốc Escrow'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>

                  {/* Required Skills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-bold mr-1">Kỹ năng yêu cầu:</span>
                    {proj.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>
                        Đã có <strong className="text-slate-900 font-extrabold">{proj.proposalsCount} Báo giá</strong> nộp đến
                      </span>
                    </div>

                    {currentUser.role === 'freelancer' ? (
                      <button
                        onClick={() => handleOpenProposal(proj)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Nộp Báo Giá Ngay</span>
                      </button>
                    ) : currentUser.role === 'guest' ? (
                      <button
                        onClick={() => handleOpenProposal(proj)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Đăng Nhập Để Nộp Báo Giá</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">
                        (Chuyển sang vai trò Freelancer để nộp báo giá)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Submit Proposal Modal */}
      {showProposalModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitProposalForm}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-base">
                <Send className="w-5 h-5 text-blue-600" />
                <span>Nộp Báo Giá (Proposal) Dự Án</span>
              </div>
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900 text-sm">{selectedProject.title}</div>
                <div className="text-slate-500">
                  Ngân sách đề xuất: <span className="font-black text-blue-700">{selectedProject.budget.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Mức giá bạn chào (VND):</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-blue-700 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Thời gian hoàn thành (ngày):</label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">
                  Thư chào & Giải pháp thực hiện (Cover Letter):
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Mô tả năng lực, kinh nghiệm với các dự án tương tự, giải pháp kỹ thuật đề xuất và cam kết tiến độ..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-blue-800 text-[11px] flex items-start space-x-2 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Hệ thống tự động bảo vệ giao dịch qua Escrow VNPAY. Nghiêm cấm gửi Số điện thoại / Zalo để giao dịch ngoài sàn nhằm tránh rủi ro mất tiền.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition-all shadow-md cursor-pointer"
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
