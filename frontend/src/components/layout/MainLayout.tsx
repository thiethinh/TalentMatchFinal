import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

import { UnverifiedBanner } from '../auth/UnverifiedBanner';
import { AuthModal } from '../auth/AuthModal';
import { UnverifiedRestrictionModal } from '../auth/UnverifiedRestrictionModal';
import { UserProfileModal } from '../common/UserProfileModal';
import { WithdrawModal } from '../common/WithdrawModal';
import { VNPayModal } from '../common/VNPayModal';
import { ToastContainer } from '../common/ToastContainer';

interface MainLayoutProps {
  hideSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ hideSidebar = false }) => {
  const { isVNPayModalOpen, vnpayModalParams, closeVNPayModal } = useDemo();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isMarketplace =
    location.pathname === '/jobs' ||
    location.pathname.startsWith('/jobs/') ||
    location.pathname === '/projects' ||
    location.pathname.startsWith('/projects/') ||
    location.pathname === '/freelancers' ||
    location.pathname.startsWith('/freelancers/');

  const shouldHideSidebar = hideSidebar || isHomePage || isMarketplace;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans">
      <UnverifiedBanner />
      <Navbar />

      <div className={`flex-1 flex w-full mx-auto ${isHomePage ? 'max-w-full px-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6'}`}>
        {!shouldHideSidebar && <Sidebar />}
        <main className={`flex-1 overflow-x-hidden min-w-0 ${!shouldHideSidebar ? 'pl-0 md:pl-6' : ''}`}>
          <Outlet />
        </main>
      </div>

      <Footer />

      {/* Global Modals from frontend2 */}
      <ToastContainer />
      <AuthModal />
      <UnverifiedRestrictionModal />
      <UserProfileModal />
      <WithdrawModal />

      {/* Global VNPay Payment Modal */}
      {isVNPayModalOpen && vnpayModalParams && (
        <VNPayModal
          isOpen={isVNPayModalOpen}
          onClose={closeVNPayModal}
          amount={vnpayModalParams.amount}
          orderNumber={vnpayModalParams.orderNumber}
          orderTitle={vnpayModalParams.orderTitle}
          onSuccess={() => {
            vnpayModalParams.onPaymentComplete();
          }}
        />
      )}
    </div>
  );
};
