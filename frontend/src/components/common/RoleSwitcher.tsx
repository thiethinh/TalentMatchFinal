import React from 'react';
import { useDemo } from '../../context/DemoContext';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchRole, switchUserById, users, adminToggleEmailVerified, resetAllDemoData } = useDemo();

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Active User Info */}
        <div className="flex items-center space-x-2 font-medium">
          <span className="flex items-center text-blue-400 font-bold">
            <i className="fa-solid fa-sliders text-xs mr-1.5" /> BỘ CHUYỂN VAI TRÒ:
          </span>
          <span className="text-slate-300">Đang đóng vai:</span>
          <span className="px-2 py-0.5 rounded-md font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {currentUser.name} ({currentUser.role.toUpperCase()})
          </span>

          {/* Verification indicator */}
          {currentUser.role !== 'guest' && (
            <button
              onClick={() => adminToggleEmailVerified(currentUser.id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                currentUser.emailVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
              }`}
              title="Nhấn để đổi nhanh trạng thái Xác thực Email cho user hiện tại"
            >
              {currentUser.emailVerified ? (
                <>
                  <i className="fa-solid fa-circle-check text-emerald-400 text-xs" />
                  <span>Email Đã xác thực</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-circle-exclamation text-amber-400 text-xs" />
                  <span>Email Chưa xác thực</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Quick Account Switcher Dropdown, Reset & Role Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Tài khoản:</span>
          
          <select
            value={currentUser.id}
            onChange={(e) => switchUserById(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — [{u.role.toUpperCase()}] {u.emailVerified ? '✓ Đã xác thực' : '! Chưa xác thực'}
              </option>
            ))}
          </select>

          <div className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => switchRole('freelancer')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                currentUser.role === 'freelancer' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <i className="fa-solid fa-briefcase text-xs" />
              <span>Freelancer</span>
            </button>
            <button
              onClick={() => switchRole('employer')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                currentUser.role === 'employer' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <i className="fa-solid fa-building text-xs" />
              <span>Employer</span>
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                currentUser.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <i className="fa-solid fa-shield-halved text-xs" />
              <span>Admin</span>
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetAllDemoData}
            className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-200 rounded-md transition-all font-medium flex items-center gap-1.5 text-[11px] cursor-pointer"
            title="Khôi phục dữ liệu Demo ban đầu (Xóa các dữ liệu đã tạo trong quá trình test)"
          >
            <i className="fa-solid fa-rotate-left text-rose-400 text-xs" />
            <span className="hidden sm:inline">Khôi phục mẫu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
