import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  Briefcase,
  UserCheck,
  AlertCircle,
  Globe,
  User as UserIcon
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { EmailVerificationScreen } from './EmailVerificationScreen';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    registerUser,
    loginUser,
    loginWithGoogle,
    completeGoogleRegister
  } = useDemo();

  // Tab State
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode === 'register' ? 'register' : 'login');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'freelancer' | 'employer'>('freelancer');

  // Login error state for unverified email
  const [loginError, setLoginError] = useState<{ message: string; isUnverified?: boolean; unverifiedUserEmail?: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const result = loginUser(email, password);
    if (!result.success) {
      if (result.isUnverified) {
        setLoginError({
          message: 'Tài khoản của bạn chưa được xác thực email.',
          isUnverified: true,
          unverifiedUserEmail: email
        });
      } else {
        setLoginError({ message: result.message || 'Đăng nhập không thành công.' });
      }
    } else {
      closeAuthModal();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    registerUser({ name, email, password, role, phone });
  };

  const handleGoogleClick = () => {
    loginWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Verification Screen View */}
        {authModalMode === 'verification' && (
          <EmailVerificationScreen onSuccess={closeAuthModal} inline={true} />
        )}

        {/* Google Role Selection View */}
        {authModalMode === 'google-role' && (
          <div className="py-4 text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Globe className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tạo tài khoản bằng Google</h3>
            <p className="text-slate-600 text-sm mb-6 max-w-xs mx-auto">
              Bạn đang tạo tài khoản TalentMatch bằng Google. Bạn muốn tham gia với vai trò nào?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => completeGoogleRegister('freelancer')}
                className="p-5 border-2 border-slate-200 hover:border-blue-600 rounded-2xl text-left transition-all hover:bg-blue-50/50 group"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-base mb-1">Freelancer (Ứng viên)</div>
                <div className="text-xs text-slate-500">Tìm kiếm dự án và nộp đề xuất báo giá</div>
              </button>

              <button
                type="button"
                onClick={() => completeGoogleRegister('employer')}
                className="p-5 border-2 border-slate-200 hover:border-emerald-600 rounded-2xl text-left transition-all hover:bg-emerald-50/50 group"
              >
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-base mb-1">Employer (Nhà tuyển dụng)</div>
                <div className="text-xs text-slate-500">Đăng bài tuyển dụng & nạp cọc Escrow</div>
              </button>
            </div>
          </div>
        )}

        {/* Normal Login / Register Tabs */}
        {(authModalMode === 'login' || authModalMode === 'register') && (
          <div>
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 font-extrabold text-base border-b-2 transition-all ${
                  activeTab === 'login'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 font-extrabold text-base border-b-2 transition-all ${
                  activeTab === 'register'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Đăng Ký Tài Khoản
              </button>
            </div>

            {/* Google Quick Auth */}
            <button
              onClick={handleGoogleClick}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 mb-4 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google (Tự động xác thực)</span>
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[11px] text-slate-400 font-medium">hoặc dùng email & mật khẩu</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">

                {loginError && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>{loginError.message}</span>
                    </div>
                    {loginError.isUnverified && (
                      <div className="pt-2 border-t border-amber-200/60 space-y-2">
                        <p className="text-amber-800">
                          Tài khoản cần hoàn tất xác thực email để kích hoạt quyền đăng bài và nộp đề xuất báo giá.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openAuthModal('verification')}
                            className="px-3.5 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-xs"
                          >
                            [ Mở Màn Hình Xác Thực Email Ngay ]
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email tài khoản</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vd: ha.le@techstartup.vn"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2"
                >
                  Đăng Nhập TalentMatch
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bạn muốn tham gia với vai trò nào? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`p-3 border-2 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                        role === 'freelancer'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold">Freelancer (Ứng viên)</div>
                        <div className="text-[10px] text-slate-500">Cung cấp dịch vụ</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('employer')}
                      className={`p-3 border-2 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                        role === 'employer'
                          ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold">Employer (Tuyển dụng)</div>
                        <div className="text-[10px] text-slate-500">Đăng tin & Thuê</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email đăng ký</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại (tùy chọn)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  ⚠️ <strong>Lưu ý:</strong> Sau khi nhấn <strong>Tạo tài khoản</strong>, bạn sẽ cần chuyển tới màn hình <strong>Xác thực Email</strong> để hoàn tất kích hoạt.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2"
                >
                  Tạo Tài Khoản TalentMatch
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
