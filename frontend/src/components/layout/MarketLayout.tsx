import React, { useState } from 'react';
import { MarketSidebar } from './MarketSidebar';
import { MarketTopbar } from './MarketTopbar';
import { Footer } from './Footer';
import { useApp } from '../../context/AppContext';

interface MarketLayoutProps {
  children: React.ReactNode;
}

export const MarketLayout: React.FC<MarketLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { currentUser, openAuthModal, openUserProfileModal } = useApp();
  const isEmailVerified = currentUser.role === 'guest' || Boolean(currentUser.emailVerified);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans antialiased selection:bg-[#2563EB] selection:text-white">
      {/* 1. Left Fixed Sidebar */}
      <MarketSidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout Area (Offset by 256px on lg screens) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        
        {/* Unverified Email Warning Banner */}
        {currentUser.role !== 'guest' && !isEmailVerified && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 text-xs font-semibold sticky top-0 z-40 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 truncate">
              <i className="fa-solid fa-triangle-exclamation text-base shrink-0 text-amber-200 animate-pulse" />
              <span className="truncate">
                Tài khoản (<strong className="font-mono">{currentUser.email}</strong>) chưa được xác thực email. Vui lòng xác thực mã OTP để mở khóa đầy đủ tính năng!
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal?.('verification')}
              className="px-3.5 py-1 bg-amber-950 hover:bg-black text-white rounded-md text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <i className="fa-solid fa-shield-check text-xs text-amber-400" />
              <span>Xác thực OTP ngay</span>
            </button>
          </div>
        )}

        {/* Topbar */}
        <MarketTopbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAuthModal={(tab) => openAuthModal?.(tab)}
          onOpenUserProfileModal={() => openUserProfileModal?.()}
        />

        {/* Page Content Body */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};
