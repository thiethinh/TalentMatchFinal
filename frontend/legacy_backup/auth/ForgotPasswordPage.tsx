import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.');
    } catch {
      setMessage('Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Đăng nhập
      </Link>

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md mx-auto mb-3">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Khôi phục mật khẩu</h1>
          <p className="text-xs text-slate-500 mt-1">Nhập email tài khoản để nhận liên kết xác thực</p>
        </div>

        {message && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email tài khoản *"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Button type="submit" variant="gradient" loading={loading} className="w-full">
            Gửi yêu cầu khôi phục
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
