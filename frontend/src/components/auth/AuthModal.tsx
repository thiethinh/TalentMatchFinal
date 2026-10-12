import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  Briefcase,
  UserCheck,
  AlertCircle,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound
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
    registerWithGoogle,
    users
  } = useDemo();

  // Tab State
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    authModalMode === 'register' ? 'register' : 'login'
  );

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'freelancer' | 'employer'>('freelancer');

  // Google Custom Auth State
  const [googleCustomMode, setGoogleCustomMode] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleRoleInput, setGoogleRoleInput] = useState<'freelancer' | 'employer'>('freelancer');
  const [googleOtpSent, setGoogleOtpSent] = useState(false);
  const [googleOtpCode, setGoogleOtpCode] = useState('889922');
  const [enteredOtp, setEnteredOtp] = useState('');

  // Login error state for unverified email
  const [loginError, setLoginError] = useState<{
    message: string;
    isUnverified?: boolean;
    unverifiedUserEmail?: string;
  } | null>(null);

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

  const handleSendGoogleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    setGoogleOtpCode(String(Math.floor(100000 + Math.random() * 900000)));
    setGoogleOtpSent(true);
  };

  const handleConfirmGoogleRegister = () => {
    if (enteredOtp && enteredOtp !== googleOtpCode && enteredOtp !== '123456') {
      alert('Mã OTP xác thực không chính xác! Vui lòng kiểm tra lại.');
      return;
    }
    registerWithGoogle({
      email: googleEmailInput.trim(),
      name: googleNameInput.trim() || googleEmailInput.split('@')[0],
      role: googleRoleInput
    });
  };

  const handleInstantGoogleRegister = () => {
    registerWithGoogle({
      email: googleEmailInput.trim() || 'user.gmail.demo@gmail.com',
      name: googleNameInput.trim() || 'Người Dùng Google Mới',
      role: googleRoleInput
    });
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

        {/* 1. MÀN HÌNH XÁC THỰC EMAIL / GMAIL */}
        {authModalMode === 'verification' && (
          <EmailVerificationScreen onSuccess={closeAuthModal} inline={true} />
        )}

        {/* 2. MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ GOOGLE CHUYÊN NGHIỆP */}
        {(authModalMode === 'google-auth' || authModalMode === 'google-role') && (
          <div className="py-2 text-left">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-200">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác Thực & Đăng Nhập Bằng Google</h3>
                <p className="text-xs text-slate-500">Đăng nhập an toàn qua hệ thống Gmail Workspace</p>
              </div>
            </div>

            {!googleCustomMode ? (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-3">
                  Chọn một tài khoản Google để tiếp tục:
                </p>

                <div className="space-y-2 mb-4">
                  {users
                    .filter((u) => u.email.endsWith('@techstartup.vn') || u.email.endsWith('@gmail.com') || u.email.endsWith('@invest.vn'))
                    .slice(0, 4)
                    .map((sampleUser) => (
                      <button
                        key={sampleUser.id}
                        type="button"
                        onClick={() => loginWithGoogle(sampleUser.email)}
                        className="w-full p-3 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl flex items-center justify-between text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={sampleUser.avatar}
                            alt={sampleUser.name}
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                              {sampleUser.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{sampleUser.email}</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                          {sampleUser.role === 'employer' ? 'Nhà tuyển dụng' : 'Freelancer'}
                        </span>
                      </button>
                    ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleCustomMode(true);
                      setGoogleEmailInput('nguyenvana.dev@gmail.com');
                      setGoogleNameInput('Nguyễn Văn An');
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all text-center"
                  >
                    + Sử dụng địa chỉ Gmail khác
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="py-2.5 px-4 text-slate-500 hover:text-slate-800 font-semibold text-xs rounded-xl"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            ) : (
              /* FORM ĐĂNG KÝ GOOGLE VỚI TÙY CHỌN LOẠI TÀI KHOẢN VÀ XÁC THỰC GMAIL */
              <div className="space-y-4">
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 text-xs text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Vui lòng chọn <strong>Loại tài khoản</strong> và xác thực địa chỉ Gmail của bạn.</span>
                </div>

                {/* OPTION CHỌN LOẠI TÀI KHOẢN */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    1. Chọn loại tài khoản của bạn <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGoogleRoleInput('freelancer')}
                      className={`p-3.5 border-2 rounded-2xl text-left transition-all ${
                        googleRoleInput === 'freelancer'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            googleRoleInput === 'freelancer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Ứng viên
                        </span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900">Freelancer</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tìm việc, nhận dự án & nhận tiền Escrow</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGoogleRoleInput('employer')}
                      className={`p-3.5 border-2 rounded-2xl text-left transition-all ${
                        googleRoleInput === 'employer'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            googleRoleInput === 'employer'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Tuyển dụng
                        </span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900">Employer</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Đăng tuyển, duyệt ứng viên & cọc Escrow</div>
                    </button>
                  </div>
                </div>

                {/* THÔNG TIN GMAIL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ Gmail</label>
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="vd: ten.ban@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                {/* XÁC THỰC GMAIL VỚI MÃ OTP */}
                {!googleOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendGoogleOtp}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Gửi Mã Xác Thực OTP Đến Gmail</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Mã OTP gửi đến: {googleEmailInput}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold rounded-md">
                        OTP: {googleOtpCode}
                      </span>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder={`Nhập mã 6 số (VD: ${googleOtpCode})`}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-blue-400 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmGoogleRegister}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác Thực Gmail & Tạo Tài Khoản Ngay</span>
                    </button>
                  </div>
                )}

                {/* NÚT XÁC THỰC TỨC THÌ (DEMO SHORTCUT) */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleInstantGoogleRegister}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>⚡ Xác thực nhanh (Bỏ qua OTP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleCustomMode(false)}
                    className="py-2 px-3 text-slate-500 hover:text-slate-800 text-xs font-medium"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TABS ĐĂNG NHẬP / ĐĂNG KÝ TIÊU CHUẨN */}
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

            {/* Google Quick Auth Button */}
            <button
              onClick={() => loginWithGoogle()}
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
              <span>Tiếp tục với Google (Xác thực Gmail)</span>
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[11px] text-slate-400 font-medium">
                hoặc dùng email & mật khẩu
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* TAB ĐĂNG NHẬP */}
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

            {/* TAB ĐĂNG KÝ VỚI OPTION CHỌN LOẠI TÀI KHOẢN RÕ RÀNG */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Bạn muốn tham gia với vai trò nào? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`p-3.5 border-2 rounded-2xl text-left transition-all ${
                        role === 'freelancer'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            role === 'freelancer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Ứng viên
                        </span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900">Freelancer</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tìm việc, nhận dự án & nhận thù lao bảo chứng Escrow</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('employer')}
                      className={`p-3.5 border-2 rounded-2xl text-left transition-all ${
                        role === 'employer'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            role === 'employer'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Tuyển dụng
                        </span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900">Employer</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Đăng tin tuyển dụng, chọn nhân sự & nạp cọc an toàn</div>
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
                  ⚠️ <strong>Lưu ý:</strong> Sau khi nhấn <strong>Tạo tài khoản</strong>, bạn sẽ chuyển tới màn hình <strong>Xác thực Email</strong> để hoàn tất kích hoạt.
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

export default AuthModal;
