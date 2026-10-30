import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Order } from '../types';
import { ReviewModal } from '../components/common/ReviewModal';

export const Contracts: React.FC = () => {
  const {
    orders,
    currentUser,
    deliverWork,
    acceptDelivery,
    requestRevision,
    submitReview,
    addToast
  } = useApp();

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ORDER_IN_PROGRESS' | 'DELIVERED' | 'REVISION_REQUESTED' | 'COMPLETED' | 'DISPUTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'amount_desc' | 'amount_asc'>('newest');

  // Delivery Modal State
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryDemoUrl, setDeliveryDemoUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  // Revision Modal State
  const [selectedOrderForRevision, setSelectedOrderForRevision] = useState<Order | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  // Review Modal State
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

  // Filter orders for current user (Freelancer or Employer)
  const myOrders = orders.filter((o) => {
    const currentNumericId = currentUser.id ? currentUser.id.replace(/\D/g, '') : '';
    if (currentUser.role === 'freelancer') {
      const orderFreeNumericId = o.freelancerId ? o.freelancerId.replace(/\D/g, '') : '';
      return (
        o.freelancerId === currentUser.id ||
        (currentNumericId && orderFreeNumericId === currentNumericId) ||
        (currentUser.name && o.freelancerName === currentUser.name)
      );
    }
    if (currentUser.role === 'employer') {
      const orderEmpNumericId = o.employerId ? o.employerId.replace(/\D/g, '') : '';
      return (
        o.employerId === currentUser.id ||
        (currentNumericId && orderEmpNumericId === currentNumericId) ||
        (currentUser.name && o.employerName === currentUser.name)
      );
    }
    // Admin or Guest: show all
    return true;
  });

  // Calculate Summary Metrics
  const activeOrdersCount = myOrders.filter((o) => o.status === 'ORDER_IN_PROGRESS').length;
  const deliveredOrdersCount = myOrders.filter((o) => o.status === 'DELIVERED').length;
  const revisionOrdersCount = myOrders.filter((o) => o.status === 'REVISION_REQUESTED').length;
  const completedOrdersCount = myOrders.filter((o) => o.status === 'COMPLETED').length;
  const totalEscrowAmount = myOrders
    .filter((o) => o.status !== 'COMPLETED' && o.status !== 'DISPUTED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Apply Search & Filters
  const filteredOrders = myOrders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.employerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Apply Sorting
  filteredOrders.sort((a, b) => {
    if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
    if (sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
  });

  // Handlers for Delivery
  const handleOpenDeliveryModal = (ord: Order) => {
    setSelectedOrderForDelivery(ord);
    setDeliveryTitle(`Bàn giao sản phẩm - ${ord.serviceTitle}`);
    setDeliveryUrl('');
    setDeliveryDemoUrl('');
    setDeliveryNote('');
  };

  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;
    if (!deliveryUrl.trim()) {
      addToast('Vui lòng nhập đường link sản phẩm bàn giao (Drive, Figma, GitHub...).', 'warning');
      return;
    }

    setIsSubmittingDelivery(true);
    setTimeout(() => {
      deliverWork(selectedOrderForDelivery.id, {
        title: deliveryTitle.trim() || `Bàn giao sản phẩm - ${selectedOrderForDelivery.serviceTitle}`,
        deliveryUrl: deliveryUrl.trim(),
        demoUrl: deliveryDemoUrl.trim() || undefined,
        note: deliveryNote.trim()
      });

      setIsSubmittingDelivery(false);
      setSelectedOrderForDelivery(null);
      addToast('✓ Đã nộp sản phẩm bàn giao thành công! Đang chờ đối tác nghiệm thu.', 'success');
    }, 600);
  };

  // Handlers for Employer Revision & Acceptance
  const handleOpenRevisionModal = (ord: Order) => {
    setSelectedOrderForRevision(ord);
    setRevisionNote('');
  };

  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRevision || !revisionNote.trim()) return;
    requestRevision(selectedOrderForRevision.id, revisionNote.trim());
    setSelectedOrderForRevision(null);
    setRevisionNote('');
    addToast('Đã gửi yêu cầu chỉnh sửa cho Freelancer thành công.', 'info');
  };

  const handleAcceptDelivery = (ord: Order) => {
    acceptDelivery(ord.id);
    setSelectedOrderForReview(ord);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 mb-1.5">
            <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
            <span>Trung Tâm Hợp Đồng & Ký Quỹ Escrow VNPAY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản Lý Hợp Đồng & Nộp Bài Bàn Giao
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Theo dõi tiến độ thực hiện, nộp liên kết sản phẩm và nghiệm thu giải ngân an toàn 100% qua cổng Escrow.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser.role === 'employer' ? (
            <Link
              to="/create-project"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-xs" />
              <span>Đăng Dự Án Mới</span>
            </Link>
          ) : (
            <Link
              to="/jobs"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <i className="fa-solid fa-magnifying-glass text-xs" />
              <span>Tìm Việc Làm Mới</span>
            </Link>
          )}

          <Link
            to={currentUser.role === 'employer' ? '/employer/dashboard' : '/freelancer/dashboard'}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-chart-pie text-xs" />
            <span>Về Bảng Điều Khiển</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số hợp đồng</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{myOrders.length}</div>
          <div className="text-[10px] text-slate-400">Tất cả dự án đã ký kết</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đang thực hiện</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">{activeOrdersCount}</div>
          <div className="text-[10px] text-blue-600 font-medium">{revisionOrdersCount > 0 ? `(${revisionOrdersCount} yêu cầu sửa)` : 'Theo đúng tiến độ SOW'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã bàn giao (Chờ duyệt)</div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{deliveredOrdersCount}</div>
          <div className="text-[10px] text-amber-600 font-medium">Đếm ngược 72h nghiệm thu</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bảo chứng Escrow VNPAY</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 font-mono">
            {totalEscrowAmount.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Tiền tạm giữ trong hợp đồng</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'ALL', label: `Tất cả (${myOrders.length})` },
              { id: 'ORDER_IN_PROGRESS', label: `Đang làm (${activeOrdersCount})` },
              { id: 'DELIVERED', label: `Đã bàn giao (${deliveredOrdersCount})` },
              { id: 'REVISION_REQUESTED', label: `Cần sửa (${revisionOrdersCount})` },
              { id: 'COMPLETED', label: `Hoàn thành (${completedOrdersCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã TM-xxxx, tên dự án, đối tác..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="amount_desc">Giá trị cao nhất</option>
              <option value="amount_asc">Giá trị thấp nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTRACTS LIST */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-file-contract" />
            </div>
            <div className="font-bold text-slate-800 text-base">Không tìm thấy hợp đồng nào phù hợp</div>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Không có dữ liệu hợp đồng nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isFreelancer = currentUser.role === 'freelancer' || currentUser.id === ord.freelancerId;
            const isEmployer = currentUser.role === 'employer' || currentUser.id === ord.employerId;

            // Status Badge Formatting
            const getStatusBadge = (st: string) => {
              switch (st) {
                case 'COMPLETED':
                  return { label: 'ĐÃ HOÀN THÀNH', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
                case 'DELIVERED':
                  return { label: 'ĐÃ BÀN GIAO (CHỜ DUYỆT)', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
                case 'REVISION_REQUESTED':
                  return { label: 'YÊU CẦU SỬA ĐỔI', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
                case 'DISPUTED':
                  return { label: 'TRANH CHẤP', bg: 'bg-red-50 text-red-800 border-red-300' };
                default:
                  return { label: 'ĐANG THỰC HIỆN', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
              }
            };

            const statusInfo = getStatusBadge(ord.status);

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all space-y-4"
              >
                {/* Header Row: ID, Status, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      #{ord.orderNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusInfo.bg}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Ngày tạo: {ord.createdAt || '2026-03-01'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Hạn chót SOW: <strong className="text-slate-800 font-semibold">{ord.deadline || '2026-04-15'}</strong></span>
                    {ord.status === 'DELIVERED' && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                        ⏳ Đếm ngược 72h nghiệm thu
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Content: Title, Partner, Financials, Milestones */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  
                  {/* Left: Project title & partner info (7 cols) */}
                  <div className="lg:col-span-7 space-y-2">
                    <Link
                      to={`/orders/${ord.id}`}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 block leading-snug"
                    >
                      {ord.serviceTitle}
                    </Link>

                    {/* Partner Card */}
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={isFreelancer ? ord.employerAvatar : ord.freelancerAvatar}
                        alt="Đối tác"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                      />
                      <div className="text-xs">
                        <div className="text-slate-400 text-[10px]">
                          {isFreelancer ? 'Nhà tuyển dụng / Doanh nghiệp:' : 'Freelancer thực hiện:'}
                        </div>
                        <div className="font-bold text-slate-800">
                          {isFreelancer ? ord.employerName : ord.freelancerName}
                        </div>
                      </div>
                    </div>

                    {/* Deliveries Count if any */}
                    {ord.deliveries && ord.deliveries.length > 0 && (
                      <div className="pt-1 flex items-center gap-2 text-xs text-slate-600">
                        <i className="fa-solid fa-link text-blue-600 text-xs" />
                        <span>Đã bàn giao: <strong>{ord.deliveries.length} liên kết sản phẩm</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Middle: Financials & Escrow (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="text-left sm:text-left lg:text-right">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {isFreelancer ? 'Tiền thực nhận (sau 10% phí)' : 'Tổng cọc bảo đảm Escrow'}
                      </div>
                      <div className={`text-xl font-bold font-mono ${isFreelancer ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {(isFreelancer ? ord.freelancerPayoutAmount : ord.totalAmount).toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {isFreelancer ? `Tổng ngân sách: ${ord.totalAmount.toLocaleString('vi-VN')} đ` : 'Đã nạp qua cổng VNPAY'}
                      </div>
                    </div>

                    {/* Milestones count */}
                    <div className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      Cột mốc hoàn thành: <strong className="text-blue-700 font-bold">{ord.milestones ? ord.milestones.length : 1} phase</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
                    <span>Hợp đồng có bảo chứng Escrow VNPAY</span>
                  </div>

                  <div className="flex items-center gap-2">
                    
                    {/* Freelancer Action: Nộp bài bàn giao */}
                    {isFreelancer && (ord.status === 'ORDER_IN_PROGRESS' || ord.status === 'REVISION_REQUESTED') && (
                      <button
                        type="button"
                        onClick={() => handleOpenDeliveryModal(ord)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-arrow-up-from-bracket text-xs" />
                        <span>Nộp Bài Bàn Giao</span>
                      </button>
                    )}

                    {/* Employer Action: Nghiệm thu hoặc Yêu cầu sửa khi status = DELIVERED */}
                    {isEmployer && ord.status === 'DELIVERED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenRevisionModal(ord)}
                          className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <i className="fa-solid fa-rotate-left text-xs" />
                          <span>Yêu Cầu Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptDelivery(ord)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <i className="fa-solid fa-circle-check text-xs" />
                          <span>Nghiệm Thu & Giải Ngân</span>
                        </button>
                      </>
                    )}

                    {/* View Details Link */}
                    <Link
                      to={`/orders/${ord.id}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>Xem Chi Tiết & Trao Đổi</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODAL: SUBMIT WORK DELIVERY */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitDelivery}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs my-8 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                <i className="fa-solid fa-link text-blue-600 text-sm" />
                <span>Nộp Đường Link Sản Phẩm Bàn Giao</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDelivery(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Dự án:</span>
              <div className="font-bold text-slate-900">{selectedOrderForDelivery.serviceTitle}</div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tiêu đề sản phẩm bàn giao:
                </label>
                <input
                  type="text"
                  value={deliveryTitle}
                  onChange={(e) => setDeliveryTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Đường dẫn liên kết chính (Google Drive, Figma, GitHub, Vercel...):
                </label>
                <input
                  type="url"
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  placeholder="https://drive.google.com/... hoặc https://figma.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Đảm bảo đã mở quyền xem/tải cho phía Khách hàng nghiệm thu.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Link Video Demo / Hướng dẫn (Loom / Youtube / Drive) (Không bắt buộc):
                </label>
                <input
                  type="url"
                  value={deliveryDemoUrl}
                  onChange={(e) => setDeliveryDemoUrl(e.target.value)}
                  placeholder="https://www.loom.com/share/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ghi chú & Hướng dẫn nghiệm thu cho Khách hàng:
                </label>
                <textarea
                  rows={3}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Mô tả các tính năng đã hoàn thiện, tài khoản test hoặc hướng dẫn chạy thử..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForDelivery(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmittingDelivery || !deliveryUrl.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDelivery ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane text-xs" />
                    <span>Xác Nhận Nộp Bài</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EMPLOYER REVISION REQUEST */}
      {selectedOrderForRevision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRevision}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <i className="fa-solid fa-rotate-left text-amber-600 text-sm" />
                <span>Yêu Cầu Chỉnh Sửa Sản Phẩm Bàn Giao</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForRevision(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold text-xs">
                Mô tả chi tiết những điểm cần Freelancer chỉnh sửa / hoàn thiện:
              </label>
              <textarea
                rows={4}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="VD: Cần sửa lại màu sắc header theo branding, kiểm tra lại responsive trên điện thoại màn hình nhỏ..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForRevision(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                Gửi Yêu Cầu Sửa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REVIEW MODAL ON ACCEPTANCE */}
      {selectedOrderForReview && (
        <ReviewModal
          isOpen={!!selectedOrderForReview}
          onClose={() => setSelectedOrderForReview(null)}
          order={selectedOrderForReview}
          onSubmitReview={submitReview}
        />
      )}

    </div>
  );
};

