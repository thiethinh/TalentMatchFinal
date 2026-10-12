import React from 'react';
import { AlertCircle, MailCheck } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

export const UnverifiedBanner: React.FC = () => {
  const { currentUser, openAuthModal } = useDemo();

  if (currentUser.role === 'guest' || currentUser.emailVerified) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white py-2.5 px-4 shadow-sm border-b border-amber-600/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertCircle className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
          <span>
            <strong>Email chưa được xác thực!</strong> Tài khoản của bạn (<span className="underline">{currentUser.email}</span>) đang bị hạn chế một số tính năng chính.
          </span>
        </div>
        <button
          onClick={() => openAuthModal('verification')}
          className="px-3.5 py-1 bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold rounded-lg shadow-sm transition-all shrink-0 flex items-center gap-1.5"
        >
          <MailCheck className="w-3.5 h-3.5" />
          <span>[ Xác thực email ngay ]</span>
        </button>
      </div>
    </div>
  );
};
