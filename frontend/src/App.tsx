import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import { MainLayout } from './components/layout/MainLayout';

// Full Feature Pages ported from frontend2
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Freelancers } from './pages/Freelancers';
import { CreateProject } from './pages/CreateProject';
import { OrderWorkManagement } from './pages/OrderWorkManagement';
import { KycVerification } from './pages/KycVerification';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public Marketplace */}
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/jobs" element={<Projects />} />
            <Route path="/freelancers" element={<Freelancers />} />

            {/* Actions & Projects */}
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/customer/jobs/new" element={<CreateProject />} />
            <Route path="/orders/:id" element={<OrderWorkManagement />} />
            <Route path="/projects/:id" element={<OrderWorkManagement />} />

            {/* Verification */}
            <Route path="/kyc" element={<KycVerification />} />

            {/* Role Dashboards */}
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/customer/dashboard" element={<EmployerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Backward-compatibility alias routes */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/customer/jobs" element={<Navigate to="/employer/dashboard" replace />} />
            <Route path="/customer/projects" element={<Navigate to="/employer/dashboard" replace />} />
            <Route path="/freelancer/projects" element={<Navigate to="/freelancer/dashboard" replace />} />
            <Route path="/freelancer/applications" element={<Navigate to="/freelancer/dashboard" replace />} />
            <Route path="/freelancer/saved-jobs" element={<Navigate to="/projects" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DemoProvider>
  );
}

export default App;
