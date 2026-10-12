import React, { useState, useMemo } from 'react';
import { useDemo } from '../context/DemoContext';
import type { FreelancerProfile, PortfolioItem, Project } from '../types';
import {
  Search,
  Star,
  ExternalLink,
  Award,
  Briefcase,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  DollarSign,
  X,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Send,
  Eye,
  Heart
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
      { id: 'web_frontend', name: 'Web Frontend (React, Vue, Next.js)', skills: ['ReactJS', 'Next.js', 'Tailwind CSS', 'TypeScript'] },
      { id: 'backend_api', name: 'Backend & API (Node.js, Python, MySQL)', skills: ['Node.js', 'REST API', 'MySQL', 'PostgreSQL'] },
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
      { id: 'branding_logo', name: 'Branding & Logo Design', skills: ['Branding', 'Logo Design', 'Adobe Illustrator'] }
    ]
  },
  {
    id: 'Video & Animation',
    name: 'Video & Animation',
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
      { id: 'performance_ads', name: 'Chạy Ads Facebook/Google', skills: ['Facebook Ads', 'Google Ads'] }
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
  } = useDemo();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header Hero Banner */}
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

      {/* 2. Main Search & Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Detailed Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 font-extrabold text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Bộ Lọc Freelancer</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Xóa lọc ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800">Tìm kiếm theo tên / kỹ năng:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Minh Anh, React, Figma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Main Category */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800">Lĩnh vực chuyên môn:</label>
              <div className="relative">
                <select
                  value={selectedMainCategory}
                  onChange={(e) => {
                    setSelectedMainCategory(e.target.value);
                    setSelectedSubcategory('ALL');
                  }}
                  className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
                >
                  <option value="ALL">Tất cả lĩnh vực</option>
                  {CATEGORY_DATA.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Subcategory Selector */}
            {selectedMainCategory !== 'ALL' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-xs font-extrabold text-indigo-700 flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Nhóm nhỏ chuyên sâu:</span>
                </label>
                <div className="space-y-1 bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100 max-h-48 overflow-y-auto">
                  {CATEGORY_DATA.find((c) => c.id === selectedMainCategory)?.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedSubcategory === sub.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'hover:bg-indigo-100/70 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      {selectedSubcategory === sub.id && <CheckCircle2 className="w-3 h-3 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly Rate Price Range Filter */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mức thù lao / Giá theo giờ (VND/h):</span>
              </label>

              {/* Min - Max Input Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tối thiểu (Min)</span>
                  <input
                    type="number"
                    placeholder="VD: 200000"
                    value={minRateInput}
                    onChange={(e) => {
                      setMinRateInput(e.target.value);
                      setSelectedRatePreset(0);
                    }}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tối đa (Max)</span>
                  <input
                    type="number"
                    placeholder="VD: 500000"
                    value={maxRateInput}
                    onChange={(e) => {
                      setMaxRateInput(e.target.value);
                      setSelectedRatePreset(0);
                    }}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Quick Rate Presets */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khoảng giá nhanh:</div>
                <div className="flex flex-wrap gap-1.5">
                  {HOURLY_RATE_PRESETS.map((p, idx) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setSelectedRatePreset(idx);
                        setMinRateInput('');
                        setMaxRateInput('');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        selectedRatePreset === idx && !minRateInput && !maxRateInput
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Huy hiệu TalentCredit:</span>
              </label>
              <div className="relative">
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
                >
                  <option value="ALL">Tất cả cấp độ</option>
                  <option value="Top Rated">Top Rated (900+ điểm uy tín)</option>
                  <option value="Gold">Hạng Vàng (Gold 850+)</option>
                  <option value="Silver">Hạng Bạc (Silver 750+)</option>
                  <option value="Bronze">Hạng Đồng (Bronze)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Đánh giá tối thiểu:</span>
              </label>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-center">
                <button
                  onClick={() => setMinRating(0)}
                  className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                    minRating === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setMinRating(4.0)}
                  className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                    minRating === 4.0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  4.0★+
                </button>
                <button
                  onClick={() => setMinRating(4.5)}
                  className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                    minRating === 4.5 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  4.5★+
                </button>
                <button
                  onClick={() => setMinRating(4.8)}
                  className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                    minRating === 4.8 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  4.8★+
                </button>
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Khu vực địa lý:</span>
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
                >
                  <option value="ALL">Toàn quốc (Tất cả khu vực)</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800">Kỹ năng chuyên môn:</label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {POPULAR_SKILLS.map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      onClick={() => handleToggleSkill(sk)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
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

        {/* Right Section: Results & Cards */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Toolbar: Counter & Sort */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">
                Tìm thấy <span className="text-indigo-600 font-black">{filteredFreelancers.length}</span> chuyên gia phù hợp
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="credit_desc">Điểm TalentCredit cao nhất</option>
                    <option value="rating_desc">Đánh giá sao cao nhất</option>
                    <option value="orders_desc">Dự án hoàn thành nhiều nhất</option>
                    <option value="rate_asc">Giá theo giờ: Thấp đến Cao</option>
                    <option value="rate_desc">Giá theo giờ: Cao đến Thấp</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Skills Badges */}
          {selectedSkills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">Kỹ năng lọc:</span>
              {selectedSkills.map((sk) => (
                <button
                  key={sk}
                  onClick={() => handleToggleSkill(sk)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>{sk}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Freelancers Grid */}
          {filteredFreelancers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy ứng viên nào phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại mức thù lao, giảm yêu cầu điểm đánh giá hoặc chọn lại lĩnh vực chuyên môn.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFreelancers.map((free) => (
                <div
                  key={free.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between space-y-5 group relative"
                >
                  <div className="space-y-4">
                    
                    {/* Header: Avatar, Name, Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={free.avatar}
                            alt={free.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 ring-2 ring-indigo-500/20"
                          />
                          {free.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full ring-2 ring-white">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                            {free.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 font-semibold">{free.title}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-500" />
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
                          className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                            isFreelancerSaved(free.id)
                              ? 'bg-rose-50 border-rose-300 text-rose-600 ring-2 ring-rose-500/20'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'
                          }`}
                          title={isFreelancerSaved(free.id) ? 'Bỏ lưu Freelancer' : 'Lưu nhanh Freelancer vào danh sách quan tâm'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFreelancerSaved(free.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-xl border border-amber-300 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>{free.talentCreditBadge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Điểm Tín Nhiệm</div>
                        <div className="font-black text-amber-700 mt-0.5">{free.talentCreditScore}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Đánh Giá</div>
                        <div className="font-black text-slate-900 mt-0.5 flex items-center justify-center gap-0.5">
                          <span>{free.rating}</span>
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Thù Lao/Giờ</div>
                        <div className="font-black text-emerald-700 mt-0.5">
                          {((free.hourlyRate || 300000) / 1000).toFixed(0)}k đ
                        </div>
                      </div>
                    </div>

                    {/* Bio Section: "Mô tả bản thân có thể làm những gì" */}
                    <div className="bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100/60 text-xs text-slate-700 leading-relaxed">
                      <div className="font-bold text-indigo-950 text-[11px] mb-1 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
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
                            className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
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
                              className="text-indigo-600 hover:text-indigo-800 text-[10px] font-extrabold flex items-center gap-0.5"
                            >
                              <span>Xem Portfolio đầy đủ</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {free.portfolio.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedPortfolioItem(item)}
                              className="group/item relative h-20 rounded-xl overflow-hidden cursor-pointer border border-slate-200"
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                                <span className="text-[10px] font-bold text-white truncate drop-shadow-xs">
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
                      Đã hoàn thành <strong className="text-slate-900 font-extrabold">{free.completedOrders} đơn</strong>
                    </div>

                    {currentUser.role === 'employer' ? (
                      <button
                        onClick={() => handleOpenInvite(free)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Mời Báo Giá Dự Án</span>
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
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Xem Chi Tiết</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Portfolio Item Zoom Modal */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-64 bg-slate-900">
              <img
                src={selectedPortfolioItem.image}
                alt={selectedPortfolioItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPortfolioItem(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {selectedPortfolioItem.category}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900">{selectedPortfolioItem.title}</h3>

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
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setSelectedPortfolioItem(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-indigo-700 font-black text-base">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Send className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-black text-sm">Gửi Lời Mời Nhận Dự Án</h3>
                  <p className="text-[11px] text-slate-500 font-normal">Ứng viên: <strong className="text-indigo-600 font-bold">{selectedFreelancer.name}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Nhập lời chào hoặc ghi chú đặc biệt cho ứng viên..."
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
                        className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-400 rounded-2xl text-left transition-all space-y-1.5 cursor-pointer group"
                      >
                        <div className="font-extrabold text-slate-900 text-xs line-clamp-1 group-hover:text-indigo-700">
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
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-2xl">
                      Bạn chưa có dự án nào đang ở trạng thái mở tuyển dụng.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
