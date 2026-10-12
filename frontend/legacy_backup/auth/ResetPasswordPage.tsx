import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Thiếu mã token xác thực từ email.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi đặt lại mật khẩu.');
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
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Đặt lại mật khẩu mới</h1>
          <p className="text-xs text-slate-500 mt-1">Nhập mật khẩu mới an toàn cho tài khoản của bạn</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mật khẩu mới *"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Xác nhận mật khẩu *"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" variant="gradient" loading={loading} className="w-full">
            Cập nhật mật khẩu mới
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
