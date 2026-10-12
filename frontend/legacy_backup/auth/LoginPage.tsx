import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Mail, Shield, User, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'CUSTOMER') {
        navigate('/customer/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const fillAccount = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Quay về Trang chủ
      </Link>

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="p-1.5 bg-white rounded-2xl shadow-md border border-slate-200 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
            <img src="/logo_talentMatch.png" alt="TalentMatch" className="w-10 h-10 object-contain rounded-xl" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Đăng nhập TalentMatch</h1>
          <p className="text-xs text-slate-500 mt-1">Truy cập tài khoản làm việc và tuyển dụng của bạn</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email tài khoản"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div>
            <Input
              label="Mật khẩu"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <div className="text-right mt-1.5">
              <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="gradient" loading={loading} className="w-full">
            Đăng nhập
          </Button>
        </form>

        {/* Demo Accounts Quick-Fill Pill */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tài khoản mẫu trải nghiệm nhanh (Mật khẩu: 123456):
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillAccount('admin@talentmatch.com', '123456')}
              className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[11px] font-semibold border border-purple-200 transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillAccount('customer@talentmatch.com', '123456')}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-semibold border border-blue-200 transition-colors"
            >
              🏢 Doanh nghiệp
            </button>
            <button
              type="button"
              onClick={() => fillAccount('freelancer@talentmatch.com', '123456')}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold border border-emerald-200 transition-colors"
            >
              ⚡ Freelancer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};
