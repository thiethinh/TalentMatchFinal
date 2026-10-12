import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import type { Order } from '../types';
import {
  Briefcase,
  CheckCircle2,
  RotateCcw,
  PlusCircle,
  ArrowUpRight,
  AlertCircle,
  Star,
  ShieldCheck,
  CreditCard,
  Wallet,
  Bookmark,
  Trash2,
  Users,
  Send
} from 'lucide-react';
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
    openVNPayModal
  } = useDemo();

  const [activeTab, setActiveTab] = useState<'orders' | 'projects' | 'saved_freelancers'>('orders');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetOrder, setReviewTargetOrder] = useState<Order | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  const myOrders = orders.filter((o) => o.employerId === currentUser.id || o.employerId === 'usr-emp-1');
  const myProjects = projects.filter((p) => p.employerId === currentUser.id || p.employerId === 'usr-emp-1');

  const savedFreelancersList = freelancers.filter(
    (f) => savedFreelancerIds.includes(f.id) || savedFreelancerIds.includes(f.userId)
  );

  const pendingProposals = proposals.filter((prop) =>
    myProjects.some((p) => p.id === prop.projectId) && prop.status === 'PENDING'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tài Khoản Nhà Tuyển Dụng Doanh Nghiệp</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Bảng Điều Khiển Tuyển Dụng — {currentUser.name}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý dự án đăng tuyển, duyệt báo giá ứng viên và nghiệm thu giải ngân qua cổng Escrow VNPAY.
          </p>
        </div>

        <Link
          to="/create-project"
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-3 rounded-2xl transition-all shadow-md flex items-center space-x-1.5 shrink-0"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Đăng Dự Án Mới</span>
        </Link>
      </div>

      {/* Financial & Project Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500">Số Dư Khả Dụng Trong Ví</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {(currentUser.balance || 0).toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[11px] text-slate-400">Có thể dùng đăng tin hoặc rút về ngân hàng</div>
          </div>
          <button
            onClick={openWithdrawModal}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rút Tiền Về Ngân Hàng</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500">Tiền Phong Tỏa Escrow VNPAY</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
              {(currentUser.escrowBalance || 0).toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[11px] text-blue-600 font-semibold">Bảo đảm trong các hợp đồng đang chạy</div>
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
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Nạp Cọc Escrow VNPAY</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500">Dự Án Đang Mở Tuyển Dụng</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {myProjects.filter((p) => p.status === 'OPEN').length}
            </div>
            <div className="text-[11px] text-slate-400">Tổng cộng {myProjects.length} dự án đã tạo</div>
          </div>
          <Link
            to="/create-project"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>Tạo Thêm Dự Án Mới</span>
          </Link>
        </div>
      </div>

      {/* Action Needed Section: Proposals & Deliveries */}
      {pendingProposals.length > 0 && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h2 className="font-extrabold text-blue-900 text-base flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span>Đề Xuất Báo Giá Mới Cần Duyệt & Ký Hợp Đồng ({pendingProposals.length})</span>
          </h2>

          <div className="space-y-3">
            {pendingProposals.map((prop) => (
              <div key={prop.id} className="bg-white p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <img src={prop.freelancerAvatar} alt={prop.freelancerName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{prop.freelancerName}</span>
                      <span className="text-slate-400 text-xs ml-2">• Điểm đánh giá: ⭐ {prop.freelancerRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-blue-700 font-extrabold text-sm">{prop.bidAmount.toLocaleString('vi-VN')} đ</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Thời hạn cam kết: <strong>{prop.estimatedDays} ngày</strong></span>
                  </div>
                  <p className="text-slate-600 text-xs italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{prop.coverLetter}"
                  </p>
                </div>

                <button
                  onClick={() => acceptProposal(prop.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-3 rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Duyệt & Nạp Cọc VNPAY</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <span>Hợp Đồng & Tiến Độ ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'projects'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Dự Án Đã Đăng ({myProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved_freelancers')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'saved_freelancers'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Freelancer Tiềm Năng Đã Lưu ({savedFreelancersList.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & DELIVERIES */}
      {activeTab === 'orders' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Action Needed Section: Proposals & Deliveries */}
          {pendingProposals.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <h2 className="font-extrabold text-blue-900 text-base flex items-center">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span>Đề Xuất Báo Giá Mới Cần Duyệt & Ký Hợp Đồng ({pendingProposals.length})</span>
              </h2>

              <div className="space-y-3">
                {pendingProposals.map((prop) => (
                  <div key={prop.id} className="bg-white p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <img src={prop.freelancerAvatar} alt={prop.freelancerName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{prop.freelancerName}</span>
                          <span className="text-slate-400 text-xs ml-2">• Điểm đánh giá: ⭐ {prop.freelancerRating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-blue-700 font-extrabold text-sm">{prop.bidAmount.toLocaleString('vi-VN')} đ</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">Thời hạn cam kết: <strong>{prop.estimatedDays} ngày</strong></span>
                      </div>
                      <p className="text-slate-600 text-xs italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{prop.coverLetter}"
                      </p>
                    </div>

                    <button
                      onClick={() => acceptProposal(prop.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-3 rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Duyệt & Nạp Cọc VNPAY</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Orders List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center">
              <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
              <span>Danh Sách Hợp Đồng Dự Án Đang Thực Hiện ({myOrders.length})</span>
            </h2>

            {myOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">Chưa có hợp đồng nào.</div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{ord.orderNumber}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
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

                      <Link to={`/orders/${ord.id}`} className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors block">
                        {ord.serviceTitle}
                      </Link>

                      <div className="text-xs text-slate-600">
                        Freelancer: <span className="font-semibold text-slate-800">{ord.freelancerName}</span> | Đặt cọc Escrow: <span className="font-bold text-blue-700">{ord.totalAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {ord.status === 'DELIVERED' && (
                        <>
                          <button
                            onClick={() => handleOpenRevision(ord)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
                          >
                            Yêu Cầu Sửa
                          </button>
                          <button
                            onClick={() => handleOpenAccept(ord)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
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
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Đánh Giá Review</span>
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
        </div>
      )}

      {/* TAB 2: MY POSTED PROJECTS */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <span>Danh Sách Dự Án Đăng Tuyển ({myProjects.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý tiến độ nhận báo giá và trạng thái của các bài đăng tuyển dụng.
              </p>
            </div>

            <Link
              to="/create-project"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng Dự Án Mới</span>
            </Link>
          </div>

          <div className="space-y-4">
            {myProjects.map((prj) => (
              <div
                key={prj.id}
                className="p-5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                      {prj.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{prj.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prj.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {prj.status === 'OPEN' ? 'Đang Nhận Báo Giá' : 'Đã Đóng'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">{prj.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{prj.description}</p>

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
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Ngân sách dự kiến</div>
                    <div className="text-base font-black text-blue-700 font-mono">
                      {prj.budget.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 font-semibold">
                    Đã nhận: <strong className="text-emerald-700 font-bold">{prj.proposalsCount}</strong> báo giá
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAVED FREELANCERS (BOOKMARK POOL) */}
      {activeTab === 'saved_freelancers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-600" />
                <span>Freelancer Tiềm Năng Đã Lưu ({savedFreelancersList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách các nhân sự tự do tài năng bạn đã đánh dấu để mời tham gia các dự án tiếp theo.
              </p>
            </div>

            <Link
              to="/freelancers"
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Khám phá thêm Freelancer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {savedFreelancersList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-xs">Chưa có Freelancer nào được lưu</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Truy cập trang Hồ Sơ Freelancer và bấm nút Tim / Lưu để xây dựng đội ngũ nhân sự tiềm năng riêng của bạn.
              </p>
              <Link
                to="/freelancers"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                <span>Tìm kiếm Freelancer ngay</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedFreelancersList.map((free) => (
                <div
                  key={free.id}
                  className="p-5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={free.avatar}
                        alt={free.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 ring-2 ring-blue-500/20 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-sm">{free.name}</h3>
                          {free.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-100 font-bold px-1.5 py-0.2 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              <span>Tích Xanh</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">{free.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>⭐ {free.rating} ({free.reviewCount} review)</span>
                          <span>•</span>
                          <span className="font-bold text-amber-700">TCredit: {free.talentCreditScore}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveFreelancer(free.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Bỏ lưu freelancer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {free.skills.slice(0, 4).map((sk) => (
                      <span key={sk} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-semibold text-slate-600">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Thù lao theo giờ:</div>
                      <div className="text-xs font-black text-emerald-700">
                        {((free.hourlyRate || 300000) / 1000).toFixed(0)}k đ/giờ
                      </div>
                    </div>

                    <Link
                      to={`/freelancers?search=${encodeURIComponent(free.name)}`}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-xl transition-all flex items-center gap-1 shadow-xs"
                    >
                      <span>Mời Vào Dự Án</span>
                      <Send className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-base">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>Xác Nhận Nghiệm Thu & Giải Ngân Escrow</span>
              </div>
              <button onClick={() => setShowAcceptModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-700">
                Bạn xác nhận bài bàn giao của <span className="font-bold text-slate-900">{selectedOrder.freelancerName}</span> đã đạt chuẩn yêu cầu dự án?
              </p>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1 text-emerald-900">
                <div>Số tiền Escrow sẽ được giải ngân: <span className="font-extrabold text-sm">{selectedOrder.freelancerPayoutAmount.toLocaleString('vi-VN')} đ</span></div>
                <div className="text-[11px] text-emerald-700">Phí sàn môi giới 10%: {selectedOrder.platformFee.toLocaleString('vi-VN')} đ</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-xs"
              >
                Xem Lại
              </button>
              <button
                onClick={handleConfirmAccept}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md"
              >
                Đồng Ý Nghiệm Thu & Đánh Giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmRevision} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-base">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <span>Yêu Cầu Chỉnh Sửa Bài (Revision)</span>
              </div>
              <button type="button" onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-700">
                Số lần sửa còn lại: <span className="font-bold text-amber-700">{selectedOrder.maxRevisionsAllowed - selectedOrder.revisionCount} lần</span>
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Mô tả cụ thể các điểm cần Freelancer chỉnh sửa:</label>
                <textarea
                  rows={4}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Ghi rõ chi tiết lỗi hoặc điểm chưa ưng ý để Freelancer sửa..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md"
              >
                Gửi Yêu Cầu Chỉnh Sửa
              </button>
            </div>
          </form>
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

    </div>
  );
};
