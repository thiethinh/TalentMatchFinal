import React, { useState } from 'react';
import { MarketSidebar } from './MarketSidebar';
import { MarketTopbar } from './MarketTopbar';
import { Footer } from './Footer';
import { useDemo } from '../../context/DemoContext';

interface MarketLayoutProps {
  children: React.ReactNode;
}

export const MarketLayout: React.FC<MarketLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { currentUser, openAuthModal, openUserProfileModal } = useDemo();
  const isEmailVerified = currentUser.role === 'guest' || Boolean(currentUser.emailVerified);

  return (
    <div className="min-h-screen bg-[#f3f4fa] text-[#111426] flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* 1. Left Fixed Sidebar */}
      <MarketSidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout Area (Offset by 256px on lg screens) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        
        {/* Unverified Email Warning Banner */}
        {currentUser.role !== 'guest' && !isEmailVerified && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold sticky top-0 z-40 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <i className="fa-solid fa-triangle-exclamation text-sm shrink-0" />
              <span className="truncate">
                Tài khoản ({currentUser.email}) chưa xác thực email. Vui lòng xác thực để mở khóa toàn bộ quyền đăng tin và ứng tuyển.
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal?.('register')}
              className="underline hover:text-white text-xs shrink-0 cursor-pointer font-bold"
            >
              Nhập mã OTP
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
