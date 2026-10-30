import { resolveAvatarUrl } from '../utils/avatar';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ProjectInvitation, Proposal } from '../types';
import { DashboardAnalyticsCharts } from '../components/common/DashboardAnalyticsCharts';

const PRESET_SKILLS = [
  { name: 'ReactJS', category: 'dev' },
  { name: 'TypeScript', category: 'dev' },
  { name: 'Node.js', category: 'dev' },
  { name: 'Next.js', category: 'dev' },
  { name: 'Vue.js', category: 'dev' },
  { name: 'Flutter', category: 'dev' },
  { name: 'React Native', category: 'dev' },
  { name: 'Python', category: 'dev' },
  { name: 'PHP / Laravel', category: 'dev' },
  { name: 'Golang', category: 'dev' },
  { name: 'Docker / DevOps', category: 'dev' },
  { name: 'Tailwind CSS', category: 'dev' },
  
  { name: 'UI/UX Design', category: 'design' },
  { name: 'Figma', category: 'design' },
  { name: 'Adobe Photoshop', category: 'design' },
  { name: 'Adobe Illustrator', category: 'design' },
  { name: 'Adobe Premiere', category: 'design' },
  { name: 'After Effects', category: 'design' },
  { name: '3D Blender', category: 'design' },
  
  { name: 'SEO Content', category: 'marketing' },
  { name: 'Facebook Ads', category: 'marketing' },
  { name: 'Google Ads', category: 'marketing' },
  { name: 'TikTok Creator', category: 'marketing' },
  { name: 'Copywriting', category: 'marketing' },
  
  { name: 'AI Prompt Engineer', category: 'ai' },
  { name: 'Machine Learning', category: 'ai' },
  { name: 'Data Analysis', category: 'ai' },
  { name: 'Chatbot NLP', category: 'ai' },
];

