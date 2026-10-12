import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import type { Order, ProjectInvitation } from '../types';
import {
  Briefcase,
  Award,
  Upload,
  ArrowUpRight,
  UserCheck,
  ExternalLink,
  Edit3,
  Send,
  Save,
  Wallet,
  Plus,
  X,
  Tag,
  Sparkles,
  Check,
  Bookmark,
  Building2,
  Heart,
  Trash2,
  CheckCircle2,
  Mail,
  MessageSquare,
  XCircle,
  Clock
} from 'lucide-react';

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
  const initialTab = searchParams.get('tab') === 'invitations' ? 'invitations' : 'orders';

  const {
    orders,
    proposals,
    projects,
    currentUser,
    users,
    freelancers,
    deliverWork,
    updateFreelancerBioAndPortfolio,
    openWithdrawModal,
    savedEmployerIds,
    savedProjectIds,
    toggleSaveEmployer,
    toggleSaveProject,
    invitations,
    acceptInvitation,
    declineInvitation
  } = useDemo();

  const [activeTab, setActiveTab] = useState<'orders' | 'proposals' | 'invitations' | 'saved' | 'profile'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'invitations') {
      setActiveTab('invitations');
    }
  }, [searchParams]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [demoUrl, setDemoUrl] = useState('https://demo-project.vercel.app');
  const [fileName, setFileName] = useState('SourceCode_Final_Deliverable_v1.0.zip');

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

  const myOrders = orders.filter(
    (o) => o.freelancerId === 'free-1' || o.freelancerId === 'free-2' || o.freelancerId === currentUser.id
  );
  const myProposals = proposals.filter((p) => p.freelancerId === 'free-1' || p.freelancerId === currentUser.id);

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

  const savedEmployers = users.filter((u) => u.role === 'employer' && savedEmployerIds.includes(u.id));
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

  const handleOpenDeliver = (ord: Order) => {
    setSelectedOrder(ord);
    setShowDeliverModal(true);
  };

  const handleConfirmDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    deliverWork(selectedOrder.id, deliveryNote, fileName, demoUrl);
    setShowDeliverModal(false);
    setDeliveryNote('');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tài Khoản Freelancer Ứng Viên</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Góc Làm Việc Freelancer — {currentUser.name}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý hợp đồng Escrow đang thực hiện, bàn giao sản phẩm, theo dõi thu nhập và cập nhật Portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Điểm Uy Tín TalentCredit:</div>
            <div className="text-base font-extrabold text-blue-700 flex items-center justify-end gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{myProfile.talentCreditScore} pts ({myProfile.talentCreditBadge})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500">Đơn Hàng Đang Thực Hiện</div>
          <div className="text-3xl font-extrabold text-blue-700">{activeOrders.length}</div>
          <div className="text-[11px] text-slate-400">Tiền Escrow đã được Employer nạp cọc 100%</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500">Chờ Khách Nghiệm Thu</div>
          <div className="text-3xl font-extrabold text-amber-600">{deliveredOrders.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold">Đếm ngược 72h tự động giải ngân</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500">Số Dư Khả Dụng Trong Ví</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{(currentUser.balance || 0).toLocaleString('vi-VN')} đ</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Thu nhập hoàn thành sau trừ 10% phí sàn</div>
          </div>
          <button
            onClick={openWithdrawModal}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rút Tiền Về Ngân Hàng (24/7)</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Hợp Đồng Đang Nhận ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'proposals'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Báo Giá Đã Gửi ({myProposals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all relative ${
            activeTab === 'invitations'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Lời Mời Dự Án ({myInvitations.length})</span>
          {pendingInvitations.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingInvitations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'saved'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Nhà Tuyển Dụng & Dự Án Đã Lưu ({savedEmployers.length + savedProjectsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Cập Nhật Bio & Portfolio Cá Nhân</span>
        </button>
      </div>

      {/* TAB 1: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center">
            <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
            <span>Danh Sách Hợp Đồng Dự Án Escrow Của Bạn</span>
          </h2>

          {myOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">Chưa có hợp đồng nào.</div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-500">{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'ORDER_IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'DELIVERED'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <Link to={`/orders/${ord.id}`} className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors block">
                      {ord.serviceTitle}
                    </Link>

                    <div className="text-xs text-slate-600">
                      Nhà tuyển dụng: <span className="font-semibold text-slate-800">{ord.employerName}</span> | Tiền thực nhận (90%): <span className="font-extrabold text-emerald-600">{ord.freelancerPayoutAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {ord.status === 'ORDER_IN_PROGRESS' && (
                      <button
                        onClick={() => handleOpenDeliver(ord)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Nộp Bài Bàn Giao</span>
                      </button>
                    )}

                    {ord.status === 'REVISION_REQUESTED' && (
                      <button
                        onClick={() => handleOpenDeliver(ord)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Nộp Lại Bản Sửa</span>
                      </button>
                    )}

                    <Link
                      to={`/orders/${ord.id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1"
                    >
                      <span>Chi Tiết Hợp Đồng</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROPOSALS SENT */}
      {activeTab === 'proposals' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center">
            <Send className="w-5 h-5 text-blue-600 mr-2" />
            <span>Đề Xuất Báo Giá Đã Gửi Cho Dự Án Tuyển Dụng</span>
          </h2>

          <div className="space-y-4">
            {myProposals.map((prop) => {
              const targetProj = projects.find((p) => p.id === prop.projectId);
              return (
                <div key={prop.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{targetProj?.title || 'Dự án tuyển dụng'}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                      prop.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prop.status === 'ACCEPTED' ? '✓ ĐÃ ĐƯỢC DUYỆT' : '⏳ ĐANG CHỜ DUYỆT'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600">
                    <div>Mức giá bạn chào: <strong className="text-blue-700 font-extrabold">{prop.bidAmount.toLocaleString('vi-VN')} đ</strong></div>
                    <div>Thời hạn cam kết: <strong>{prop.estimatedDays} ngày</strong></div>
                    <div>Ngày gửi: {prop.createdAt}</div>
                  </div>

                  <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 italic">
                    "{prop.coverLetter}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: INVITATIONS LIST */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>Lời Mời Nhận Dự Án Trực Tiếp Từ Nhà Tuyển Dụng</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Các doanh nghiệp đánh giá cao profile và portfolio của bạn và chủ động gửi lời mời giao việc trực tiếp.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl shrink-0 self-start sm:self-auto text-xs font-bold">
              <button
                onClick={() => setInvitationFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  invitationFilter === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({myInvitations.length})
              </button>
              <button
                onClick={() => setInvitationFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  invitationFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Chờ phản hồi</span>
                {pendingInvitations.length > 0 && (
                  <span className="bg-white text-amber-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingInvitations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setInvitationFilter('ACCEPTED')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  invitationFilter === 'ACCEPTED'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã đồng ý
              </button>
              <button
                onClick={() => setInvitationFilter('DECLINED')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  invitationFilter === 'DECLINED'
                    ? 'bg-rose-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã từ chối
              </button>
            </div>
          </div>

          {/* Invitations List */}
          {filteredInvitations.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Mail className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-xs">Không có lời mời nào trong mục này</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Khi Nhà tuyển dụng tìm thấy hồ sơ của bạn và gửi lời mời, thông tin sẽ xuất hiện ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className={`rounded-3xl border transition-all p-5 sm:p-6 space-y-4 ${
                    inv.status === 'PENDING'
                      ? 'bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 border-indigo-200 hover:border-indigo-400 shadow-sm'
                      : inv.status === 'ACCEPTED'
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-slate-50/70 border-slate-200 opacity-90'
                  }`}
                >
                  {/* Header: Employer & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={inv.employerAvatar}
                        alt={inv.employerName}
                        className="w-11 h-11 rounded-2xl border border-slate-200 bg-white p-0.5 object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {inv.employerCompany || inv.employerName}
                          </span>
                          <span className="inline-flex items-center text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md font-bold">
                            <CheckCircle2 className="w-3 h-3 text-blue-600 mr-0.5" />
                            Đã xác thực
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Người liên hệ: <strong className="text-slate-700">{inv.employerName}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Clock className="w-3 h-3" />
                            {inv.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {inv.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Đang chờ bạn phản hồi</span>
                        </span>
                      )}
                      {inv.status === 'ACCEPTED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>✓ Đã Đồng Ý Nhận Dự Án</span>
                        </span>
                      )}
                      {inv.status === 'DECLINED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Đã Từ Chối</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                        {inv.projectCategory || 'IT & Phần Mềm'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Mã DA: #{inv.projectId}</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Escrow Bảo Chứng
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {inv.projectTitle}
                    </h3>

                    {inv.projectDescription && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {inv.projectDescription}
                      </p>
                    )}

                    {/* Employer Personal Message Box */}
                    {inv.message && (
                      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 space-y-1">
                        <div className="text-[11px] font-black text-indigo-900 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Lời nhắn từ Nhà Tuyển Dụng:</span>
                        </div>
                        <p className="text-xs text-indigo-950 font-medium italic leading-relaxed">
                          "{inv.message}"
                        </p>
                      </div>
                    )}

                    {/* Decline Reason if any */}
                    {inv.status === 'DECLINED' && inv.declineReason && (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800">
                        <strong>Lý do từ chối:</strong> {inv.declineReason}
                      </div>
                    )}
                  </div>

                  {/* Footer: Budget + Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Ngân sách dự kiến</div>
                        <div className="text-base font-black text-blue-700 font-mono">
                          {inv.projectBudget.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Thời hạn bàn giao</div>
                        <div className="text-xs font-bold text-slate-800">
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
                            className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 hover:border-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Từ Chối</span>
                          </button>

                          <button
                            onClick={() => handleOpenAcceptInvite(inv)}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Xem Chi Tiết & Đồng Ý Nhận</span>
                          </button>
                        </>
                      ) : inv.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => setActiveTab('proposals')}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
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

      {/* TAB 3: SAVED EMPLOYERS & PROJECTS */}
      {activeTab === 'saved' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Section 1: Saved Employers */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Doanh Nghiệp / Nhà Tuyển Dụng Đã Lưu ({savedEmployers.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Danh sách các công ty và khách hàng tiềm năng bạn đã đánh dấu để theo dõi cơ hội việc làm mới.
                </p>
              </div>

              <Link
                to="/projects"
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Khám phá thêm dự án</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedEmployers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-700 text-xs">Bạn chưa lưu Nhà tuyển dụng nào</div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Khi xem các dự án tuyển dụng, bạn có thể bấm nút Lưu Doanh Nghiệp để tiện theo dõi các đợt tuyển dụng sau.
                </p>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  <span>Xem dự án đang tuyển</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedEmployers.map((emp) => {
                  const empProjects = projects.filter((p) => p.employerId === emp.id || p.employerName === emp.name);
                  return (
                    <div
                      key={emp.id}
                      className="p-5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 ring-2 ring-blue-500/20 shadow-2xs"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-extrabold text-slate-900 text-sm">{emp.companyName || emp.name}</h3>
                              {emp.isVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-100 font-bold px-1.5 py-0.2 rounded-md">
                                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                  <span>Tín nhiệm</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Đại diện: <strong className="text-slate-700">{emp.name}</strong> • MST: <span className="font-mono">{emp.taxCode || '0101234567'}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSaveEmployer(emp.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Bỏ lưu nhà tuyển dụng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-600">
                          Đang có <strong className="text-blue-700 font-bold">{empProjects.length}</strong> dự án đăng tuyển
                        </div>

                        <Link
                          to={`/projects?search=${encodeURIComponent(emp.companyName || emp.name)}`}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] rounded-xl transition-all flex items-center gap-1"
                        >
                          <span>Xem việc làm</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Saved Projects */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>Dự Án Tuyển Dụng Đã Lưu ({savedProjectsList.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các bài đăng dự án bạn quan tâm để chuẩn bị hồ sơ chào giá phù hợp nhất.
                </p>
              </div>

              <Link
                to="/projects"
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Xem tất cả dự án</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedProjectsList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-700 text-xs">Bạn chưa lưu Dự án nào</div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Duyệt danh sách Dự án Tuyển Dụng và nhấn nút Tim / Bookmark để lưu vào danh sách này.
                </p>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  <span>Duyệt dự án ngay</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {savedProjectsList.map((prj) => (
                  <div
                    key={prj.id}
                    className="p-5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                          {prj.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">#{prj.id}</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Escrow Bảo Chứng
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-sm hover:text-blue-600 transition-colors">
                        {prj.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {prj.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prj.requiredSkills.map((sk) => (
                          <span key={sk} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-semibold text-slate-600">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Ngân sách</div>
                        <div className="text-base font-black text-blue-700 font-mono">
                          {prj.budget.toLocaleString('vi-VN')} đ
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSaveProject(prj.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Bỏ lưu dự án"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/projects`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <span>Gửi Báo Giá</span>
                          <Send className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: UPDATE BIO & PORTFOLIO */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              <span>Chỉnh Sửa Mô Tả Năng Lực, Kỹ Năng & Portfolio</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thông tin này sẽ xuất hiện trên trang Danh sách Freelancer để Nhà tuyển dụng tìm kiếm, lọc theo kỹ năng và mời báo giá.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl text-xs">
            {/* Bio */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                1. Mô tả bản thân & Năng lực kinh nghiệm (Bio):
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mô tả số năm kinh nghiệm, các loại sản phẩm bạn chuyên thực hiện (Landing Page, App Flutter, Video Ads...)..."
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white leading-relaxed"
                required
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                2. Liên kết Portfolio trực tiếp (Github / Behance / Website cá nhân / Figma):
              </label>
              <div className="relative">
                <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/your-username hoặc https://behance.net/your-portfolio"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Rich Skill Management */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="font-extrabold text-slate-900 text-sm">
                    3. Kỹ Năng Chuyên Môn Của Bạn ({selectedSkills.length})
                  </span>
                </div>

                {selectedSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSkills([])}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Xóa tất cả kỹ năng
                  </button>
                )}
              </div>

              {/* Active Selected Skills Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600">
                  Các kỹ năng đang hiển thị trong hồ sơ của bạn (Bấm ✕ để xóa):
                </div>
                {selectedSkills.length === 0 ? (
                  <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs italic">
                    Chưa có kỹ năng nào. Vui lòng chọn bên dưới hoặc tự nhập thêm.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-slate-200 min-h-[48px] items-center">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold shadow-2xs group hover:bg-blue-100 transition-all"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="w-4 h-4 rounded-full bg-blue-200/70 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Xóa kỹ năng này"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Skill Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Thêm kỹ năng khác (Nhập tên kỹ năng và nhấn Enter hoặc nút Thêm):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleCustomSkillKeyDown}
                    placeholder="VD: Spring Boot, Solidity, Motion Graphics, Copywriting..."
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    disabled={!customSkillInput.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>

              {/* Preset Skills Library */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Thư viện gợi ý kỹ năng nhanh (Bấm để thêm vào hồ sơ):</span>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[10px]">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'dev', label: 'IT & Lập trình' },
                      { id: 'design', label: 'Thiết kế' },
                      { id: 'marketing', label: 'Marketing' },
                      { id: 'ai', label: 'AI & Data' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedSkillCategory(cat.id as any)}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
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
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin Hồ Sơ & Kỹ Năng</span>
            </button>
          </form>
        </div>
      )}

      {/* Deliver Work Modal */}
      {showDeliverModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmDeliver} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-base">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Nộp Sản Phẩm Bàn Giao (Deliver Work)</span>
              </div>
              <button type="button" onClick={() => setShowDeliverModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="font-bold text-slate-900 text-sm">{selectedOrder.serviceTitle}</div>
                <div className="text-slate-600 mt-0.5">Khách hàng: <strong>{selectedOrder.employerName}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tên file bàn giao đính kèm:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Link Demo sản phẩm chạy thực tế (tùy chọn):</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://demo-project.vercel.app"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Ghi chú hướng dẫn nghiệm thu cho khách hàng:</label>
                <textarea
                  rows={4}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Ghi rõ hướng dẫn cài đặt, tài khoản demo hoặc nội dung đã hoàn thiện theo Scope of Work..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                ⏱️ Sau khi nộp bài, hệ thống sẽ kích hoạt bộ đếm ngược <strong>72 giờ (3 ngày)</strong>. Nếu khách hàng không phản hồi hoặc không khiếu nại, tiền Escrow sẽ tự động được giải ngân vào tài khoản của bạn.
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeliverModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md"
              >
                Xác Nhận Nộp Bài Bàn Giao
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accept Invitation Modal */}
      {showAcceptInviteModal && selectedInvitation && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmAcceptInvite}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Chấp Nhận Lời Mời Nhận Dự Án</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAcceptInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 space-y-1">
                <div className="font-extrabold text-slate-900 text-xs line-clamp-1">
                  {selectedInvitation.projectTitle}
                </div>
                <div className="text-slate-600 text-[11px]">
                  Doanh nghiệp tuyển dụng: <strong>{selectedInvitation.employerCompany || selectedInvitation.employerName}</strong>
                </div>
                <div className="text-blue-700 font-bold text-xs pt-1">
                  Ngân sách đề xuất: {selectedInvitation.projectBudget.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Mức giá báo giá của bạn (VND):
                </label>
                <input
                  type="number"
                  value={acceptBidAmount}
                  onChange={(e) => setAcceptBidAmount(Number(e.target.value))}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Ghi chú / Lời nhắn xác nhận gửi Nhà Tuyển Dụng:
                </label>
                <textarea
                  rows={3}
                  value={acceptResponseNote}
                  onChange={(e) => setAcceptResponseNote(e.target.value)}
                  placeholder="Nhập cam kết tiến độ hoặc phản hồi cho khách hàng..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
                🛡️ Sau khi đồng ý, Nhà tuyển dụng sẽ nhận được thông báo ngay lập tức để tiến hành nạp tiền cọc Escrow và kích hoạt Hợp đồng làm việc chính thức.
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAcceptInviteModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md cursor-pointer"
              >
                Xác Nhận Đồng Ý Nhận Việc
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Decline Invitation Modal */}
      {showDeclineInviteModal && selectedInvitation && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmDeclineInvite}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-base">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Từ Chối Lời Mời Dự Án</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeclineInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Vui lòng chọn lý do từ chối dự án "<strong>{selectedInvitation.projectTitle}</strong>" để thông báo lịch sự đến Nhà tuyển dụng:
              </p>

              <div className="space-y-2">
                {[
                  'Lịch trình hiện tại đã kín',
                  'Ngân sách dự án chưa phù hợp với quy mô',
                  'Yêu cầu chuyên môn không khớp với thế mạnh',
                  'Thời hạn bàn giao quá gấp',
                  'Khác...'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      declineReasonOption === reason
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
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
                  <label className="block font-bold text-slate-800 mb-1">Nhập lý do chi tiết:</label>
                  <input
                    type="text"
                    value={customDeclineReason}
                    onChange={(e) => setCustomDeclineReason(e.target.value)}
                    placeholder="VD: Đang trong kỳ nghỉ phép..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeclineInviteModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md cursor-pointer"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
