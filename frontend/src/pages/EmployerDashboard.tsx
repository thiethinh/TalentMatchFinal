import { isSameProject } from '../utils/matching';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Order, Project } from '../types';
import { DashboardAnalyticsCharts } from '../components/common/DashboardAnalyticsCharts';
import { ReviewModal } from '../components/common/ReviewModal';

export const EmployerDashboard: React.FC = () => {
  const {
    orders,
    projects,
    proposals,
    freelancers,
    savedFreelancerIds,
    toggleSaveFreelancer,
    acceptProposal,
    acceptDelivery,
    requestRevision,
    submitReview,
    currentUser,
    openWithdrawModal,
    openVNPayModal,
    updateProject,
    jobQuestions,
    fetchJobQuestions,
    answerJobQuestion,
    openAuthModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'projects' | 'saved_freelancers'>('orders');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Edit Project States
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBudget, setEditBudget] = useState<number>(0);
  const [editBudgetType, setEditBudgetType] = useState<'FIXED' | 'MILESTONE'>('FIXED');
  const [editSkills, setEditSkills] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Q&A States
  const [projectForQnA, setProjectForQnA] = useState<Project | null>(null);
  const [answerInputs, setAnswerInputs] = useState<Record<number, string>>({});

  const handleOpenEditProject = (prj: Project) => {
    setProjectToEdit(prj);
    setEditTitle(prj.title);
    setEditCategory(prj.category);
    setEditBudget(prj.budget);
    setEditBudgetType(prj.budgetType || 'FIXED');
    setEditSkills(prj.requiredSkills.join(', '));
    setEditDeadline(prj.deadline ? prj.deadline.split('T')[0] : '');
    setEditDescription(prj.description);
  };

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;
    if (!editTitle.trim()) {
      alert('Vui lòng nhập tiêu đề dự án!');
      return;
    }

    const skillsArray = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateProject(projectToEdit.id, {
      title: editTitle.trim(),
      category: editCategory,
      budget: editBudget,
      budgetType: editBudgetType,
      requiredSkills: skillsArray,
      deadline: editDeadline || undefined,
      description: editDescription.trim()
    });

    setProjectToEdit(null);
  };

  const handleOpenQnA = async (prj: Project) => {
    setProjectForQnA(prj);
    await fetchJobQuestions(prj.id);
  };

  const handleSendAnswer = async (qId: number) => {
    const text = answerInputs[qId] || (document.getElementById(`answer-input-${qId}`) as HTMLInputElement)?.value;
    if (!text || !text.trim() || !projectForQnA) return;
    await answerJobQuestion(qId, text.trim(), projectForQnA.id);
    setAnswerInputs((prev) => ({ ...prev, [qId]: '' }));
  };
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetOrder, setReviewTargetOrder] = useState<Order | null>(null);
  const [selectedProjectForProposals, setSelectedProjectForProposals] = useState<Project | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  const myOrders = orders.filter((o) => {
    if (currentUser.role === 'guest' || !currentUser.id || currentUser.id === 'guest') return false;
    const currentNumericId = currentUser.id ? currentUser.id.replace(/\D/g, '') : '';
    const orderEmpNumericId = o.employerId ? o.employerId.replace(/\D/g, '') : '';
    return Boolean(
      o.employerId === currentUser.id ||
      (currentNumericId && o.employerId === `usr-emp-${currentNumericId}`) ||
      (currentNumericId && o.employerId === `emp-${currentNumericId}`) ||
      (currentNumericId && orderEmpNumericId && currentNumericId === orderEmpNumericId) ||
      (currentUser.name && currentUser.name !== 'Khách vãng lai' && o.employerName === currentUser.name)
    );
  });
  const myProjects = projects.filter((p) => {
    if (currentUser.role === 'guest' || !currentUser.id || currentUser.id === 'guest') return false;
    const currentNumericId = currentUser.id ? currentUser.id.replace(/\D/g, '') : '';
    const projectEmpNumericId = p.employerId ? p.employerId.replace(/\D/g, '') : '';
    return Boolean(
      p.employerId === currentUser.id ||
      (currentNumericId && p.employerId === `usr-emp-${currentNumericId}`) ||
      (currentNumericId && p.employerId === `emp-${currentNumericId}`) ||
      (currentNumericId && projectEmpNumericId && currentNumericId === projectEmpNumericId) ||
      (currentUser.name && currentUser.name !== 'Khách vãng lai' && p.employerName === currentUser.name)
    );
  });

  const savedFreelancersList = freelancers.filter(
    (f) => savedFreelancerIds.includes(f.id) || savedFreelancerIds.includes(f.userId)
  );

  const pendingProposals = proposals.filter((prop) =>
    myProjects.some((p) => isSameProject(p.id, prop.projectId)) && prop.status === 'PENDING'
  );

  const handleOpenAccept = (ord: Order) => {
    setSelectedOrder(ord);
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = () => {
    if (!selectedOrder) return;
    const target = selectedOrder;
    acceptDelivery(target.id);
    setShowAcceptModal(false);
    
    // Automatically open Review Modal
    setReviewTargetOrder(target);
    setShowReviewModal(true);
  };

  const handleOpenRevision = (ord: Order) => {
    setSelectedOrder(ord);
    setShowRevisionModal(true);
  };

  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    requestRevision(selectedOrder.id, revisionNote);
    setShowRevisionModal(false);
    setRevisionNote('');
  };

  if (currentUser.role === 'guest') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          <i className="fa-solid fa-building-user" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Bảng Điều Khiển Nhà Tuyển Dụng</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Bạn đang truy cập dưới vai trò Khách. Vui lòng đăng nhập với tài khoản Nhà tuyển dụng để đăng tin tìm ứng viên, quản lý dự án và giám sát hợp đồng Escrow.
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
            to="/projects"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            Khám phá dự án
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-sm border border-emerald-200 mb-1.5">
            <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
            <span>Tài Khoản Nhà Tuyển Dụng Doanh Nghiệp</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bảng Điều Khiển Tuyển Dụng — {currentUser.name}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý dự án đăng tuyển, duyệt báo giá Freelancer và nghiệm thu giải ngân qua cổng Escrow VNPAY.
          </p>
        </div>

        <Link
          to="/create-project"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-md transition-colors shadow-xs flex items-center space-x-1.5 shrink-0"
        >
          <i className="fa-solid fa-circle-plus text-xs" />
          <span>Đăng Dự Án Mới</span>
        </Link>
      </div>

      {/* Financial & Project Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số Dư Khả Dụng Trong Ví</div>
            <div className="text-2xl font-bold text-emerald-600">
              {(currentUser.balance || 0).toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[11px] text-slate-400">Có thể dùng đăng tin hoặc rút về ngân hàng</div>
          </div>
          <button
            onClick={openWithdrawModal}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-wallet text-emerald-600 text-xs" />
            <span>Rút Tiền Về Ngân Hàng</span>
          </button>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiền Phong Tỏa Escrow VNPAY</div>
            <div className="text-2xl font-bold text-blue-700">
              {(currentUser.escrowBalance || 0).toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[11px] text-blue-600 font-medium">Bảo đảm trong các hợp đồng đang chạy</div>
          </div>
          <button
            onClick={() =>
              openVNPayModal({
                amount: 5000000,
                orderNumber: `TM-VNP-${Date.now().toString().slice(-4)}`,
                orderTitle: 'Nạp thêm tiền ký quỹ Escrow VNPAY',
                onPaymentComplete: () => {}
              })
            }
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-credit-card text-blue-600 text-xs" />
            <span>Nạp Cọc Escrow VNPAY</span>
          </button>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dự Án Đang Mở Tuyển Dụng</div>
            <div className="text-2xl font-bold text-slate-900">
              {myProjects.filter((p) => p.status === 'OPEN').length}
            </div>
            <div className="text-[11px] text-slate-400">Tổng cộng {myProjects.length} dự án đã tạo</div>
          </div>
          <Link
            to="/create-project"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-circle-plus text-slate-600 text-xs" />
            <span>Tạo Thêm Dự Án Mới</span>
          </Link>
        </div>
      </div>

      {/* Thống kê biểu đồ Cột Doanh thu/Chi phí & Tròn Trạng thái */}
      <DashboardAnalyticsCharts userRole="employer" orders={myOrders} projects={myProjects} />

      {/* Action Needed Section: Proposals & Deliveries */}
      {pendingProposals.length > 0 && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-5 space-y-3.5 shadow-2xs">
          <h2 className="font-bold text-blue-900 text-sm flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-blue-600 text-sm" />
            <span>Đề Xuất Báo Giá Mới Cần Duyệt & Ký Hợp Đồng ({pendingProposals.length})</span>
          </h2>

          <div className="space-y-2.5">
            {pendingProposals.map((prop) => {
              const projectTitle = prop.projectTitle || projects.find((p) => isSameProject(p.id, prop.projectId))?.title || 'Dự án tuyển dụng';
              return (
              <div key={prop.id} className="bg-white p-4 rounded-md border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-2 flex-1">
                  {/* Project Info Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-200">
                      <i className="fa-solid fa-briefcase text-[10px]" />
                      <span>Thuộc dự án: {projectTitle}</span>
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">#{prop.projectId.replace(/\D+/g, '')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <img src={prop.freelancerAvatar} alt={prop.freelancerName} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{prop.freelancerName}</span>
                      <span className="text-slate-400 text-xs ml-2">• <i className="fa-solid fa-star text-amber-500 text-[10px]" /> {prop.freelancerRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-blue-700 font-bold text-sm">{prop.bidAmount.toLocaleString('vi-VN')} đ</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Thời hạn cam kết: <strong>{prop.estimatedDays} ngày</strong></span>
                  </div>
                  <p className="text-slate-600 text-xs italic bg-slate-50 p-2 rounded-md border border-slate-200">
                    "{prop.coverLetter}"
                  </p>
                </div>

                <button
                  onClick={() => acceptProposal(prop.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <i className="fa-solid fa-credit-card text-xs" />
                  <span>Duyệt & Nạp Cọc VNPAY</span>
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-briefcase text-xs" />
          <span>Hợp Đồng & Tiến Độ ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`py-2.5 px-5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'projects'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-circle-plus text-xs" />
          <span>Dự Án Đã Đăng ({myProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved_freelancers')}
          className={`py-2.5 px-5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'saved_freelancers'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-bookmark text-xs" />
          <span>Freelancer Tiềm Năng Đã Lưu ({savedFreelancersList.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & DELIVERIES */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Active Orders List */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-briefcase text-blue-600 text-sm" />
              <span>Danh Sách Hợp Đồng Dự Án Đang Thực Hiện ({myOrders.length})</span>
            </h2>

            {myOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">Chưa có hợp đồng nào.</div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-slate-200 rounded-md p-4 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-semibold text-slate-500">{ord.orderNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            ord.status === 'DELIVERED'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <Link to={`/orders/${ord.id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors block">
                        {ord.serviceTitle}
                      </Link>

                      <div className="text-xs text-slate-600">
                        Freelancer: <span className="font-semibold text-slate-800">{ord.freelancerName}</span> | Đặt cọc Escrow: <span className="font-bold text-blue-700">{ord.totalAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {ord.status === 'DELIVERED' && (
                        <>
                          <button
                            onClick={() => handleOpenRevision(ord)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                          >
                            Yêu Cầu Sửa
                          </button>
                          <button
                            onClick={() => handleOpenAccept(ord)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-circle-check text-xs" />
                            <span>Nghiệm Thu</span>
                          </button>
                        </>
                      )}

                      {ord.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setReviewTargetOrder(ord);
                            setShowReviewModal(true);
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-star text-amber-500 text-xs" />
                          <span>Đánh Giá Review</span>
                        </button>
                      )}

                      <Link
                        to={`/orders/${ord.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1"
                      >
                        <span>Chi Tiết Hợp Đồng</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY POSTED PROJECTS */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-circle-plus text-blue-600 text-xs" />
                <span>Danh Sách Dự Án Đăng Tuyển ({myProjects.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý tiến độ nhận báo giá và trạng thái của các bài đăng tuyển dụng.
              </p>
            </div>

            <Link
              to="/create-project"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <i className="fa-solid fa-circle-plus text-xs" />
              <span>Đăng Dự Án Mới</span>
            </Link>
          </div>

          <div className="space-y-3">
            {myProjects.map((prj) => (
              <div
                key={prj.id}
                className="p-4 bg-slate-50/70 hover:bg-white rounded-md border border-slate-200 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm">
                      {prj.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{prj.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-sm ${
                      prj.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {prj.status === 'OPEN' ? 'Đang Nhận Báo Giá' : 'Đã Đóng'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{prj.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{prj.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prj.requiredSkills.map((sk) => (
                      <span key={sk} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-sm font-medium text-slate-600">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Ngân sách dự kiến</div>
                    <div className="text-sm font-bold text-blue-700 font-mono">
                      {prj.budget.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    Đã nhận: <strong className="text-emerald-700 font-bold">{prj.proposalsCount}</strong> báo giá
                  </div>
                </div>

                {/* Action Bar for Posted Project */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 w-full">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectForProposals(prj)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-users text-[11px]" />
                    <span>Xem Báo Giá ({prj.proposalsCount} đề xuất)</span>
                  </button>

                  <Link
                    to={`/jobs/${prj.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" />
                    <span>Chi Tiết Tin Tuyển Dụng</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenEditProject(prj)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-md border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <i className="fa-solid fa-pen-to-square text-[11px] text-indigo-600" />
                    <span>Chỉnh Sửa Dự Án</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenQnA(prj)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-md border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <i className="fa-solid fa-comments text-[11px] text-amber-600" />
                    <span>Hỏi Đáp / Giải Đáp (Q&A)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAVED FREELANCERS (BOOKMARK POOL) */}
      {activeTab === 'saved_freelancers' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-bookmark text-blue-600 text-xs" />
                <span>Freelancer Tiềm Năng Đã Lưu ({savedFreelancersList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách các nhân sự tự do tài năng bạn đã đánh dấu để mời tham gia các dự án tiếp theo.
              </p>
            </div>

            <Link
              to="/freelancers"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Khám phá thêm Freelancer</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            </Link>
          </div>

          {savedFreelancersList.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-md border border-slate-200 space-y-2.5">
              <i className="fa-solid fa-users text-2xl text-slate-300 mx-auto block" />
              <div className="font-semibold text-slate-700 text-xs">Chưa có Freelancer nào được lưu</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Truy cập trang Hồ Sơ Freelancer và bấm nút Tim / Lưu để xây dựng đội ngũ nhân sự tiềm năng riêng của bạn.
              </p>
              <Link
                to="/freelancers"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs"
              >
                <span>Tìm kiếm Freelancer ngay</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedFreelancersList.map((free) => (
                <div
                  key={free.id}
                  className="p-4 bg-slate-50/70 hover:bg-white rounded-md border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={free.avatar}
                        alt={free.name}
                        className="w-10 h-10 rounded-md object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-xs">{free.name}</h3>
                          {free.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-100 font-semibold px-1.5 py-0.2 rounded-xs">
                              <i className="fa-solid fa-circle-check text-[9px] text-blue-600" />
                              <span>Tích Xanh</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{free.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span><i className="fa-solid fa-star text-amber-500 text-[9px]" /> {free.rating} ({free.reviewCount} review)</span>
                          <span>•</span>
                          <span className="font-semibold text-amber-700">TCredit: {free.talentCreditScore}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveFreelancer(free.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Bỏ lưu freelancer"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {free.skills.slice(0, 4).map((sk) => (
                      <span key={sk} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-xs font-medium text-slate-600">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Thù lao theo giờ:</div>
                      <div className="text-xs font-bold text-emerald-700">
                        {((free.hourlyRate || 300000) / 1000).toFixed(0)}k đ/giờ
                      </div>
                    </div>

                    <Link
                      to={`/freelancers?search=${encodeURIComponent(free.name)}`}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-md transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Mời Vào Dự Án</span>
                      <i className="fa-solid fa-paper-plane text-[10px]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accept Work Modal */}
      {showAcceptModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base" />
                <span>Xác Nhận Nghiệm Thu & Giải Ngân Escrow</span>
              </div>
              <button onClick={() => setShowAcceptModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700">
                Bạn xác nhận bài bàn giao của <span className="font-bold text-slate-900">{selectedOrder.freelancerName}</span> đã đạt chuẩn yêu cầu dự án?
              </p>
              <div className="bg-emerald-50 p-3.5 rounded-md border border-emerald-200 space-y-1 text-emerald-900">
                <div>Số tiền Escrow sẽ được giải ngân: <span className="font-bold text-sm">{selectedOrder.freelancerPayoutAmount.toLocaleString('vi-VN')} đ</span></div>
                <div className="text-[11px] text-emerald-700">Phí sàn môi giới 10%: {selectedOrder.platformFee.toLocaleString('vi-VN')} đ</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md transition-colors text-xs cursor-pointer"
              >
                Xem Lại
              </button>
              <button
                onClick={handleConfirmAccept}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded-md transition-colors shadow-xs cursor-pointer"
              >
                Đồng Ý Nghiệm Thu & Đánh Giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmRevision} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm">
                <i className="fa-solid fa-rotate-left text-amber-600 text-sm" />
                <span>Yêu Cầu Chỉnh Sửa Bài (Revision)</span>
              </div>
              <button type="button" onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700">
                Số lần sửa còn lại: <span className="font-bold text-amber-700">{selectedOrder.maxRevisionsAllowed - selectedOrder.revisionCount} lần</span>
              </p>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Mô tả cụ thể các điểm cần Freelancer chỉnh sửa:</label>
                <textarea
                  rows={4}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Ghi rõ chi tiết lỗi hoặc điểm chưa ưng ý để Freelancer sửa..."
                  className="w-full p-2.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md text-xs cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-md text-xs shadow-xs cursor-pointer transition-colors"
              >
                Gửi Yêu Cầu Chỉnh Sửa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: View & Accept Proposals for Posted Project */}
      {selectedProjectForProposals && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-xs my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                  <span>Dự Án #{selectedProjectForProposals.id}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {selectedProjectForProposals.title}
                </h3>
                <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-3">
                  <span>Ngân sách dự kiến: <strong className="text-blue-700 font-mono">{selectedProjectForProposals.budget.toLocaleString('vi-VN')} đ</strong></span>
                  <span>•</span>
                  <span>Ngành: <strong>{selectedProjectForProposals.category}</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectForProposals(null)}
                className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* List of Proposals */}
            <div className="overflow-y-auto space-y-3.5 flex-1 pr-1">
              {proposals.filter((p) => isSameProject(p.projectId, selectedProjectForProposals.id)).length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <i className="fa-solid fa-file-circle-question text-3xl text-slate-300 mx-auto block" />
                  <div className="font-semibold text-slate-700">Chưa có đề xuất báo giá nào</div>
                  <p className="text-slate-400 text-xs">
                    Bài đăng hiện vẫn đang được công khai trên Sàn. Các Freelancer phù hợp sẽ gửi đề xuất sớm.
                  </p>
                </div>
              ) : (
                proposals
                  .filter((p) => isSameProject(p.projectId, selectedProjectForProposals.id))
                  .map((prop) => (
                    <div
                      key={prop.id}
                      className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200 space-y-3 transition-colors shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={prop.freelancerAvatar}
                            alt={prop.freelancerName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{prop.freelancerName}</span>
                              <span className="text-amber-500 flex items-center gap-0.5 text-[11px]">
                                <i className="fa-solid fa-star text-[10px]" />
                                <span>{prop.freelancerRating}</span>
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">Mã đề xuất: #{prop.id}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-700 font-mono">
                              {prop.bidAmount.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Cam kết hoàn thành trong <strong>{prop.estimatedDays} ngày</strong>
                            </div>
                          </div>

                          {prop.status === 'ACCEPTED' ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                              ✓ Đã Ký Hợp Đồng
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                acceptProposal(prop.id);
                                setSelectedProjectForProposals(null);
                              }}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <i className="fa-solid fa-file-contract text-xs" />
                              <span>Duyệt & Nạp Cọc Escrow</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cover letter */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-700 mb-1">Thư chào giá & Phương án thực hiện:</div>
                        <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs leading-relaxed italic">
                          "{prop.coverLetter}"
                        </p>
                      </div>

                      {/* Attachments if any */}
                      {prop.attachments && prop.attachments.length > 0 && (
                        <div className="pt-1">
                          <div className="text-[11px] font-semibold text-slate-700 mb-1.5">File & tài liệu đính kèm:</div>
                          <div className="flex flex-wrap gap-2">
                            {prop.attachments.map((att, attIdx) => (
                              <div key={attIdx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                                <i className="fa-solid fa-paperclip text-slate-400 text-[10px]" />
                                <span>{typeof att === 'string' ? att : att.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProjectForProposals(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

            {/* Review Modal */}
      {showReviewModal && reviewTargetOrder && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          order={reviewTargetOrder}
          onSubmitReview={submitReview}
        />
      )}


      {/* Modal: Edit Project */}
      {projectToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <form onSubmit={handleSaveEditProject} className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <i className="fa-solid fa-pen-to-square text-lg" />
                <span>Chỉnh Sửa Bài Đăng Dự Án Tuyển Dụng</span>
              </div>
              <button type="button" onClick={() => setProjectToEdit(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Tiêu đề dự án / công việc:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Lĩnh vực chuyên môn:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="IT & Lập trình">IT & Lập trình</option>
                    <option value="Thiết kế UI/UX">Thiết kế UI/UX</option>
                    <option value="AI & Dữ liệu">AI & Dữ liệu</option>
                    <option value="Video & Âm thanh">Video & Âm thanh</option>
                    <option value="Marketing & Bán hàng">Marketing & Bán hàng</option>
                    <option value="Dịch thuật & Nội dung">Dịch thuật & Nội dung</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ngân sách dự kiến (VND):</label>
                  <input
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    min={100000}
                    step={100000}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hình thức ngân sách:</label>
                  <select
                    value={editBudgetType}
                    onChange={(e) => setEditBudgetType(e.target.value as 'FIXED' | 'MILESTONE')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="FIXED">Trọn gói (Fixed Price)</option>
                    <option value="MILESTONE">Theo cột mốc (Milestone)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hạn chót hoàn thành (Deadline):</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Kỹ năng yêu cầu (cách nhau bằng dấu phẩy):</label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  placeholder="VD: ReactJS, Node.js, TypeScript, MySQL"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Mô tả chi tiết yêu cầu công việc:</label>
                <textarea
                  rows={5}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProjectToEdit(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors cursor-pointer text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-xs transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-floppy-disk text-xs" />
                <span>Lưu Thay Đổi Dự Án</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Employer Q&A / Answer Questions */}
      {projectForQnA && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 text-xs my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <div className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block mb-1">
                  Hỏi Đáp Công Khai Của Dự Án
                </div>
                <h3 className="font-bold text-slate-900 text-base">{projectForQnA.title}</h3>
                <p className="text-[11px] text-slate-500">
                  Giải đáp các câu hỏi, thắc mắc của Freelancer để họ đưa ra phương án và báo giá chính xác nhất.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProjectForQnA(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {(!jobQuestions[projectForQnA.id] || jobQuestions[projectForQnA.id].length === 0) ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <i className="fa-solid fa-comments text-3xl text-slate-300" />
                  <div className="font-bold text-slate-700 text-xs">Chưa có câu hỏi nào từ Freelancer</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Khi Freelancer đặt câu hỏi về yêu cầu, tài liệu hoặc phạm vi công việc, thông tin sẽ xuất hiện tại đây để bạn giải đáp.
                  </p>
                </div>
              ) : (
                jobQuestions[projectForQnA.id].map((q) => (
                  <div key={q.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={q.authorAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + q.authorName}
                          alt={q.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{q.authorName}</span>
                          <span className="text-[10px] text-slate-400 ml-2">{q.createdAt}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.answer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.answer ? '✓ Đã giải đáp' : '⏳ Chờ bạn trả lời'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 text-xs leading-relaxed font-medium">
                      "{q.question}"
                    </div>

                    {q.answer ? (
                      <div className="pl-3 border-l-2 border-indigo-400 space-y-1 bg-indigo-50/50 p-2 rounded-r-lg">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-900">
                          <i className="fa-solid fa-reply text-indigo-600" />
                          <span>Câu trả lời của bạn:</span>
                          <span className="text-slate-400 font-normal">({q.answeredAt})</span>
                        </div>
                        <p className="text-xs text-indigo-950">{q.answer}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          id={`answer-input-${q.id}`}
                          value={answerInputs[q.id] || ''}
                          onChange={(e) => setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Nhập câu trả lời giải đáp thắc mắc..."
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendAnswer(q.id)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-paper-plane text-[10px]" />
                          <span>Gửi Trả Lời</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setProjectForQnA(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs cursor-pointer transition-colors"
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
