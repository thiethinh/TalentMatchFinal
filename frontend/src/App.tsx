import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { MarketLayout } from './components/layout/MarketLayout';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { UnverifiedRestrictionModal } from './components/auth/UnverifiedRestrictionModal';
import { UserProfileModal } from './components/common/UserProfileModal';
import { WithdrawModal } from './components/common/WithdrawModal';
import { VNPayModal } from './components/common/VNPayModal';

import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { JobDetail } from './pages/JobDetail';
import { SavedJobs } from './pages/SavedJobs';
import { Freelancers } from './pages/Freelancers';
import { CreateProject } from './pages/CreateProject';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminTransactions } from './pages/admin/AdminTransactions';
import { AdminDisputes } from './pages/admin/AdminDisputes';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminSettings } from './pages/admin/AdminSettings';
import { Contracts } from './pages/Contracts';
import { OrderWorkManagement } from './pages/OrderWorkManagement';
import { KycVerification } from './pages/KycVerification';

const AppContent: React.FC = () => {
  const { isVNPayModalOpen, vnpayModalParams, closeVNPayModal } = useApp();

  return (
    <MarketLayout>
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<Home />} />
        
        {/* Jobs / Projects Routes (Supports both paths) */}
        <Route path="/jobs" element={<Projects />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/projects/:id" element={<JobDetail />} />

        {/* Saved Jobs Dedicated Page */}
        <Route path="/saved-jobs" element={<SavedJobs />} />
        
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/kyc" element={<KycVerification />} />

        {/* Role Dashboards */}
        <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/customer/dashboard" element={<Navigate to="/employer/dashboard" replace />} />
        
        {/* Admin Dedicated Route Pages */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/disputes" element={<AdminDisputes />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Contract & Escrow Order LifeCycle */}
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/orders" element={<Contracts />} />
        <Route path="/orders/:id" element={<OrderWorkManagement />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals */}
      <ToastContainer />
      <AuthModal />
      <UnverifiedRestrictionModal />
      <UserProfileModal />
      <WithdrawModal />

      {/* Global VNPay Modal Simulation */}
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
    </MarketLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
