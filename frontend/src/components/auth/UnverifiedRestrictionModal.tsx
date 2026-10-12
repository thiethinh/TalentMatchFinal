import React from 'react';
import { useDemo } from '../../context/DemoContext';

export const UnverifiedRestrictionModal: React.FC = () => {
  const { isUnverifiedModalOpen, unverifiedBlockedAction, closeUnverifiedModal, openAuthModal } = useDemo();

  if (!isUnverifiedModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={closeUnverifiedModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-sm" />
        </button>

        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-md flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <i className="fa-solid fa-triangle-exclamation text-xl" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Email chưa được xác thực</h3>
        
        <p className="text-slate-600 text-center text-xs mb-4">
          Bạn cần xác thực email trước khi thực hiện chức năng <span className="font-semibold text-slate-900">"{unverifiedBlockedAction}"</span>.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 mb-6 text-xs text-amber-800 space-y-1">
          <div className="font-semibold">⚠️ Thao tác bị hạn chế bảo mật:</div>
          <div>Để đảm bảo uy tín và bảo vệ giao dịch Escrow, tài khoản chưa kích hoạt email không thể đăng bài, nộp báo giá hoặc nạp tiền.</div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              closeUnverifiedModal();
              openAuthModal('verification');
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <i className="fa-solid fa-envelope-circle-check text-xs" />
            <span>Xác thực email ngay</span>
          </button>

          <button
            onClick={closeUnverifiedModal}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md text-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

