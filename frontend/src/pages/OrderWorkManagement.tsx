import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { ReviewModal } from '../components/common/ReviewModal';

export const OrderWorkManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    orders,
    currentUser,
    acceptDelivery,
    requestRevision,
    fileDispute,
    submitReview
  } = useDemo();

  const order = orders.find((o) => o.id === id) || orders[0];

  const [activeTab, setActiveTab] = useState<'timeline' | 'deliveries' | 'chat'>('timeline');
  const [chatInput, setChatInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; isSystem?: boolean }>>([
    {
      sender: 'Hệ thống TalentMatch',
      text: `Hợp đồng ${order.orderNumber} đã nạp tiền 100% vào Ví Tạm Giữ Escrow qua cổng VNPAY thành công. Freelancer hãy tiến hành làm việc theo đúng SOW.`,
      isSystem: true
    },
    {
      sender: order.freelancerName,
      text: 'Chào bạn, mình đã nhận được hợp đồng và đang tiến hành thực hiện đúng tiến độ.'
    }
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    let filteredText = chatInput;
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
    const zaloRegex = /(zalo|facebook|fb\.com|telegram)/gi;

    if (phoneRegex.test(chatInput) || zaloRegex.test(chatInput)) {
      filteredText = chatInput
        .replace(phoneRegex, '[SỐ ĐIỆN THOẠI BỊ ẨN ĐỂ BẢO VỆ GIAO DỊCH]')
        .replace(zaloRegex, '[LINK NGOẠI SÀN BỊ ẨN]');
    }

    setChatMessages((prev) => [...prev, { sender: currentUser.name, text: filteredText }]);
    setChatInput('');
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

      {/* TAB 2: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3.5 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Danh Sách File Đã Bàn Giao</h3>
          {order.deliveries.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Chưa có sản phẩm bàn giao nào.</div>
          ) : (
            <div className="space-y-2.5">
              {order.deliveries.map((del) => (
                <div key={del.id} className="p-3.5 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-semibold text-slate-900">
                      <i className="fa-solid fa-file-lines text-blue-600 text-sm" />
                      <span>{del.fileName}</span>
                      <span className="text-slate-400 text-[10px]">({del.fileSize})</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{del.uploadedAt}</span>
                  </div>
                  <p className="text-slate-600 italic bg-white p-2.5 rounded-md border border-slate-200">
                    "{del.note}"
                  </p>
                  {del.demoUrl && (
                    <a
                      href={del.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                    >
                      <span>Mở link chạy thử demo sản phẩm</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                    </a>
                  )}
                </div>
              ))}
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

          <div className="h-60 overflow-y-auto space-y-2.5 p-3.5 bg-slate-50 rounded-md border border-slate-200">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-md max-w-lg ${
                  msg.isSystem
                    ? 'bg-amber-50 border border-amber-200 text-amber-900 text-[11px] mx-auto text-center'
                    : msg.sender === currentUser.name
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-white border border-slate-200 text-slate-800 mr-auto'
                }`}
              >
                {!msg.isSystem && <div className="font-bold text-[10px] opacity-75 mb-0.5">{msg.sender}</div>}
                <div>{msg.text}</div>
              </div>
            ))}
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

    </div>
  );
};
