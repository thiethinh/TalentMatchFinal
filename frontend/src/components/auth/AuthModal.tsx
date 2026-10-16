import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(
    authModalMode === 'register' ? 'register' : 'login'
  );

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'freelancer' | 'employer'>('freelancer');

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Google Auth State
  const [googleMode, setGoogleMode] = useState<'login' | 'register'>(
    authModalMode === 'register' ? 'register' : 'login'
  );
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleRoleInput, setGoogleRoleInput] = useState<'freelancer' | 'employer'>('freelancer');
  const [googleOtpSent, setGoogleOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<{
    type: 'error' | 'success';
    text: string;
    action?: 'switch-to-register' | 'switch-to-login';
  } | null>(null);

  // Sync mode whenever authModalMode changes
  useEffect(() => {
    if (authModalMode === 'register') {
      setActiveTab('register');
      setGoogleMode('register');
    } else if (authModalMode === 'login') {
      setActiveTab('login');
      setGoogleMode('login');
    }
  }, [authModalMode]);

  // Login error state for unverified email
  const [loginError, setLoginError] = useState<{
    message: string;
    isUnverified?: boolean;
    unverifiedUserEmail?: string;
  } | null>(null);

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    if (!forgotEmail.trim()) {
      setForgotMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ email của bạn.' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      setForgotMessage({
        type: 'success',
        text: data.message || 'Mã OTP 6 số đã được gửi tới email của bạn (nếu email tồn tại).',
      });
      setForgotStep(2);
    } catch {
      setForgotMessage({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    if (forgotPassword !== forgotConfirmPassword) {
      setForgotMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (forgotOtp.trim().length !== 6) {
      setForgotMessage({ type: 'error', text: 'Mã OTP phải có đúng 6 chữ số.' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          password: forgotPassword,
          confirmPassword: forgotConfirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.');
        setActiveTab('login');
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setForgotPassword('');
        setForgotConfirmPassword('');
      } else {
        setForgotMessage({ type: 'error', text: data.message || 'Đặt lại mật khẩu không thành công.' });
      }
    } catch {
      setForgotMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' });
    } finally {
      setForgotLoading(false);
    }
  };

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

  const handleDirectGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGoogleMessage(null);
    if (!googleEmailInput.trim()) {
      setGoogleMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ Gmail của bạn.' });
      return;
    }
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    setGoogleLoading(true);

    try {
      if (googleMode === 'login') {
        // LUỒNG 1: ĐĂNG NHẬP VỚI GOOGLE
        const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (found) {
          loginWithGoogle(cleanEmail);
        } else {
          setGoogleMessage({
            type: 'error',
            text: `Tài khoản với email "${cleanEmail}" chưa tồn tại trên hệ thống.`,
            action: 'switch-to-register',
          });
        }
      } else {
        // LUỒNG 2: ĐĂNG KÝ VỚI GOOGLE
        const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (found) {
          setGoogleMessage({
            type: 'error',
            text: `Email "${cleanEmail}" đã được tạo tài khoản trước đó. Vui lòng chuyển sang Đăng nhập với Google.`,
            action: 'switch-to-login',
          });
        } else {
          const fullName = googleNameInput.trim() || cleanEmail.split('@')[0];
          registerWithGoogle({
            email: cleanEmail,
            name: fullName,
            role: googleRoleInput,
          });
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendGoogleOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGoogleMessage(null);
    if (!googleEmailInput.trim()) {
      setGoogleMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ Gmail để nhận mã xác thực OTP.' });
      return;
    }
    const cleanEmail = googleEmailInput.trim().toLowerCase();

    // Kiểm tra tính hợp lệ theo mục đích trước khi gửi OTP
    if (googleMode === 'login') {
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        setGoogleMessage({
          type: 'error',
          text: `Email "${cleanEmail}" chưa có tài khoản trên hệ thống. Hãy chuyển sang Đăng ký với Google!`,
          action: 'switch-to-register',
        });
        return;
      }
    } else {
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (found) {
        setGoogleMessage({
          type: 'error',
          text: `Email "${cleanEmail}" đã có tài khoản trên TalentMatch. Hãy chuyển sang Đăng nhập với Google!`,
          action: 'switch-to-login',
        });
        return;
      }
    }

    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/send-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: googleNameInput.trim() || cleanEmail.split('@')[0],
          role: googleRoleInput,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGoogleOtpSent(true);
        setGoogleMessage({
          type: 'success',
          text: data.message || `Mã xác thực OTP 6 số đã được gửi tới email ${cleanEmail}. Vui lòng mở hộp thư Gmail để lấy mã!`,
        });
      } else {
        setGoogleMessage({
          type: 'error',
          text: data.message || 'Không thể gửi email OTP. Vui lòng kiểm tra lại cấu hình tài khoản Gmail trong application-mail.properties.',
        });
      }
    } catch {
      setGoogleMessage({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleConfirmGoogleRegister = async () => {
    setGoogleMessage(null);
    const cleanOtp = enteredOtp.trim();
    if (cleanOtp.length !== 6) {
      setGoogleMessage({ type: 'error', text: 'Vui lòng nhập đúng 6 chữ số mã OTP nhận được từ email của bạn.' });
      return;
    }
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    setGoogleLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (googleMode === 'login') {
          loginWithGoogle(cleanEmail);
        } else {
          registerWithGoogle({
            email: cleanEmail,
            name: googleNameInput.trim() || cleanEmail.split('@')[0],
            role: googleRoleInput,
          });
        }
      } else {
        setGoogleMessage({
          type: 'error',
          text: data.message || 'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại!',
        });
      }
    } catch {
      if (googleMode === 'login') {
        loginWithGoogle(cleanEmail);
      } else {
        registerWithGoogle({
          email: cleanEmail,
          name: googleNameInput.trim() || cleanEmail.split('@')[0],
          role: googleRoleInput,
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-slate-200 relative my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-base" />
        </button>

        {/* 1. MÀN HÌNH XÁC THỰC EMAIL / GMAIL */}
        {authModalMode === 'verification' && (
          <EmailVerificationScreen onSuccess={closeAuthModal} inline={true} />
        )}

        {/* 2. MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ GOOGLE TRỰC TIẾP */}
        {(authModalMode === 'google-auth' || authModalMode === 'google-role') && (
          <div className="py-2 text-left space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center border border-slate-200 shadow-2xs shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <h3 className="text-base font-bold text-slate-900">
                  {googleMode === 'login' ? 'Đăng Nhập Với Google' : 'Đăng Ký Với Google'}
                </h3>
                <p className="text-xs text-slate-500">
                  {googleMode === 'login'
                    ? 'Đăng nhập nhanh chóng và bảo mật bằng tài khoản Google'
                    : 'Tạo tài khoản mới và kích hoạt tự động với email Google của bạn'}
                </p>
              </div>
            </div>

            {googleMessage && (
              <div
                className={`p-3 rounded-md text-xs space-y-2 ${
                  googleMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <i
                    className={`fa-solid shrink-0 text-sm ${
                      googleMessage.type === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-rose-600'
                    }`}
                  />
                  <span>{googleMessage.text}</span>
                </div>
                {googleMessage.action === 'switch-to-register' && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleMode('register');
                        setGoogleMessage(null);
                        setGoogleOtpSent(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-all cursor-pointer shadow-2xs"
                    >
                      &rarr; Chuyển sang Đăng ký với Google
                    </button>
                  </div>
                )}
                {googleMessage.action === 'switch-to-login' && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleMode('login');
                        setGoogleMessage(null);
                        setGoogleOtpSent(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-all cursor-pointer shadow-2xs"
                    >
                      &rarr; Chuyển sang Đăng nhập với Google
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CHỌN LOẠI VAI TRÒ - CHỈ HIỂN THỊ KHI ĐĂNG KÝ */}
            {googleMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  1. Chọn vai trò tài khoản:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGoogleRoleInput('freelancer')}
                    className={`p-3 border-2 rounded-md text-left transition-all cursor-pointer ${
                      googleRoleInput === 'freelancer'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          googleRoleInput === 'freelancer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <i className="fa-solid fa-user-check text-xs" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                        Ứng viên
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">Freelancer</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tìm việc & nhận dự án</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoogleRoleInput('employer')}
                    className={`p-3 border-2 rounded-md text-left transition-all cursor-pointer ${
                      googleRoleInput === 'employer'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          googleRoleInput === 'employer'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <i className="fa-solid fa-briefcase text-xs" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Tuyển dụng
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">Nhà Tuyển Dụng</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Đăng tuyển & quản lý job</div>
                  </button>
                </div>
              </div>
            )}

            {/* FORM THÔNG TIN GMAIL */}
            <form onSubmit={handleDirectGoogleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {googleMode === 'register' ? '2. Địa chỉ Gmail cá nhân' : 'Địa chỉ Gmail của bạn'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <i className="fa-solid fa-envelope text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="vd: yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              {googleMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Họ và tên hiển thị
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-user text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                    <input
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder="vd: Nguyễn Văn A (tự động theo email nếu để trống)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              )}

              {/* NÚT HÀNH ĐỘNG CHÍNH */}
              <button
                type="submit"
                disabled={googleLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#fff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#fff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#fff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {googleLoading
                    ? 'Đang kết nối...'
                    : googleMode === 'login'
                    ? 'Đăng Nhập Với Google'
                    : 'Đăng Ký Tài Khoản Với Google'}
                </span>
              </button>
            </form>

            {/* XÁC THỰC BẰNG MÃ OTP TỚI HỘP THƯ GMAIL */}
            <div className="pt-2 border-t border-slate-100">
              {!googleOtpSent ? (
                <button
                  type="button"
                  onClick={handleSendGoogleOtp}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs text-blue-600" />
                  <span>
                    {googleMode === 'login'
                      ? 'Hoặc gửi mã OTP về Gmail để đăng nhập không cần mật khẩu'
                      : 'Hoặc gửi mã OTP về Gmail để xác thực hộp thư thực tế'}
                  </span>
                </button>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Mã xác thực gửi tới: {googleEmailInput}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Kiểm tra hộp thư đến hoặc Spam</span>
                  </div>

                  <div className="relative">
                    <i className="fa-solid fa-key text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập mã OTP 6 số từ Gmail..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-blue-400 rounded-md text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmGoogleRegister}
                    disabled={googleLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <i className="fa-solid fa-circle-check text-xs" />
                    <span>
                      {googleLoading
                        ? 'Đang xác thực...'
                        : googleMode === 'login'
                        ? 'Xác Thực Mã OTP & Đăng Nhập'
                        : 'Xác Thực Mã OTP & Đăng Ký Tài Khoản'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* CHUYỂN ĐỔI GIỮA ĐĂNG NHẬP VÀ ĐĂNG KÝ VỚI GOOGLE */}
            <div className="text-center pt-1">
              {googleMode === 'login' ? (
                <p className="text-xs text-slate-500">
                  Chưa có tài khoản TalentMatch?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleMode('register');
                      setGoogleMessage(null);
                      setGoogleOtpSent(false);
                      setEnteredOtp('');
                    }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Đăng ký với Google
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Đã có tài khoản TalentMatch?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleMode('login');
                      setGoogleMessage(null);
                      setGoogleOtpSent(false);
                      setEnteredOtp('');
                    }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Đăng nhập với Google
                  </button>
                </p>
              )}
            </div>

            {/* QUAY LẠI MÀN HÌNH CHÍNH */}
            <div className="flex items-center justify-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setGoogleMessage(null);
                  setGoogleOtpSent(false);
                  setEnteredOtp('');
                  openAuthModal(googleMode === 'login' ? 'login' : 'register');
                }}
                className="py-1 px-3 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer hover:bg-slate-100 rounded-md transition-all"
              >
                {googleMode === 'login' ? '← Quay lại đăng nhập bằng mật khẩu' : '← Quay lại đăng ký thông thường'}
              </button>
            </div>
          </div>
        )}

        {/* 3. TABS ĐĂNG NHẬP / ĐĂNG KÝ TIÊU CHUẨN */}
        {(authModalMode === 'login' || authModalMode === 'register') && (
          <div>
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setGoogleMode('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-3 font-bold text-base border-b-2 transition-all ${
                  activeTab === 'login'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setGoogleMode('register');
                  setLoginError(null);
                }}
                className={`flex-1 py-3 font-bold text-base border-b-2 transition-all ${
                  activeTab === 'register'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Đăng Ký Tài Khoản
              </button>
            </div>

            {/* Google Quick Auth Button (Tùy biến theo Tab Đăng Nhập / Đăng Ký) */}
            <button
              type="button"
              onClick={() => {
                const targetMode = activeTab === 'register' ? 'register' : 'login';
                setGoogleMode(targetMode);
                setGoogleMessage(null);
                setGoogleOtpSent(false);
                setEnteredOtp('');
                if (email.trim()) {
                  setGoogleEmailInput(email.trim());
                }
                if (targetMode === 'register') {
                  if (name.trim()) setGoogleNameInput(name.trim());
                  setGoogleRoleInput(role);
                }
                loginWithGoogle();
              }}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-md text-xs transition-all flex items-center justify-center gap-2 mb-4 shadow-2xs cursor-pointer"
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
              <span>{activeTab === 'login' ? 'Đăng nhập với Google' : 'Đăng ký với Google'}</span>
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
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {loginError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                      <i className="fa-solid fa-circle-exclamation text-amber-600 text-sm shrink-0" />
                      <span>{loginError.message}</span>
                    </div>
                    {loginError.isUnverified && (
                      <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                        <p className="text-amber-800 text-[11px]">
                          Tài khoản cần hoàn tất xác thực email để kích hoạt quyền đăng bài và nộp đề xuất báo giá.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openAuthModal('verification')}
                            className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-md hover:bg-blue-700 shadow-2xs cursor-pointer"
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
                    <i className="fa-solid fa-envelope text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vd: ha.le@techstartup.vn"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setForgotEmail(email);
                      setForgotStep(1);
                      setForgotMessage(null);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-all mt-1 cursor-pointer"
                >
                  Đăng Nhập TalentMatch
                </button>
              </form>
            )}

            {/* TAB ĐĂNG KÝ VỚI OPTION CHỌN LOẠI TÀI KHOẢN RÕ RÀNG */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Bạn muốn tham gia với vai trò nào? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`p-3 border-2 rounded-md text-left transition-all cursor-pointer ${
                        role === 'freelancer'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            role === 'freelancer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <i className="fa-solid fa-user-check text-xs" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                          Ứng viên
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900">Freelancer</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tìm việc, nhận dự án & nhận thù lao Escrow</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('employer')}
                      className={`p-3 border-2 rounded-md text-left transition-all cursor-pointer ${
                        role === 'employer'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            role === 'employer'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <i className="fa-solid fa-briefcase text-xs" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          Tuyển dụng
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900">Nhà Tuyển Dụng</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Đăng tin tuyển dụng & chọn nhân sự</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <i className="fa-solid fa-user text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email đăng ký</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại (tùy chọn)</label>
                  <div className="relative">
                    <i className="fa-solid fa-phone text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600"
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600"
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  <i className="fa-solid fa-circle-info text-blue-500 mr-1" />
                  <span>Sau khi nhấn <strong>Tạo tài khoản</strong>, hệ thống sẽ mở màn hình <strong>Xác thực Email</strong> để kích hoạt.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-all mt-2 cursor-pointer"
                >
                  Tạo Tài Khoản TalentMatch
                </button>
              </form>
            )}

            {/* TAB QUÊN MẬT KHẨU (FORGOT PASSWORD) */}
            {activeTab === 'forgot' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {forgotStep}
                    </div>
                    <span className="font-bold text-slate-800 text-sm">
                      {forgotStep === 1 ? 'Bước 1: Gửi mã OTP xác nhận' : 'Bước 2: Đặt lại mật khẩu mới'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setForgotStep(1);
                      setForgotMessage(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    &larr; Quay lại
                  </button>
                </div>

                {forgotMessage && (
                  <div
                    className={`p-3 rounded-md text-xs ${
                      forgotMessage.type === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        forgotMessage.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'
                      } mr-1.5`}
                    />
                    {forgotMessage.text}
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleSendForgotOtp} className="space-y-3.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Nhập địa chỉ email đăng ký của bạn. Hệ thống sẽ gửi mã OTP 6 chữ số để xác thực yêu cầu đặt lại mật khẩu.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email tài khoản</label>
                      <div className="relative">
                        <i className="fa-solid fa-envelope text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="example@gmail.com"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <i className="fa-solid fa-circle-notch animate-spin text-xs" />
                      ) : (
                        <i className="fa-solid fa-paper-plane text-xs" />
                      )}
                      <span>Gửi Mã OTP Đặt Lại Mật Khẩu</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Đã gửi mã đến <strong>{forgotEmail}</strong>. Vui lòng nhập mã OTP 6 số và mật khẩu mới:
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mã OTP (6 chữ số)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="······"
                        className="w-full text-center text-xl font-bold tracking-[6px] py-2 bg-slate-50 border border-blue-400 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới (tối thiểu 8 ký tự)</label>
                      <input
                        type="password"
                        value={forgotPassword}
                        onChange={(e) => setForgotPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <i className="fa-solid fa-circle-notch animate-spin text-xs" />
                      ) : (
                        <i className="fa-solid fa-check text-xs" />
                      )}
                      <span>Lưu Mật Khẩu Mới & Đăng Nhập</span>
                    </button>

                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        className="text-slate-500 hover:underline cursor-pointer"
                      >
                        Gửi lại mã OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        Quay lại Đăng nhập
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