export const FreelancerDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'invitations' ? 'invitations' : 'proposals';

  const {
    orders,
    proposals,
    projects,
    currentUser,
    freelancers,
    updateFreelancerBioAndPortfolio,
    openWithdrawModal,
    savedProjectIds,
    invitations,
    acceptInvitation,
    declineInvitation,
    withdrawProposal,
    updateProposal,
    uploadAvatar,
    openAuthModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'proposals' | 'invitations' | 'profile'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'invitations') {
      setActiveTab('invitations');
    }
  }, [searchParams]);

  // Proposal Edit & Withdraw States
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editBidAmount, setEditBidAmount] = useState<number>(0);
  const [editEstimatedDays, setEditEstimatedDays] = useState<number>(7);
  const [editCoverLetter, setEditCoverLetter] = useState<string>('');
  const [proposalToWithdraw, setProposalToWithdraw] = useState<Proposal | null>(null);

  const handleOpenEditProposal = (prop: Proposal) => {
    setEditingProposal(prop);
    setEditBidAmount(prop.bidAmount);
    setEditEstimatedDays(prop.estimatedDays);
    setEditCoverLetter(prop.coverLetter);
  };

  const handleSaveEditProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;
    if (editBidAmount <= 0) {
      alert('Vui lòng nhập mức giá chào hợp lệ!');
      return;
    }
    updateProposal(editingProposal.id, editBidAmount, editEstimatedDays, editCoverLetter);
    setEditingProposal(null);
  };

  const handleConfirmWithdraw = () => {
    if (!proposalToWithdraw) return;
    withdrawProposal(proposalToWithdraw.id);
    setProposalToWithdraw(null);
  };

  // Invitations States & Modals
  const [selectedInvitation, setSelectedInvitation] = useState<ProjectInvitation | null>(null);
  const [showAcceptInviteModal, setShowAcceptInviteModal] = useState(false);
  const [showDeclineInviteModal, setShowDeclineInviteModal] = useState(false);
  const [acceptBidAmount, setAcceptBidAmount] = useState<number>(0);
  const [acceptResponseNote, setAcceptResponseNote] = useState('');
  const [declineReasonOption, setDeclineReasonOption] = useState('Lịch trình hiện tại đã kín');
  const [customDeclineReason, setCustomDeclineReason] = useState('');
  const [invitationFilter, setInvitationFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('ALL');

  // Find freelancer profile
  const myProfile =
    freelancers.find((f) => f.userId === currentUser.id || f.name === currentUser.name) ||
    freelancers[0];

  // Profile Edit States
  const [bio, setBio] = useState(myProfile?.bio || currentUser.bio || '');
  const [portfolioUrl, setPortfolioUrl] = useState(myProfile?.portfolioUrl || currentUser.portfolioUrl || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    myProfile?.skills && myProfile.skills.length > 0
      ? myProfile.skills
      : ['ReactJS', 'TypeScript', 'Node.js', 'Tailwind CSS']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<'all' | 'dev' | 'design' | 'marketing' | 'ai'>('all');

  const myOrders = orders.filter((o) => {
    if (currentUser.role === 'guest' || !currentUser.id || currentUser.id === 'guest') return false;
    const currentNumericId = currentUser.id ? currentUser.id.replace(/\D/g, '') : '';
    const orderFreeNumericId = o.freelancerId ? o.freelancerId.replace(/\D/g, '') : '';
    return Boolean(
      o.freelancerId === currentUser.id ||
      (currentNumericId && o.freelancerId === `free-${currentNumericId}`) ||
      (currentNumericId && o.freelancerId === `usr-free-${currentNumericId}`) ||
      (currentNumericId && orderFreeNumericId && currentNumericId === orderFreeNumericId) ||
      (currentUser.name && currentUser.name !== 'Khách vãng lai' && o.freelancerName === currentUser.name)
    );
  });
  const myProposals = proposals.filter((p) => {
    if (currentUser.role === 'guest' || !currentUser.id || currentUser.id === 'guest') return false;
    const currentNumericId = currentUser.id ? currentUser.id.replace(/\D/g, '') : '';
    const proposalFreeNumericId = p.freelancerId ? p.freelancerId.replace(/\D/g, '') : '';
    return Boolean(
      p.freelancerId === currentUser.id ||
      (currentNumericId && p.freelancerId === `free-${currentNumericId}`) ||
      (currentNumericId && p.freelancerId === `usr-free-${currentNumericId}`) ||
      (currentNumericId && proposalFreeNumericId && currentNumericId === proposalFreeNumericId) ||
      (currentUser.name && currentUser.name !== 'Khách vãng lai' && p.freelancerName === currentUser.name)
    );
  });

  const myInvitations = invitations.filter(
    (inv) =>
      inv.freelancerUserId === currentUser.id ||
      inv.freelancerId === myProfile?.id ||
      inv.freelancerName === currentUser.name ||
      (currentUser.id === 'usr-free-1' && (inv.freelancerId === 'free-1' || inv.freelancerUserId === 'usr-free-1')) ||
      (currentUser.id === 'usr-free-2' && (inv.freelancerId === 'free-2' || inv.freelancerUserId === 'usr-free-2'))
  );
  const pendingInvitations = myInvitations.filter((inv) => inv.status === 'PENDING');

  const filteredInvitations = myInvitations.filter((inv) => {
    if (invitationFilter === 'ALL') return true;
    return inv.status === invitationFilter;
  });
  const savedProjectsList = projects.filter((p) => savedProjectIds.includes(p.id));

  const activeOrders = myOrders.filter((o) => o.status === 'ORDER_IN_PROGRESS' || o.status === 'REVISION_REQUESTED');
  const deliveredOrders = myOrders.filter((o) => o.status === 'DELIVERED');

  const handleOpenAcceptInvite = (inv: ProjectInvitation) => {
    setSelectedInvitation(inv);
    setAcceptBidAmount(inv.projectBudget);
    setAcceptResponseNote(
      `Chào ${inv.employerName}, tôi rất vinh hạnh nhận được lời mời và sẵn sàng bắt đầu triển khai dự án "${inv.projectTitle}" theo đúng tiến độ đề ra.`
    );
    setShowAcceptInviteModal(true);
  };

  const handleConfirmAcceptInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvitation) return;
    acceptInvitation(selectedInvitation.id, acceptResponseNote, acceptBidAmount);
    setShowAcceptInviteModal(false);
  };

  const handleOpenDeclineInvite = (inv: ProjectInvitation) => {
    setSelectedInvitation(inv);
    setDeclineReasonOption('Lịch trình hiện tại đã kín');
    setCustomDeclineReason('');
    setShowDeclineInviteModal(true);
  };

  const handleConfirmDeclineInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvitation) return;
    const finalReason =
      declineReasonOption === 'Khác...'
        ? customDeclineReason.trim() || 'Không phù hợp'
        : declineReasonOption;
    declineInvitation(selectedInvitation.id, finalReason);
    setShowDeclineInviteModal(false);
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!selectedSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedSkills([...selectedSkills, trimmed]);
    }
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  const handleCustomSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(customSkillInput);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateFreelancerBioAndPortfolio({
      bio,
      portfolioUrl,
      skills: selectedSkills,
      portfolio: myProfile.portfolio
    });
  };

  if (currentUser.role === 'guest') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          <i className="fa-solid fa-user-gear" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Bảng Điều Khiển Freelancer</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Bạn đang truy cập dưới vai trò Khách. Vui lòng đăng nhập với tài khoản Freelancer để cập nhật hồ sơ năng lực, gửi báo giá và quản lý tiến độ hợp đồng.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Đăng Nhập Ngay
          </button>
          <Link
            to="/jobs"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            Tìm việc làm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Dashboard Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-sm border border-blue-200 mb-1.5">
            <i className="fa-solid fa-user-check text-xs" />
            <span>Tài Khoản Freelancer</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Góc Làm Việc Freelancer — {currentUser.name}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý hợp đồng Escrow đang thực hiện, bàn giao sản phẩm, theo dõi thu nhập và cập nhật Portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-right">
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Điểm Uy Tín TalentCredit:</div>
            <div className="text-sm font-bold text-blue-700 flex items-center justify-end gap-1 mt-0.5">
              <i className="fa-solid fa-award text-amber-500 text-xs" />
              <span>{myProfile.talentCreditScore} pts ({myProfile.talentCreditBadge})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn Hàng Đang Thực Hiện</div>
          <div className="text-2xl font-bold text-blue-700">{activeOrders.length}</div>
          <div className="text-[11px] text-slate-400">Tiền Escrow đã được Employer nạp cọc 100%</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ Khách Nghiệm Thu</div>
          <div className="text-2xl font-bold text-amber-600">{deliveredOrders.length}</div>
          <div className="text-[11px] text-amber-600 font-medium">Đếm ngược 72h tự động giải ngân</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số Dư Khả Dụng Trong Ví</div>
            <div className="text-2xl font-bold text-emerald-600">{(currentUser.balance || 0).toLocaleString('vi-VN')} đ</div>
            <div className="text-[11px] text-emerald-600 font-medium">Thu nhập sau trừ 10% phí sàn</div>
          </div>
          <button
            onClick={openWithdrawModal}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-wallet text-emerald-600 text-xs" />
            <span>Rút Tiền Về Ngân Hàng (24/7)</span>
          </button>
        </div>
      </div>

      {/* Thống kê biểu đồ Cột & Tròn */}
      <DashboardAnalyticsCharts userRole="freelancer" orders={myOrders} projects={projects} />

      {/* Quick Navigation Cards: Hợp Đồng & Việc Đã Lưu tách trang riêng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/contracts"
          className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-file-contract" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                  Hợp Đồng & Nộp Bài Bàn Giao
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                  {myOrders.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeOrders.length} đang thực hiện • {deliveredOrders.length} chờ duyệt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Mở trang /contracts</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </div>
        </Link>

        <Link
          to="/saved-jobs"
          className="p-4 bg-gradient-to-r from-rose-50 to-pink-50/60 rounded-xl border border-rose-200 hover:border-rose-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-heart" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                  Việc Làm Đã Lưu Quan Tâm
                </h3>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                  {savedProjectsList.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Xem lại danh sách công việc đã lưu để nộp đề xuất
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
            <span>Mở trang /saved-jobs</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </div>
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`py-2.5 px-4 sm:px-5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'proposals'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-paper-plane text-xs" />
          <span>Báo Giá Đã Gửi ({myProposals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`py-2.5 px-4 sm:px-5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer relative ${
            activeTab === 'invitations'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-envelope text-xs" />
          <span>Lời Mời Tuyển Dụng ({myInvitations.length})</span>
          {pendingInvitations.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingInvitations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-4 sm:px-5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-pen-to-square text-xs" />
          <span>Bio & Kỹ Năng Chuyên Môn</span>
        </button>
      </div>

      {/* TAB 1: PROPOSALS SENT */}

      {/* TAB 1: PROPOSALS SENT */}
      {activeTab === 'proposals' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <i className="fa-solid fa-paper-plane text-blue-600 text-xs" />
            <span>Đề Xuất Báo Giá Đã Gửi Cho Dự Án Tuyển Dụng</span>
          </h2>

          <div className="space-y-3">
            {myProposals.map((prop) => {
              const targetProj = projects.find((p) => p.id === prop.projectId);
              return (
                <div key={prop.id} className="border border-slate-200 rounded-md p-4 space-y-2.5 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm">{targetProj?.title || prop.projectTitle || 'Dự án tuyển dụng'}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-sm shrink-0 ${
                      prop.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : prop.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : prop.status === 'WITHDRAWN'
                        ? 'bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {prop.status === 'ACCEPTED'
                        ? '✓ ĐÃ ĐƯỢC DUYỆT'
                        : prop.status === 'REJECTED'
                        ? '✕ TỪ CHỐI'
                        : prop.status === 'WITHDRAWN'
                        ? '↩ ĐÃ RÚT HỒ SƠ'
                        : '⏳ ĐANG CHỜ DUYỆT'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-600">
                    <div>Mức giá bạn chào: <strong className="text-blue-700 font-bold">{prop.bidAmount.toLocaleString('vi-VN')} đ</strong></div>
                    <div>Thời hạn cam kết: <strong>{prop.estimatedDays} ngày</strong></div>
                    <div>Ngày gửi: {prop.createdAt}</div>
                  </div>

                  <p className="bg-white p-2.5 rounded-md border border-slate-200 text-slate-700 italic">
                    "{prop.coverLetter}"
                  </p>

                  {/* Actions: Edit & Withdraw if PENDING */}
                  {prop.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProposal(prop)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-md border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <i className="fa-solid fa-pen-to-square text-[11px] text-blue-600" />
                        <span>Chỉnh Sửa Báo Giá</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProposalToWithdraw(prop)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-md border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <i className="fa-solid fa-rotate-left text-[11px]" />
                        <span>Rút Hồ Sơ</span>
                      </button>
                    </div>
                  )}

                  {prop.status === 'WITHDRAWN' && (
                    <div className="text-[11px] text-slate-500 italic pt-1 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-info text-slate-400" />
                      <span>Bạn đã rút hồ sơ ứng tuyển này. Bạn có thể nộp đề xuất mới bất kỳ lúc nào nếu dự án còn mở tuyển.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: INVITATIONS LIST */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-envelope text-indigo-600 text-sm" />
                <span>Lời Mời Nhận Dự Án Trực Tiếp Từ Nhà Tuyển Dụng</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các doanh nghiệp đánh giá cao profile của bạn và chủ động gửi lời mời giao việc trực tiếp.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md shrink-0 self-start sm:self-auto text-xs font-semibold">
              <button
                onClick={() => setInvitationFilter('ALL')}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  invitationFilter === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({myInvitations.length})
              </button>
              <button
                onClick={() => setInvitationFilter('PENDING')}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                  invitationFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Chờ phản hồi</span>
                {pendingInvitations.length > 0 && (
                  <span className="bg-white text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingInvitations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setInvitationFilter('ACCEPTED')}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  invitationFilter === 'ACCEPTED'
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã đồng ý
              </button>
              <button
                onClick={() => setInvitationFilter('DECLINED')}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  invitationFilter === 'DECLINED'
                    ? 'bg-rose-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã từ chối
              </button>
            </div>
          </div>

          {/* Invitations List */}
          {filteredInvitations.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-md border border-slate-200 space-y-2">
              <i className="fa-solid fa-envelope text-2xl text-slate-300 mx-auto block" />
              <div className="font-semibold text-slate-700 text-xs">Không có lời mời nào trong mục này</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Khi Nhà tuyển dụng tìm thấy hồ sơ của bạn và gửi lời mời, thông tin sẽ xuất hiện ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className={`rounded-lg border transition-colors p-4 space-y-3 ${
                    inv.status === 'PENDING'
                      ? 'bg-slate-50/70 border-indigo-200 hover:border-indigo-300'
                      : inv.status === 'ACCEPTED'
                      ? 'bg-emerald-50/20 border-emerald-200'
                      : 'bg-slate-50/50 border-slate-200 opacity-90'
                  }`}
                >
                  {/* Header: Employer & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={inv.employerAvatar}
                        alt={inv.employerName}
                        className="w-9 h-9 rounded-md border border-slate-200 bg-white p-0.5 object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {inv.employerCompany || inv.employerName}
                          </span>
                          <span className="inline-flex items-center text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-xs font-semibold">
                            <i className="fa-solid fa-circle-check text-[9px] text-blue-600 mr-1" />
                            Đã xác thực
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Người liên hệ: <strong className="text-slate-700">{inv.employerName}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <i className="fa-solid fa-clock text-[10px]" />
                            {inv.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {inv.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-300">
                          <i className="fa-solid fa-clock text-[10px] text-amber-600" />
                          <span>Đang chờ bạn phản hồi</span>
                        </span>
                      )}
                      {inv.status === 'ACCEPTED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <i className="fa-solid fa-circle-check text-[10px] text-emerald-600" />
                          <span>✓ Đã Đồng Ý Nhận Dự Án</span>
                        </span>
                      )}
                      {inv.status === 'DECLINED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 border border-rose-300">
                          <i className="fa-solid fa-circle-xmark text-[10px] text-rose-600" />
                          <span>Đã Từ Chối</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm">
                        {inv.projectCategory || 'IT & Phần Mềm'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Mã DA: #{inv.projectId}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-sm">
                        Escrow Bảo Chứng
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {inv.projectTitle}
                    </h3>

                    {inv.projectDescription && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {inv.projectDescription}
                      </p>
                    )}

                    {/* Employer Personal Message Box */}
                    {inv.message && (
                      <div className="bg-indigo-50/60 border border-indigo-200 rounded-md p-3 space-y-1">
                        <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                          <i className="fa-solid fa-comment-dots text-indigo-600 text-xs" />
                          <span>Lời nhắn từ Nhà Tuyển Dụng:</span>
                        </div>
                        <p className="text-xs text-indigo-950 italic leading-relaxed">
                          "{inv.message}"
                        </p>
                      </div>
                    )}

                    {/* Decline Reason if any */}
                    {inv.status === 'DECLINED' && inv.declineReason && (
                      <div className="bg-rose-50 border border-rose-200 rounded-md p-2.5 text-xs text-rose-800">
                        <strong>Lý do từ chối:</strong> {inv.declineReason}
                      </div>
                    )}
                  </div>

                  {/* Footer: Budget + Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Ngân sách dự kiến</div>
                        <div className="text-sm font-bold text-blue-700 font-mono">
                          {inv.projectBudget.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Thời hạn bàn giao</div>
                        <div className="text-xs font-semibold text-slate-800">
                          {inv.projectDeadline || 'Theo thỏa thuận'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {inv.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleOpenDeclineInvite(inv)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 hover:border-rose-300 font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-xmark text-xs" />
                            <span>Từ Chối</span>
                          </button>

                          <button
                            onClick={() => handleOpenAcceptInvite(inv)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-check text-xs" />
                            <span>Xem & Đồng Ý Nhận</span>
                          </button>
                        </>
                      ) : inv.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => setActiveTab('proposals')}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Xem Báo Giá Đã Kích Hoạt →</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Đã đóng lời mời</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: UPDATE BIO & PORTFOLIO */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square text-blue-600 text-xs" />
              <span>Chỉnh Sửa Mô Tả Năng Lực, Kỹ Năng & Portfolio</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thông tin này sẽ xuất hiện trên trang Danh sách Freelancer để Nhà tuyển dụng tìm kiếm.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-3xl text-xs">
            {/* Avatar Upload Cloudinary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={resolveAvatarUrl(currentUser.avatar, currentUser.name)}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-300 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <i className="fa-solid fa-cloud-arrow-up text-blue-600" />
                    <span>Ảnh Đại Diện Freelancer (Cloudinary)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hệ thống lưu tên ảnh vào CSDL (ví dụ: {currentUser.avatar?.startsWith('http') ? 'image.png' : currentUser.avatar || 'image.png'}), tự động hiển thị qua Cloudinary CDN.
                  </p>
                </div>
              </div>
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-2">
                <i className="fa-solid fa-camera" />
                <span>Tải Ảnh Mới</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await uploadAvatar(file);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Bio */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                1. Mô tả bản thân & Năng lực kinh nghiệm (Bio):
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mô tả số năm kinh nghiệm, các loại sản phẩm bạn chuyên thực hiện..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none leading-relaxed"
                required
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                2. Liên kết Portfolio trực tiếp (Github / Behance / Website cá nhân / Figma):
              </label>
              <div className="relative">
                <i className="fa-solid fa-arrow-up-right-from-square text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/your-username hoặc https://behance.net/your-portfolio"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md font-mono text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Rich Skill Management */}
            <div className="p-4 bg-slate-50 rounded-md border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-tag text-blue-600 text-xs" />
                  <span className="font-bold text-slate-900 text-xs">
                    3. Kỹ Năng Chuyên Môn Của Bạn ({selectedSkills.length})
                  </span>
                </div>

                {selectedSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSkills([])}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Xóa tất cả kỹ năng
                  </button>
                )}
              </div>

              {/* Active Selected Skills Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-600">
                  Các kỹ năng đang hiển thị trong hồ sơ của bạn (Bấm ✕ để xóa):
                </div>
                {selectedSkills.length === 0 ? (
                  <div className="p-2.5 bg-white rounded-md border border-dashed border-slate-300 text-center text-slate-400 text-xs italic">
                    Chưa có kỹ năng nào. Vui lòng chọn bên dưới hoặc tự nhập thêm.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-white rounded-md border border-slate-200 min-h-[44px] items-center">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-semibold group hover:bg-blue-100 transition-colors"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="w-3.5 h-3.5 rounded-full bg-blue-200/70 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-[9px]"
                          title="Xóa kỹ năng này"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Skill Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Thêm kỹ năng khác:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleCustomSkillKeyDown}
                    placeholder="VD: Spring Boot, Solidity, Motion Graphics, Copywriting..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    disabled={!customSkillInput.trim()}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-xs" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>

              {/* Preset Skills Library */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                    <i className="fa-solid fa-wand-magic-sparkles text-amber-500 text-xs" />
                    <span>Gợi ý kỹ năng nhanh:</span>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-md text-[10px]">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'dev', label: 'IT' },
                      { id: 'design', label: 'Thiết kế' },
                      { id: 'marketing', label: 'Marketing' },
                      { id: 'ai', label: 'AI' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedSkillCategory(cat.id as any)}
                        className={`px-2 py-0.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                          selectedSkillCategory === cat.id
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SKILLS.filter(
                    (p) => selectedSkillCategory === 'all' || p.category === selectedSkillCategory
                  ).map((preset) => {
                    const isAdded = selectedSkills.some(
                      (s) => s.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            handleRemoveSkill(preset.name);
                          } else {
                            handleAddSkill(preset.name);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isAdded ? <i className="fa-solid fa-check text-[10px]" /> : <i className="fa-solid fa-plus text-[10px] text-slate-400" />}
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-floppy-disk text-xs" />
              <span>Lưu Thông Tin Hồ Sơ & Kỹ Năng</span>
            </button>
          </form>
        </div>
      )}

      {/* Accept Invitation Modal */}
      {showAcceptInviteModal && selectedInvitation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmAcceptInvite}
            className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base" />
                <span>Chấp Nhận Lời Mời Nhận Dự Án</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAcceptInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-indigo-50/60 p-3 rounded-md border border-indigo-200 space-y-1">
                <div className="font-bold text-slate-900 text-xs line-clamp-1">
                  {selectedInvitation.projectTitle}
                </div>
                <div className="text-slate-600 text-[11px]">
                  Doanh nghiệp tuyển dụng: <strong>{selectedInvitation.employerCompany || selectedInvitation.employerName}</strong>
                </div>
                <div className="text-blue-700 font-bold text-xs pt-0.5">
                  Ngân sách đề xuất: {selectedInvitation.projectBudget.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Mức giá báo giá của bạn (VND):
                </label>
                <input
                  type="number"
                  value={acceptBidAmount}
                  onChange={(e) => setAcceptBidAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md text-xs font-mono font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Ghi chú / Lời nhắn xác nhận gửi Nhà Tuyển Dụng:
                </label>
                <textarea
                  rows={3}
                  value={acceptResponseNote}
                  onChange={(e) => setAcceptResponseNote(e.target.value)}
                  placeholder="Nhập cam kết tiến độ hoặc phản hồi cho khách hàng..."
                  className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-[11px] leading-relaxed">
                Sau khi đồng ý, Nhà tuyển dụng sẽ nhận thông báo để nạp tiền cọc Escrow và kích hoạt Hợp đồng làm việc chính thức.
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAcceptInviteModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md text-xs cursor-pointer transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md text-xs shadow-xs cursor-pointer transition-colors"
              >
                Xác Nhận Đồng Ý Nhận Việc
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Decline Invitation Modal */}
      {showDeclineInviteModal && selectedInvitation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmDeclineInvite}
            className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
                <i className="fa-solid fa-circle-xmark text-rose-600 text-sm" />
                <span>Từ Chối Lời Mời Dự Án</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeclineInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Vui lòng chọn lý do từ chối dự án "<strong>{selectedInvitation.projectTitle}</strong>":
              </p>

              <div className="space-y-1.5">
                {[
                  'Lịch trình hiện tại đã kín',
                  'Ngân sách dự án chưa phù hợp với quy mô',
                  'Yêu cầu chuyên môn không khớp với thế mạnh',
                  'Thời hạn bàn giao quá gấp',
                  'Khác...'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                      declineReasonOption === reason
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="declineReason"
                      value={reason}
                      checked={declineReasonOption === reason}
                      onChange={() => setDeclineReasonOption(reason)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {declineReasonOption === 'Khác...' && (
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Nhập lý do chi tiết:</label>
                  <input
                    type="text"
                    value={customDeclineReason}
                    onChange={(e) => setCustomDeclineReason(e.target.value)}
                    placeholder="VD: Đang trong kỳ nghỉ phép..."
                    className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeclineInviteModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md text-xs cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-md text-xs shadow-xs cursor-pointer transition-colors"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Modal: Edit Proposal */}
      {editingProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <form onSubmit={handleSaveEditProposal} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <i className="fa-solid fa-pen-to-square text-base" />
                <span>Chỉnh Sửa Đề Xuất Báo Giá</span>
              </div>
              <button type="button" onClick={() => setEditingProposal(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Mức giá chào thầu (VND):</label>
                <input
                  type="number"
                  value={editBidAmount}
                  onChange={(e) => setEditBidAmount(Number(e.target.value))}
                  min={100000}
                  step={50000}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Thời hạn hoàn thành cam kết (ngày):</label>
                <input
                  type="number"
                  value={editEstimatedDays}
                  onChange={(e) => setEditEstimatedDays(Number(e.target.value))}
                  min={1}
                  max={180}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Thư thuyết phục & Phương án triển khai:</label>
                <textarea
                  rows={4}
                  value={editCoverLetter}
                  onChange={(e) => setEditCoverLetter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingProposal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors cursor-pointer text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-floppy-disk text-xs" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Confirm Withdraw Proposal */}
      {proposalToWithdraw && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs my-8">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Xác Nhận Rút Hồ Sơ Ứng Tuyển</h3>
                <p className="text-[11px] text-slate-500">Thao tác này sẽ hủy đề xuất báo giá của bạn</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200">
              Bạn có chắc chắn muốn rút hồ sơ ứng tuyển khỏi dự án? Sau khi rút, hồ sơ của bạn sẽ không còn trong danh sách xem xét của Nhà tuyển dụng.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProposalToWithdraw(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors cursor-pointer text-xs"
              >
                Không Rút
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md shadow-xs transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-rotate-left text-xs" />
                <span>Xác Nhận Rút Hồ Sơ</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
