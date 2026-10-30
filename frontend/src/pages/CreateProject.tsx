import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ProjectMilestone } from '../types';

interface MilestoneDraft {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  deliverables?: string;
}

const formatMoneyInput = (val: number | string): string => {
  if (val === '' || val === 0 || val === '0') return '';
  const num = typeof val === 'string' ? Number(val.replace(/\D/g, '')) : val;
  if (isNaN(num) || num <= 0) return '';
  return num.toLocaleString('vi-VN');
};

const parseMoneyInput = (str: string): number => {
  const digits = str.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

const SUGGESTED_SKILLS = [
  'ReactJS',
  'Node.js',
  'TypeScript',
  'Next.js',
  'Python',
  'Flutter',
  'Figma',
  'UI/UX Design',
  'SEO & Content',
  'Spring Boot',
  'MySQL'
];

export const CreateProject: React.FC = () => {
  const { createProject, currentUser, addToast } = useApp();
  const navigate = useNavigate();

  // Core Project Fields (All blank by default for user customization)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT & Lập trình');
  const [budgetType, setBudgetType] = useState<'FIXED' | 'MILESTONE'>('MILESTONE');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  // Fixed Price Fields (Blank by default)
  const [fixedBudget, setFixedBudget] = useState<number>(0);
  const [fixedDeadline, setFixedDeadline] = useState<string>('');

  // Milestone Mode Fields (Blank by default)
  const [targetBudget, setTargetBudget] = useState<number>(0);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    {
      id: `ms-draft-${Date.now()}`,
      title: '',
      amount: 0,
      dueDate: '',
      deliverables: ''
    }
  ]);

  // Calculations & Validation
  const totalMilestonesAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const isMilestoneMode = budgetType === 'MILESTONE';
  const remainingBudget = targetBudget - totalMilestonesAmount;
  const isOverBudget = isMilestoneMode && targetBudget > 0 && totalMilestonesAmount > targetBudget;
  const effectiveTotalBudget = isMilestoneMode ? (targetBudget > 0 ? targetBudget : totalMilestonesAmount) : fixedBudget;

  // Milestone Actions
  const handleAddMilestone = () => {
    const newMilestone: MilestoneDraft = {
      id: `ms-draft-${Date.now()}`,
      title: '',
      amount: 0,
      dueDate: '',
      deliverables: ''
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) {
      addToast('Dự án cần có ít nhất 1 cột mốc tiến độ.', 'warning');
      return;
    }
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleUpdateMilestone = (id: string, field: keyof MilestoneDraft, value: any) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  // Smart Templates & Quick Distribution Helpers
  const handleApplyTemplate = (type: '3-phases' | '2-phases' | 'distribute-even') => {
    const base = targetBudget > 0 ? targetBudget : 10000000;
    if (targetBudget === 0) {
      setTargetBudget(base);
    }

    if (type === '3-phases') {
      const p1 = Math.round(base * 0.3);
      const p2 = Math.round(base * 0.5);
      const p3 = base - p1 - p2;
      setMilestones([
        {
          id: `ms-${Date.now()}-1`,
          title: 'Giai đoạn 1: Thiết kế giao diện UI/UX & Khảo sát yêu cầu',
          amount: p1,
          dueDate: '',
          deliverables: 'Bản thiết kế Figma và luồng tương tác Prototype'
        },
        {
          id: `ms-${Date.now()}-2`,
          title: 'Giai đoạn 2: Lập trình phát triển các tính năng cốt lõi (Core Features)',
          amount: p2,
          dueDate: '',
          deliverables: 'Source code chạy thử nghiệm, kết nối API và cơ sở dữ liệu'
        },
        {
          id: `ms-${Date.now()}-3`,
          title: 'Giai đoạn 3: Kiểm thử chức năng, Tối ưu bảo mật & Bàn giao hệ thống',
          amount: p3,
          dueDate: '',
          deliverables: 'Bàn giao tài liệu, source code hoàn chỉnh và hỗ trợ vận hành'
        }
      ]);
      addToast('Đã áp dụng mẫu gợi ý 3 giai đoạn!', 'info');
    } else if (type === '2-phases') {
      const p1 = Math.round(base * 0.5);
      const p2 = base - p1;
      setMilestones([
        {
          id: `ms-${Date.now()}-1`,
          title: 'Giai đoạn 1: Xây dựng bản mẫu thử nghiệm (MVP/Prototype hoàn chỉnh)',
          amount: p1,
          dueDate: '',
          deliverables: 'Bản chạy thử có thể demo các luồng tính năng chính'
        },
        {
          id: `ms-${Date.now()}-2`,
          title: 'Giai đoạn 2: Hoàn thiện tính năng & Nghiệm thu toàn diện',
          amount: p2,
          dueDate: '',
          deliverables: 'Bàn giao sản phẩm hoàn chỉnh và nghiệm thu thanh toán'
        }
      ]);
      addToast('Đã áp dụng mẫu gợi ý 2 giai đoạn!', 'info');
    } else if (type === 'distribute-even') {
      if (milestones.length === 0) return;
      if (base <= 0) {
        addToast('Vui lòng nhập Tổng ngân sách dự kiến trước khi chia đều!', 'warning');
        return;
      }
      const splitAmount = Math.floor(base / milestones.length);
      const updated = milestones.map((m, idx) => {
        if (idx === milestones.length - 1) {
          return { ...m, amount: base - splitAmount * (milestones.length - 1) };
        }
        return { ...m, amount: splitAmount };
      });
      setMilestones(updated);
      addToast(`Đã chia đều ngân sách ${base.toLocaleString('vi-VN')} đ cho ${milestones.length} cột mốc!`, 'info');
    }
  };

  const handleToggleSkill = (skill: string) => {
    const skillsList = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillsList.includes(skill)) {
      setSkillsInput(skillsList.filter((s) => s !== skill).join(', '));
    } else {
      setSkillsInput([...skillsList, skill].join(', '));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('Vui lòng nhập tiêu đề dự án tuyển dụng.', 'warning');
      return;
    }
    if (!description.trim()) {
      addToast('Vui lòng nhập mô tả chi tiết yêu cầu công việc.', 'warning');
      return;
    }

    if (budgetType === 'FIXED') {
      if (!fixedBudget || fixedBudget <= 0) {
        addToast('Vui lòng nhập ngân sách trọn gói dự kiến lớn hơn 0 đ.', 'warning');
        return;
      }
      if (!fixedDeadline) {
        addToast('Vui lòng chọn thời hạn hoàn thành (Deadline).', 'warning');
        return;
      }
    } else {
      // MILESTONE VALIDATIONS
      if (!targetBudget || targetBudget <= 0) {
        addToast('Vui lòng nhập Tổng ngân sách dự kiến của dự án.', 'warning');
        return;
      }
      if (milestones.length === 0) {
        addToast('Vui lòng thiết lập ít nhất 1 cột mốc tiến độ.', 'warning');
        return;
      }
      for (let i = 0; i < milestones.length; i++) {
        const ms = milestones[i];
        if (!ms.title.trim()) {
          addToast(`Vui lòng nhập tên công việc cho Cột mốc #${i + 1}`, 'warning');
          return;
        }
        if (!ms.amount || ms.amount <= 0) {
          addToast(`Vui lòng nhập số tiền cho Cột mốc #${i + 1} lớn hơn 0 đ`, 'warning');
          return;
        }
        if (!ms.dueDate) {
          addToast(`Vui lòng chọn thời hạn hoàn thành cho Cột mốc #${i + 1}`, 'warning');
          return;
        }
      }

      // Check overbudget constraint
      if (totalMilestonesAmount > targetBudget) {
        addToast(
          `Tổng số tiền các cột mốc (${totalMilestonesAmount.toLocaleString('vi-VN')} đ) vượt quá tổng ngân sách dự kiến (${targetBudget.toLocaleString('vi-VN')} đ). Vui lòng điều chỉnh lại!`,
          'error'
        );
        return;
      }
    }

    const finalBudget = budgetType === 'MILESTONE' ? targetBudget : fixedBudget;
    const finalDeadline =
      budgetType === 'MILESTONE' && milestones.length > 0
        ? milestones[milestones.length - 1].dueDate || new Date().toISOString().split('T')[0]
        : fixedDeadline;

    const projectMilestones: ProjectMilestone[] | undefined =
      budgetType === 'MILESTONE'
        ? milestones.map((m, idx) => ({
            id: `ms-${Date.now()}-${idx + 1}`,
            title: m.title.trim(),
            amount: Number(m.amount),
            dueDate: m.dueDate,
            deliverables: m.deliverables?.trim() || undefined
          }))
        : undefined;

    createProject({
      title: title.trim(),
      category,
      employerId: currentUser.id,
      employerName: currentUser.name,
      employerAvatar: currentUser.avatar,
      employerCompany: currentUser.companyName,
      employerVerified: currentUser.isVerified,
      budget: finalBudget,
      budgetType,
      deadline: finalDeadline,
      description: description.trim(),
      requiredSkills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      milestones: projectMilestones
    });

    navigate('/projects');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-circle-plus text-lg" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Đăng Dự Án Tuyển Dụng Dịch Vụ Mới
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Tiếp cận hàng nghìn Freelancer chuyên nghiệp đã được eKYC. Tiền thù lao được bảo vệ an toàn qua Escrow VNPAY.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-7">
        {/* 1. Tiêu đề dự án */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Tiêu đề dự án tuyển dụng <span className="text-rose-500">*</span>:
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Cần thuê Lập trình viên ReactJS & Node.js xây dựng Website thương mại điện tử..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium placeholder-slate-400 transition-colors shadow-2xs"
            required
          />
        </div>

        {/* 2. Danh mục công việc */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Danh mục lĩnh vực chuyên môn <span className="text-rose-500">*</span>:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium bg-white transition-colors cursor-pointer shadow-2xs"
          >
            <option value="IT & Lập trình">💻 IT & Lập trình Web/App/AI</option>
            <option value="Thiết kế & Đồ họa">🎨 Thiết kế UI/UX & Đồ họa số</option>
            <option value="Video & Animation">🎬 Video Editing & TikTok Ads</option>
            <option value="Digital Marketing">📈 Digital Marketing & SEO</option>
            <option value="Viết lách & Nội dung">✍️ Viết lách & Dịch thuật chuyên nghiệp</option>
          </select>
        </div>

        {/* 3. Lựa chọn Hình thức ngân sách (Upwork-style Segmented Cards) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-800">
              Hình thức ngân sách & Tiến độ giải ngân <span className="text-rose-500">*</span>:
            </label>
            <span className="text-[11px] text-slate-500 font-medium">Chọn phương thức phù hợp với quy mô dự án</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Card 1: Chia theo Cột mốc */}
            <div
              onClick={() => setBudgetType('MILESTONE')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 relative ${
                budgetType === 'MILESTONE'
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  budgetType === 'MILESTONE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <i className="fa-solid fa-list-check text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Chia Cột mốc (Milestone-based)
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Chia nhỏ dự án thành các giai đoạn giao việc. Nghiệm thu và giải ngân tiền Escrow từng đợt linh hoạt.
                </p>
              </div>
              <div className="shrink-0 self-center">
                <input
                  type="radio"
                  name="budgetType"
                  checked={budgetType === 'MILESTONE'}
                  onChange={() => setBudgetType('MILESTONE')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Card 2: Trọn gói cố định */}
            <div
              onClick={() => setBudgetType('FIXED')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 relative ${
                budgetType === 'FIXED'
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  budgetType === 'FIXED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <i className="fa-solid fa-file-invoice-dollar text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Trọn gói cố định (Fixed Price)
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                    Đơn giản
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Thanh toán toàn bộ số tiền 1 lần duy nhất khi Freelancer bàn giao hoàn tất toàn bộ sản phẩm cuối cùng.
                </p>
              </div>
              <div className="shrink-0 self-center">
                <input
                  type="radio"
                  name="budgetType"
                  checked={budgetType === 'FIXED'}
                  onChange={() => setBudgetType('FIXED')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4A. SECTION: MILESTONE BUILDER (DYNAMIC SETUP WITH BUDGET GUARD) */}
        {budgetType === 'MILESTONE' ? (
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
            {/* Target Total Budget Input */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-bold text-slate-800">
                  Tổng ngân sách dự kiến của dự án (VND) <span className="text-rose-500">*</span>:
                </label>
                <span className="text-[11px] text-slate-500">
                  Các cột mốc bên dưới sẽ được chia nhỏ từ tổng ngân sách này
                </span>
              </div>

              {/* Formatted Text Money Input (No up/down single-digit spin errors) */}
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoneyInput(targetBudget)}
                  onChange={(e) => setTargetBudget(parseMoneyInput(e.target.value))}
                  placeholder="Nhập tổng ngân sách, ví dụ: 10.000.000"
                  className="w-full px-3.5 py-2.5 pr-14 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono font-bold text-blue-700 shadow-2xs placeholder-slate-400"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  VND
                </span>
              </div>

              {/* Quick Increment Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">Cộng nhanh:</span>
                {[500000, 1000000, 5000000, 10000000, 20000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTargetBudget((prev) => prev + amt)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    +{amt >= 1000000 ? `${amt / 1000000}Tr` : `${amt / 1000}K`}
                  </button>
                ))}
                {targetBudget > 0 && (
                  <button
                    type="button"
                    onClick={() => setTargetBudget(0)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
                  >
                    Xóa số
                  </button>
                )}
              </div>
            </div>

            {/* Budget Allocation Status Guard Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isOverBudget
                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                  : remainingBudget === 0 && targetBudget > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-blue-50/70 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <i
                      className={`text-sm ${
                        isOverBudget
                          ? 'fa-solid fa-triangle-exclamation text-rose-600 animate-pulse'
                          : remainingBudget === 0 && targetBudget > 0
                          ? 'fa-solid fa-circle-check text-emerald-600'
                          : 'fa-solid fa-circle-info text-blue-600'
                      }`}
                    />
                    <strong className="text-xs font-bold">
                      {isOverBudget
                        ? 'Cảnh báo: Tổng tiền các cột mốc vượt quá ngân sách!'
                        : remainingBudget === 0 && targetBudget > 0
                        ? 'Ngân sách phân bổ hoàn hảo (100% khớp)'
                        : 'Tình trạng phân bổ ngân sách các cột mốc'}
                    </strong>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    {isOverBudget ? (
                      <span className="text-rose-700 font-semibold">
                        Tổng các cột mốc (
                        <strong className="font-mono">
                          {totalMilestonesAmount.toLocaleString('vi-VN')} đ
                        </strong>
                        ) đang vượt quá ngân sách dự kiến (
                        <strong className="font-mono">
                          {targetBudget.toLocaleString('vi-VN')} đ
                        </strong>
                        ) là{' '}
                        <strong className="font-mono text-rose-800 underline">
                          {(totalMilestonesAmount - targetBudget).toLocaleString('vi-VN')} đ
                        </strong>
                        . Vui lòng giảm số tiền để không vượt quá ngân sách!
                      </span>
                    ) : targetBudget > 0 ? (
                      <span>
                        Đã phân bổ:{' '}
                        <strong className="font-mono text-blue-700">
                          {totalMilestonesAmount.toLocaleString('vi-VN')} đ
                        </strong>{' '}
                        /{' '}
                        <strong className="font-mono">
                          {targetBudget.toLocaleString('vi-VN')} đ
                        </strong>
                        {remainingBudget > 0 && (
                          <span className="ml-1 text-slate-600">
                            (Còn lại chưa chia:{' '}
                            <strong className="font-mono text-emerald-700 font-bold">
                              {remainingBudget.toLocaleString('vi-VN')} đ
                            </strong>
                            )
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>Vui lòng nhập Tổng ngân sách dự kiến ở trên để hệ thống tự động kiểm tra số tiền.</span>
                    )}
                  </p>
                </div>

                {/* Quick Helper Button: Chia đều */}
                {targetBudget > 0 && milestones.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('distribute-even')}
                      className="px-3 py-1.5 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-scale-balanced text-[10px] text-blue-600" />
                      <span>Chia đều cho {milestones.length} cột mốc</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Proportional visual progress bar */}
              {targetBudget > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                    {milestones.map((ms, idx) => {
                      const pct =
                        targetBudget > 0
                          ? Math.min((ms.amount / targetBudget) * 100, 100)
                          : 0;
                      const bgColors = [
                        'bg-blue-600',
                        'bg-indigo-600',
                        'bg-emerald-600',
                        'bg-amber-500',
                        'bg-purple-600',
                        'bg-cyan-600'
                      ];
                      const color = isOverBudget ? 'bg-rose-500' : bgColors[idx % bgColors.length];
                      return (
                        <div
                          key={ms.id}
                          style={{ width: `${pct}%` }}
                          className={`${color} h-full transition-all border-r border-white/50 last:border-0`}
                          title={`Cột mốc #${idx + 1}: ${ms.title || 'Chưa đặt tên'} (${Math.round(pct)}%)`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Header of Milestones List with Quick Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-timeline text-blue-600 text-sm" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh Sách Các Cột Mốc Công Việc ({milestones.length} Giai đoạn)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tự do thiết lập tiến độ và phân bổ số tiền cho từng mục công việc.
                </p>
              </div>

              {/* Optional Quick Template Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('3-phases')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-[10px]" />
                  <span>Gợi ý 3 giai đoạn</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('2-phases')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Gợi ý 2 giai đoạn</span>
                </button>
              </div>
            </div>

            {/* List of Dynamic Milestone Cards (All blank by default) */}
            <div className="space-y-3.5">
              {milestones.map((ms, index) => {
                const pct =
                  targetBudget > 0 && ms.amount > 0
                    ? Math.round((ms.amount / targetBudget) * 100)
                    : 0;

                return (
                  <div
                    key={ms.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 transition-all hover:border-blue-200"
                  >
                    {/* Milestone Card Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <strong className="text-xs font-bold text-slate-800">
                          Cột mốc #{index + 1}
                        </strong>
                        {pct > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 rounded-full">
                            ~{pct}% ngân sách
                          </span>
                        )}
                      </div>

                      {/* Delete button (guarded if > 1) */}
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(ms.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa cột mốc này"
                        >
                          <i className="fa-regular fa-trash-can text-xs" />
                        </button>
                      )}
                    </div>

                    {/* Milestone Title */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tên mục công việc / Giai đoạn <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        value={ms.title}
                        onChange={(e) => handleUpdateMilestone(ms.id, 'title', e.target.value)}
                        placeholder={`Ví dụ: Giai đoạn ${index + 1} - Thiết kế giao diện hoặc lập trình tính năng...`}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium placeholder-slate-400"
                        required
                      />
                    </div>

                    {/* Amount & Due Date in 2 columns (Formatted text without spin button bugs) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Số tiền thù lao cột mốc (VND) <span className="text-rose-500">*</span>:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatMoneyInput(ms.amount)}
                            onChange={(e) =>
                              handleUpdateMilestone(ms.id, 'amount', parseMoneyInput(e.target.value))
                            }
                            placeholder="Nhập số tiền, ví dụ: 3.000.000"
                            className="w-full px-3 py-2 pr-12 text-xs border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono font-bold text-blue-700 placeholder-slate-400"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">
                            VND
                          </span>
                        </div>

                        {/* Quick fill remaining budget if available */}
                        {remainingBudget > 0 && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateMilestone(ms.id, 'amount', ms.amount + remainingBudget)
                              }
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <i className="fa-solid fa-arrow-turn-down text-[9px]" />
                              <span>
                                Phân bổ số dư còn lại (+{remainingBudget.toLocaleString('vi-VN')} đ)
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Thời hạn hoàn thành (Deadline) <span className="text-rose-500">*</span>:
                        </label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={ms.dueDate}
                          onChange={(e) => handleUpdateMilestone(ms.id, 'dueDate', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Deliverables Link Criteria */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Yêu cầu Link sản phẩm bàn giao (Deliverables Link):
                        </label>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Mặc định qua link trực tuyến
                        </span>
                      </div>
                      <input
                        type="text"
                        value={ms.deliverables || ''}
                        onChange={(e) =>
                          handleUpdateMilestone(ms.id, 'deliverables', e.target.value)
                        }
                        placeholder="VD: Yêu cầu nộp Link Google Drive (quyền xem), link Figma hoặc link repository GitHub..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-700 placeholder-slate-400 shadow-2xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Milestone Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddMilestone}
                className="w-full py-2.5 px-4 bg-white hover:bg-blue-50/60 text-blue-600 border border-dashed border-blue-300 hover:border-blue-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <i className="fa-solid fa-plus text-xs group-hover:scale-110 transition-transform" />
                <span>+ Thêm Cột Mốc Công Việc Tiếp Theo</span>
              </button>
            </div>
          </div>
        ) : (
          /* 4B. SECTION: FIXED PRICE SETUP (Blank by default, no spin buttons) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Ngân sách trọn gói dự kiến (VND) <span className="text-rose-500">*</span>:
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoneyInput(fixedBudget)}
                  onChange={(e) => setFixedBudget(parseMoneyInput(e.target.value))}
                  placeholder="Nhập số tiền, ví dụ: 10.000.000"
                  className="w-full px-3.5 py-2.5 pr-14 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono font-bold text-blue-700 shadow-2xs placeholder-slate-400"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  VND
                </span>
              </div>

              {/* Quick Increment Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                {[500000, 1000000, 5000000, 10000000, 20000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFixedBudget((prev) => prev + amt)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    +{amt >= 1000000 ? `${amt / 1000000}Tr` : `${amt / 1000}K`}
                  </button>
                ))}
                {fixedBudget > 0 && (
                  <button
                    type="button"
                    onClick={() => setFixedBudget(0)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
                  >
                    Xóa số
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Thời hạn hoàn thành toàn bộ (Deadline) <span className="text-rose-500">*</span>:
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={fixedDeadline}
                onChange={(e) => setFixedDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium bg-white shadow-2xs"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Thời hạn cuối cùng để Freelancer bàn giao toàn bộ sản phẩm.
              </p>
            </div>
          </div>
        )}

        {/* 5. Kỹ năng yêu cầu & Quick Tags (Blank by default) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Kỹ năng yêu cầu (phân cách bằng dấu phẩy):
          </label>
          <input
            type="text"
            placeholder="Ví dụ: ReactJS, Figma, UI/UX, Node.js, Spring Boot..."
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium shadow-2xs placeholder-slate-400"
          />

          {/* Suggested skills pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Gợi ý nhanh:</span>
            {SUGGESTED_SKILLS.map((sk) => {
              const isSelected = skillsInput
                .split(',')
                .map((s) => s.trim().toLowerCase())
                .includes(sk.toLowerCase());
              return (
                <button
                  key={sk}
                  type="button"
                  onClick={() => handleToggleSkill(sk)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Mô tả chi tiết yêu cầu công việc (Blank by default) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Mô tả chi tiết yêu cầu công việc (Scope of Work) <span className="text-rose-500">*</span>:
          </label>
          <textarea
            rows={5}
            placeholder="Mô tả cụ thể bối cảnh dự án, các tính năng cần có, kết quả đầu ra cần bàn giao và các tiêu chí nghiệm thu..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed shadow-2xs placeholder-slate-400"
            required
          />
        </div>

        {/* 7. Escrow Guarantee Notice */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
          <i className="fa-solid fa-shield-halved text-emerald-600 text-base shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <strong className="block text-emerald-950 font-bold">
              Bảo lãnh thanh toán qua Ví Tạm Giữ Escrow VNPAY
            </strong>
            <span>
              Đăng tin tuyển dụng hoàn toàn miễn phí. Khi bạn đồng ý báo giá của Freelancer, số tiền tương ứng cho từng cột mốc sẽ được giữ an toàn trong ví Escrow và chỉ được giải ngân khi bạn đã kiểm tra và hài lòng với kết quả nghiệm thu.
            </span>
          </div>
        </div>

        {/* 8. Submit Button with Overbudget Protection */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isOverBudget}
            className={`w-full font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
              isOverBudget
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white hover:shadow-md cursor-pointer'
            }`}
          >
            <i className="fa-solid fa-paper-plane text-xs" />
            <span>
              {isOverBudget
                ? `Vượt ngân sách ${(totalMilestonesAmount - targetBudget).toLocaleString('vi-VN')} đ (Vui lòng điều chỉnh lại)`
                : `Đăng Dự Án Tuyển Dụng Ngay ${effectiveTotalBudget > 0 ? `(${effectiveTotalBudget.toLocaleString('vi-VN')} đ)` : ''}`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
