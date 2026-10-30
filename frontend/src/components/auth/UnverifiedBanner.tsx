import React from 'react';
import { useApp } from '../../context/AppContext';

export const UnverifiedBanner: React.FC = () => {
  const { currentUser, openAuthModal } = useApp();

  if (currentUser.role === 'guest' || currentUser.emailVerified) {
    return null;
  }

  return (
    <div className="bg-amber-600 text-white py-2 px-4 shadow-xs border-b border-amber-700">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <i className="fa-solid fa-triangle-exclamation text-amber-200 text-xs shrink-0" />
          <span>
            <strong>Email chưa được xác thực!</strong> Tài khoản của bạn (<span className="underline">{currentUser.email}</span>) đang bị tạm khóa một số tính năng chính.
          </span>
        </div>
        <button
          onClick={() => openAuthModal('verification')}
          className="px-3 py-1 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-md shadow-2xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-envelope-circle-check text-xs text-amber-700" />
          <span>Xác thực email ngay</span>
        </button>
      </div>
    </div>
  );
};

