import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Edit3, ArrowRight, ShieldCheck } from 'lucide-react';
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

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0) return;
    resendVerificationEmail(currentUser.email);
    setCooldown(30);
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
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">✓ Email đã được xác thực</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Tài khoản TalentMatch của bạn (<span className="font-semibold text-slate-800">{currentUser.email}</span>) đã được kích hoạt thành công. Bạn đã có toàn quyền truy cập nền tảng.
        </p>
        {onSuccess && (
          <button
            onClick={onSuccess}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>Tiếp tục trải nghiệm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${inline ? '' : 'p-6 bg-white rounded-2xl shadow-xl border border-slate-100'}`}>
      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
        <Mail className="w-7 h-7" />
      </div>

      <h2 className="text-2xl font-bold text-center text-slate-900 mb-1">Xác thực email</h2>
      <p className="text-center text-slate-500 text-sm mb-6">
        Chúng tôi đã gửi liên kết xác thực đến địa chỉ:
      </p>

      {/* Target Email Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 flex items-center justify-between">
        {isEditingEmail ? (
          <form onSubmit={handleSaveEmail} className="flex items-center gap-2 w-full">
            <input
              type="email"
              value={newEmailInput}
              onChange={(e) => setNewEmailInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </form>
        ) : (
          <>
            <span className="font-semibold text-slate-800 text-sm truncate">{currentUser.email}</span>
            <button
              onClick={() => {
                setNewEmailInput(currentUser.email);
                setIsEditingEmail(true);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline ml-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Thay đổi email</span>
            </button>
          </>
        )}
      </div>

      <p className="text-slate-600 text-sm text-center mb-6">
        Vui lòng kiểm tra hộp thư và nhấn vào liên kết xác thực để kích hoạt tài khoản TalentMatch.
      </p>

      {/* Primary Actions */}
      <div className="space-y-3 mb-6">
        {/* Demo instant verification action */}
        <button
          onClick={handleVerifyNow}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>[ Tôi đã xác thực ] (Giả lập Demo)</span>
        </button>

        {/* Resend button with cooldown */}
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`w-full py-2.5 font-medium rounded-xl border transition-all flex items-center justify-center gap-2 text-sm ${
            cooldown > 0
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${cooldown > 0 ? 'animate-spin' : ''}`} />
          {cooldown > 0 ? `Gửi lại sau ${cooldown} giây` : 'Gửi lại email xác thực'}
        </button>
      </div>

      {/* Demo notice tag */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-6 text-center text-xs text-amber-800">
        <span className="font-semibold">⚡ Chế độ Demo:</span> Nút <strong>[ Tôi đã xác thực ]</strong> mô phỏng thao tác kích hoạt email tức thì mà không cần server gửi mail thật.
      </div>

      {/* Troubleshooting guide */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          <span>Không nhận được email?</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
          <li>Kiểm tra kỹ thư mục <strong>Spam / Thư rác</strong> hoặc Promo.</li>
          <li>Đảm bảo địa chỉ email trên là đúng chính tả.</li>
          <li>Thử nhấn <strong>Gửi lại email</strong> sau khi hết thời gian đếm ngược.</li>
        </ul>
      </div>
    </div>
  );
};
