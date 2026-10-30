import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { ReviewModal } from '../components/common/ReviewModal';
import type { DeliveryFile } from '../types';

export const OrderWorkManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    orders,
    currentUser,
    deliverWork,
    acceptDelivery,
    requestRevision,
    fileDispute,
    submitReview,
    addToast,
    orderMessages,
    sendOrderMessage
  } = useDemo();

  const order = orders.find((o) => o.id === id) || orders[0];

  const [activeTab, setActiveTab] = useState<'timeline' | 'deliveries' | 'chat'>('timeline');
  const [chatInput, setChatInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');

  // Delivery Modal States (Link-First)
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const handleConfirmDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!deliveryUrl.trim()) {
      addToast('Vui lòng nhập đường link sản phẩm bàn giao.', 'warning');
      return;
    }

    deliverWork(order.id, {
      title: deliveryTitle.trim() || `Bàn giao sản phẩm - ${order.serviceTitle}`,
      deliveryUrl: deliveryUrl.trim(),
      note: deliveryNote.trim(),
      demoUrl: demoUrl.trim() || undefined
    });
    setShowDeliverModal(false);
    setDeliveryUrl('');
    setDeliveryTitle('');
    setDeliveryNote('');
    setDemoUrl('');
    setActiveTab('deliveries');
  };

  const getLinkTypeBadge = (del: DeliveryFile) => {
    const url = del.deliveryUrl || del.demoUrl || '';
    if (del.linkType === 'google-drive' || url.includes('drive.google.com')) {
      return { label: 'Google Drive', icon: 'fa-brands fa-google-drive text-amber-500', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (del.linkType === 'figma' || url.includes('figma.com')) {
      return { label: 'Figma Project', icon: 'fa-brands fa-figma text-purple-600', color: 'bg-purple-50 text-purple-800 border-purple-200' };
    }
    if (del.linkType === 'github' || url.includes('github.com')) {
      return { label: 'GitHub Repo', icon: 'fa-brands fa-github text-slate-800', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
    if (del.linkType === 'loom' || url.includes('loom.com')) {
      return { label: 'Loom Video', icon: 'fa-solid fa-video text-orange-500', color: 'bg-orange-50 text-orange-800 border-orange-200' };
    }
    return { label: 'Link Trực Tuyến', icon: 'fa-solid fa-link text-blue-600', color: 'bg-blue-50 text-blue-800 border-blue-200' };
  };

    const activeChatMessages = (order && orderMessages[order.id]) || [];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !order) return;
    sendOrderMessage(order.id, chatInput);
    setChatInput('');
  };

  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !revisionNote.trim()) return;
    requestRevision(order.id, revisionNote.trim());
    setShowRevisionModal(false);
    setRevisionNote('');
  };

  const handleAcceptDeliveryAction = () => {
    acceptDelivery(order.id);
    setShowReviewModal(true);
  };

  const handleConfirmDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    fileDispute(order.id, disputeReason, disputeEvidence);
    setShowDisputeModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back link */}
      <Link
        to={currentUser.role === 'freelancer' ? '/freelancer/dashboard' : '/employer/dashboard'}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <i className="fa-solid fa-chevron-left text-[10px] mr-1" />
        <span>Quay lại Dashboard</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-semibold text-slate-500">{order.orderNumber}</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-sm ${
                  order.status === 'ORDER_IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'DELIVERED'
                    ? 'bg-amber-100 text-amber-800'
                    : order.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Trạng thái: {order.status}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {order.serviceTitle}
            </h1>

            <div className="text-xs text-slate-500 pt-0.5">
              Freelancer: <span className="font-semibold text-slate-800">{order.freelancerName}</span> | Nhà tuyển dụng: <span className="font-semibold text-slate-800">{order.employerName}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 text-right shrink-0">
            <div className="text-xs text-slate-500 font-medium">Tiền Đặt Cọc Escrow VNPAY:</div>
            <div className="text-xl font-bold text-blue-700">{order.totalAmount.toLocaleString('vi-VN')} đ</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end mt-0.5">
              <i className="fa-solid fa-lock text-[9px] mr-1 text-emerald-600" />
              <span>Tạm Giữ An Toàn Tại Sàn</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <i className="fa-solid fa-clock text-blue-600 text-xs" />
            <span>Thời hạn hoàn thành: <strong className="text-slate-900">{order.deadline}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            {(order.status === 'ORDER_IN_PROGRESS' || order.status === 'REVISION_REQUESTED') &&
              (currentUser.role === 'freelancer' || currentUser.id === order.freelancerId) && (
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryTitle(`Bàn giao sản phẩm - ${order.serviceTitle}`);
                    setShowDeliverModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-up-from-bracket text-xs" />
                  <span>Nộp Link Bàn Giao</span>
                </button>
            )}

            {order.status === 'DELIVERED' && currentUser.role === 'employer' && (
              <>
                <button
                  onClick={() => requestRevision(order.id, 'Cần chỉnh sửa lại theo đúng cam kết SOW')}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  Yêu Cầu Sửa Bài
                </button>
                <button
                  onClick={handleAcceptDeliveryAction}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-md shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-circle-check text-xs" />
                  <span>Nghiệm Thu & Giải Ngân</span>
                </button>
              </>
            )}

            {order.status === 'COMPLETED' && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-star text-amber-500 text-xs" />
                <span>Gửi Đánh Giá Review</span>
              </button>
            )}

            {order.status !== 'COMPLETED' && order.status !== 'DISPUTED' && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-triangle-exclamation text-xs" />
                <span>Mở Khiếu Nại Tranh Chấp</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'timeline' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cột Mốc Tiến Độ ({order.milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'deliveries' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sản Phẩm Bàn Giao ({order.deliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'chat' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Trao Đổi Trực Tuyến
        </button>
      </div>

      {/* TAB 1: MILESTONES */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3.5 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Cột Mốc Thanh Toán & Nghiệm Thu Escrow</h3>
          <div className="space-y-2.5">
            {order.milestones.map((ms) => (
              <div key={ms.id} className="p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs">{ms.title}</div>
                  <div className="text-slate-500">Hạn hoàn thành: {ms.dueDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-700 text-xs">{ms.amount.toLocaleString('vi-VN')} đ</div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                    {ms.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERIES (Link-First) */}
      {activeTab === 'deliveries' && (
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-link text-blue-600 text-xs" />
                <span>Danh Sách Sản Phẩm & Đường Dẫn Bàn Giao</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Các sản phẩm bàn giao trực tuyến (Google Drive, Figma, GitHub, Vercel...). Bấm vào link để kiểm tra trực tiếp.
              </p>
            </div>
            {(order.status === 'ORDER_IN_PROGRESS' || order.status === 'REVISION_REQUESTED') &&
              (currentUser.role === 'freelancer' || currentUser.id === order.freelancerId) && (
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryTitle(`Bàn giao sản phẩm - ${order.serviceTitle}`);
                    setShowDeliverModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <i className="fa-solid fa-plus text-xs" />
                  <span>Nộp Link Mới</span>
                </button>
            )}
          </div>

          {/* Employer Acceptance / Revision Action Box */}
          {order.status === 'DELIVERED' && (currentUser.role === 'employer' || currentUser.id === order.employerId) && (
            <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-300 space-y-3 shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <i className="fa-solid fa-bell text-amber-600 text-sm" />
                <span>Freelancer đã bàn giao sản phẩm. Vui lòng kiểm tra link bên dưới và đưa ra quyết định:</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAcceptDeliveryAction}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-circle-check text-xs" />
                  <span>Nghiệm Thu & Giải Ngân Escrow</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(true)}
                  className="px-4 py-2 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <i className="fa-solid fa-rotate-left text-xs" />
                  <span>Yêu Cầu Chỉnh Sửa</span>
                </button>
              </div>
            </div>
          )}

          {/* Completed Order: Rating & Feedback Action Box */}
          {order.status === 'COMPLETED' && (
            <div className="p-4 bg-emerald-50/90 rounded-xl border border-emerald-300 space-y-3 shadow-2xs animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-award text-amber-500 text-base" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                      {currentUser.role === 'freelancer'
                        ? 'Hợp đồng đã hoàn thành & giải ngân! Hãy đánh giá Khách hàng'
                        : 'Hợp đồng đã hoàn thành & giải ngân! Hãy đánh giá Freelancer'}
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Đánh giá của bạn sẽ giúp xây dựng điểm uy tín TalentCredit minh bạch hai chiều trên sàn.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <i className="fa-solid fa-star text-xs" />
                  <span>{currentUser.role === 'freelancer' ? 'Đánh Giá Khách Hàng' : 'Đánh Giá Freelancer'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quy định bàn giao qua Link info alert */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-blue-900 text-[11px] leading-relaxed">
            <i className="fa-solid fa-circle-info text-blue-600 text-xs shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-blue-950">Quy định bàn giao:</strong> Toàn bộ sản phẩm được bàn giao dưới dạng <strong>đường link trực tuyến</strong> (Google Drive, Figma, GitHub, Staging Demo...). Khách hàng và Freelancer có thể click trực tiếp vào liên kết để kiểm tra chất lượng, nghiệm thu hoặc yêu cầu sửa đổi trong vòng 72 giờ.
            </div>
          </div>

          {order.deliveries.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 space-y-2">
              <i className="fa-solid fa-link-slash text-slate-300 text-3xl block" />
              <div className="font-semibold text-slate-600">Chưa có sản phẩm bàn giao nào</div>
              <p className="text-slate-400 text-[11px] max-w-md mx-auto">
                Freelancer sẽ gửi đường link sản phẩm kèm quyền truy cập tại đây khi hoàn thành các hạng mục theo SOW.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {order.deliveries.map((del) => {
                const badge = getLinkTypeBadge(del);
                const targetUrl = del.deliveryUrl || del.demoUrl || '';
                return (
                  <div key={del.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm border ${badge.color}`}>
                          <i className={badge.icon} />
                          <span>{badge.label}</span>
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{del.fileName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                        <i className="fa-regular fa-clock text-[10px]" />
                        <span>{del.uploadedAt}</span>
                      </div>
                    </div>

                    {/* Direct link button & URLs */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {targetUrl && (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md shadow-2xs transition-colors cursor-pointer text-xs"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                          <span>Mở Link Sản Phẩm Bàn Giao</span>
                        </a>
                      )}

                      {del.demoUrl && del.demoUrl !== del.deliveryUrl && (
                        <a
                          href={del.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-md shadow-2xs transition-colors cursor-pointer text-xs"
                        >
                          <i className="fa-solid fa-video text-orange-500 text-[10px]" />
                          <span>Xem Video Loom / Demo</span>
                        </a>
                      )}

                      {targetUrl && (
                        <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs sm:max-w-md bg-white px-2 py-1 rounded border border-slate-200">
                          {targetUrl}
                        </span>
                      )}
                    </div>

                    {/* Freelancer's instruction note */}
                    <div className="bg-white p-3 rounded-md border border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <i className="fa-solid fa-comment-dots text-slate-400" />
                        <span>Hướng dẫn kiểm tra & nghiệm thu:</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed italic">
                        "{del.note}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-xs">Tin Nhắn Trao Đổi Hợp Đồng</h3>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
              <span>Hệ thống tự động bảo vệ thông tin liên lạc ngoài sàn</span>
            </div>
          </div>

          <div className="h-72 overflow-y-auto space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
            {activeChatMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">Chưa có tin nhắn nào trong hợp đồng này. Hãy gửi lời chào đầu tiên!</div>
            ) : (
              activeChatMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id || msg.senderName === currentUser.name;
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-lg max-w-md mx-auto text-center font-medium shadow-2xs">
                      <i className="fa-solid fa-shield-halved text-amber-600 mr-1.5" />
                      <span>{msg.text}</span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex gap-2.5 max-w-lg ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <img
                      src={msg.senderAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + msg.senderName}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                    />
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-[10px] ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-bold text-slate-800">{msg.senderName}</span>
                        <span className="text-slate-400">{msg.createdAt}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn trao đổi (không chia sẻ SĐT/Zalo)..."
              className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs cursor-pointer transition-colors"
            >
              <i className="fa-solid fa-paper-plane text-xs" />
            </button>
          </form>
        </div>
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmRevision} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <i className="fa-solid fa-rotate-left text-amber-600 text-sm" />
                <span>Yêu Cầu Chỉnh Sửa Sản Phẩm Bàn Giao</span>
              </div>
              <button type="button" onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
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
                onClick={() => setShowRevisionModal(false)}
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

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          order={order}
          onSubmitReview={submitReview}
        />
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmDispute} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm" />
                <span>Mở Khiếu Nại Tranh Chấp Hợp Đồng</span>
              </div>
              <button type="button" onClick={() => setShowDisputeModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Lý do khiếu nại tranh chấp:</label>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Ví dụ: Freelancer chậm tiến độ 5 ngày, không đúng cam kết SOW..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Bằng chứng chứng từ kèm theo:</label>
                <textarea
                  rows={4}
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="Mô tả chi tiết và dẫn chứng link chứng cứ..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="bg-rose-50 p-2.5 rounded-md border border-rose-200 text-rose-900 text-[11px]">
                Tiền cọc Escrow sẽ được phong tỏa ngay lập tức. Đội ngũ Trọng tài Admin TalentMatch sẽ thụ lý và ra phán quyết trong vòng 3 ngày làm việc.
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Xác Nhận Mở Tranh Chấp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deliver Modal (Link-First with rich instructions) */}
      {showDeliverModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmDeliver} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm">
                <i className="fa-solid fa-link text-blue-600 text-sm" />
                <span>Nộp Link Sản Phẩm Bàn Giao (Submit Deliverables)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeliverModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer p-1 rounded-lg"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Order Info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-xs">{order.serviceTitle}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  Khách hàng: <strong>{order.employerName}</strong> | Đơn hàng: <span className="font-mono">{order.orderNumber}</span>
                </div>
              </div>

              {/* Guidelines / Thông tin hướng dẫn nộp link */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs text-blue-900">
                <div className="flex items-center gap-1.5 font-bold text-blue-800">
                  <i className="fa-solid fa-circle-info text-blue-600 text-xs" />
                  <span>Quy định bàn giao sản phẩm qua Đường dẫn liên kết (Link):</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  TalentMatch khuyến khích bàn giao qua link trực tuyến để đảm bảo an toàn, không giới hạn dung lượng và kiểm tra tiện lợi:
                </p>
                <ul className="text-[11px] text-blue-700/90 space-y-1 pl-4 list-disc leading-relaxed">
                  <li><strong>Google Drive / Dropbox:</strong> Vui lòng bật quyền truy cập <em>"Bất kỳ ai có đường liên kết đều có thể xem"</em>.</li>
                  <li><strong>Figma / Canva:</strong> Đính kèm đường dẫn dự án thiết kế hoặc prototype tương tác.</li>
                  <li><strong>GitHub / GitLab:</strong> Đính kèm đường dẫn kho mã nguồn hoặc Pull Request / Release.</li>
                  <li><strong>Website / App Staging:</strong> Gửi link demo sản phẩm chạy thực tế (Vercel, Netlify...).</li>
                  <li><strong>Loom / YouTube:</strong> Video quay màn hình demo hướng dẫn sử dụng.</li>
                </ul>
              </div>

              {/* 1. Link sản phẩm bàn giao chính (URL) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800">
                    Đường link sản phẩm bàn giao (URL) <span className="text-rose-500">*</span>:
                  </label>
                  {/* Platform detector badge */}
                  {deliveryUrl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {deliveryUrl.includes('drive.google.com')
                        ? '📁 Google Drive'
                        : deliveryUrl.includes('figma.com')
                        ? '🎨 Figma Project'
                        : deliveryUrl.includes('github.com')
                        ? '💻 GitHub Repo'
                        : deliveryUrl.includes('loom.com')
                        ? '🎥 Loom Video'
                        : '🌐 Link Trực Tuyến'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                    placeholder="https://drive.google.com/... hoặc https://github.com/... hoặc https://figma.com/..."
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-blue-700 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                    required
                  />
                  <i className="fa-solid fa-link absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                </div>
              </div>

              {/* 2. Tiêu đề / Tên đợt bàn giao */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tiêu đề sản phẩm bàn giao <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={deliveryTitle}
                  onChange={(e) => setDeliveryTitle(e.target.value)}
                  placeholder="Ví dụ: Bàn giao toàn bộ mã nguồn + Link bản chạy thử nghiệm Vercel"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                  required
                />
              </div>

              {/* 3. Link Demo bổ sung (Tùy chọn) */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Link Demo chạy thực tế / Video Loom giải thích (tùy chọn):
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://demo-project.vercel.app hoặc https://loom.com/share/..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                />
              </div>

              {/* 4. Ghi chú hướng dẫn nghiệm thu */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Ghi chú & Hướng dẫn nghiệm thu cho khách hàng <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Mô tả cụ thể cách truy cập tài nguyên, tài khoản demo (nếu có), các điểm cần khách hàng lưu ý kiểm tra khi nghiệm thu..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs leading-relaxed"
                  required
                />
              </div>

              {/* 72h Countdown Warning */}
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
                <i className="fa-solid fa-hourglass-half text-amber-600 text-xs shrink-0 mt-0.5" />
                <span>
                  Sau khi nộp link, hệ thống kích hoạt đếm ngược <strong>72 giờ (3 ngày)</strong>. Khách hàng sẽ kiểm tra và bấm "Nghiệm Thu & Giải Ngân". Nếu khách hàng không phản hồi hoặc không khiếu nại sau 72 giờ, tiền Escrow tự động giải ngân vào tài khoản của bạn.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeliverModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-paper-plane text-xs" />
                <span>Xác Nhận Nộp Link Bàn Giao</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
