import React, { useState, useEffect } from 'react';
import { useDemo } from '../../context/DemoContext';

interface EmailVerificationScreenProps {
  onSuccess?: () => void;
  inline?: boolean;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ onSuccess, inline = false }) => {
  const { currentUser, verifyEmail, resendVerificationEmail, changeVerificationEmail } = useDemo();
  const [cooldown, setCooldown] = useState<number>(0);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState(currentUser.email);
  const [otpInput, setOtpInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanOtp = otpInput.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, otp: cleanOtp }),
      });

      if (response.ok) {
        verifyEmail(currentUser.id);
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json().catch(() => ({}));
        // Hỗ trợ mã test demo nếu server chưa bật SMTP
        if (cleanOtp === '123456' || cleanOtp === '889922') {
          verifyEmail(currentUser.id);
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(data.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        }
      }
    } catch {
      if (cleanOtp === '123456' || cleanOtp === '889922') {
        verifyEmail(currentUser.id);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(60);
    setErrorMessage('');
    setSuccessNotice('Đang gửi lại mã xác thực mới...');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      });
      const data = await response.json().catch(() => ({}));
      setSuccessNotice(data.message || 'Đã gửi lại mã OTP mới về email của bạn!');
    } catch {
      setSuccessNotice('Đã yêu cầu gửi lại mã (chế độ dự phòng)!');
    }
    resendVerificationEmail(currentUser.email);
  };

  const handleVerifyNow = () => {
    verifyEmail(currentUser.id);
    if (onSuccess) onSuccess();
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput || newEmailInput === currentUser.email) {
      setIsEditingEmail(false);
      return;
    }
    changeVerificationEmail(newEmailInput);
    setIsEditingEmail(false);
  };

  if (currentUser.emailVerified) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-circle-check text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Email đã được xác thực</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto text-xs leading-relaxed">
          Tài khoản TalentMatch của bạn (<span className="font-semibold text-slate-800">{currentUser.email}</span>) đã được kích hoạt thành công. Bạn đã có toàn quyền truy cập nền tảng.
        </p>
        {onSuccess && (
          <button
            onClick={onSuccess}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer text-xs"
          >
            <span>Tiếp tục trải nghiệm</span>
            <i className="fa-solid fa-arrow-right text-xs" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${inline ? '' : 'p-6 bg-white rounded-xl shadow-lg border border-slate-100'}`}>
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mx-auto mb-4 border border-blue-100">
        <i className="fa-solid fa-envelope-circle-check text-xl" />
      </div>

      <h2 className="text-xl font-bold text-center text-slate-900 mb-1">Xác thực tài khoản Gmail</h2>
      <p className="text-center text-slate-500 text-xs mb-4">
        Mã xác nhận 6 số đã được gửi đến hộp thư:
      </p>

      {/* Target Email Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-5 flex items-center justify-between">
        {isEditingEmail ? (
          <form onSubmit={handleSaveEmail} className="flex items-center gap-2 w-full">
            <input
              type="email"
              value={newEmailInput}
              onChange={(e) => setNewEmailInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-blue-400 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Lưu
            </button>
          </form>
        ) : (
          <>
            <span className="font-semibold text-slate-800 text-xs truncate">{currentUser.email}</span>
            <button
              onClick={() => {
                setNewEmailInput(currentUser.email);
                setIsEditingEmail(true);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 hover:underline ml-2 cursor-pointer"
            >
              <i className="fa-solid fa-pen-to-square text-[11px]" />
              <span>Đổi email</span>
            </button>
          </>
        )}
      </div>

      {/* Thông báo trạng thái */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-2.5 text-xs mb-4 text-center">
          <i className="fa-solid fa-triangle-exclamation mr-1.5" />
          {errorMessage}
        </div>
      )}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md p-2.5 text-xs mb-4 text-center">
          <i className="fa-solid fa-circle-check mr-1.5" />
          {successNotice}
        </div>
      )}

      {/* FORM NHẬP MÃ OTP 6 SỐ */}
      <form onSubmit={handleVerifyOtp} className="mb-5">
        <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
          Nhập mã OTP (6 chữ số) từ email:
        </label>
        <div className="flex justify-center mb-3">
          <input
            type="text"
            maxLength={6}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
            placeholder="······"
            className="w-56 text-center text-2xl font-bold tracking-[8px] py-2 px-3 border-2 border-blue-400 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 placeholder-slate-300"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || otpInput.trim().length !== 6}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
        >
          {isSubmitting ? (
            <i className="fa-solid fa-circle-notch animate-spin text-xs" />
          ) : (
            <i className="fa-solid fa-shield-halved text-xs" />
          )}
          <span>Xác nhận mã OTP</span>
        </button>
      </form>

      {/* Action Gửi lại & Nút phụ */}
      <div className="space-y-2 mb-5">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`w-full py-2 font-bold rounded-md border transition-all flex items-center justify-center gap-2 text-xs cursor-pointer ${
            cooldown > 0
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <i className={`fa-solid fa-rotate-right text-xs ${cooldown > 0 ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : 'Gửi lại mã OTP'}</span>
        </button>

        <button
          type="button"
          onClick={handleVerifyNow}
          className="w-full py-1.5 text-slate-500 hover:text-slate-800 font-medium text-[11px] hover:underline cursor-pointer"
        >
          ⚡ Kích hoạt nhanh ngay (Chế độ Demo)
        </button>
      </div>

      {/* Hướng dẫn khắc phục */}
      <div className="bg-slate-50 rounded-md p-3 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <i className="fa-solid fa-circle-info text-blue-500 text-xs" />
          <span>Lưu ý khi xác thực email:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
          <li>Kiểm tra cả thư mục <strong>Spam / Thư rác</strong> hoặc tab Quảng cáo.</li>
          <li>Mã OTP có hiệu lực trong <strong>15 phút</strong>.</li>
          <li>Nếu đang chạy test local chưa bật SMTP: Bạn có thể xem mã OTP được log trực tiếp tại terminal Backend hoặc nhập <strong>123456</strong>.</li>
        </ul>
      </div>
    </div>
  );
};
