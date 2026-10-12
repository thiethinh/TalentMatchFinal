import React from 'react';
import { AlertTriangle, MailCheck, X } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

export const UnverifiedRestrictionModal: React.FC = () => {
  const { isUnverifiedModalOpen, unverifiedBlockedAction, closeUnverifiedModal, openAuthModal } = useDemo();

  if (!isUnverifiedModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={closeUnverifiedModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Email chưa được xác thực</h3>
        
        <p className="text-slate-600 text-center text-sm mb-4">
          Bạn cần xác thực email trước khi thực hiện chức năng <span className="font-semibold text-slate-900">"{unverifiedBlockedAction}"</span>.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-800 space-y-1">
          <div className="font-semibold">⚠️ Thao tác bị hạn chế bảo mật:</div>
          <div>Để đảm bảo uy tín marketplace và bảo vệ giao dịch Escrow, tài khoản chưa kích hoạt email không thể đăng bài, báo giá hoặc nạp tiền.</div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              closeUnverifiedModal();
              openAuthModal('verification');
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MailCheck className="w-5 h-5" />
            <span>[ Xác thực email ngay ]</span>
          </button>

          <button
            onClick={closeUnverifiedModal}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
