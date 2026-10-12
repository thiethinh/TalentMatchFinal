import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DemoProvider, useDemo } from './context/DemoContext';
import { UnverifiedBanner } from './components/auth/UnverifiedBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { UnverifiedRestrictionModal } from './components/auth/UnverifiedRestrictionModal';
import { UserProfileModal } from './components/common/UserProfileModal';
import { WithdrawModal } from './components/common/WithdrawModal';
import { VNPayModal } from './components/common/VNPayModal';

import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Freelancers } from './pages/Freelancers';
import { CreateProject } from './pages/CreateProject';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrderWorkManagement } from './pages/OrderWorkManagement';
import { KycVerification } from './pages/KycVerification';

const AppContent: React.FC = () => {
  const { isVNPayModalOpen, vnpayModalParams, closeVNPayModal } = useDemo();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Real app: No RoleSwitcher at the top */}
      <UnverifiedBanner />
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/kyc" element={<KycVerification />} />
          <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/orders/:id" element={<OrderWorkManagement />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <Footer />
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

export const App: React.FC = () => {
  return (
    <DemoProvider>
      <Router>
        <AppContent />
      </Router>
    </DemoProvider>
  );
};

export default App;
