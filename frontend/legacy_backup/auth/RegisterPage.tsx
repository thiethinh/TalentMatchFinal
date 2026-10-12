import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Role } from '../../types';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>((searchParams.get('role') as Role) || 'FREELANCER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        fullName,
        email,
        password,
        confirmPassword,
        role,
        agreeTerms,
      });
      alert(res.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công.');
    } finally {
      setLoading(false);
    }
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
        <div className="text-center">
          <div className="p-1.5 bg-white rounded-2xl shadow-md border border-slate-200 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
            <img src="/logo_talentMatch.png" alt="TalentMatch" className="w-10 h-10 object-contain rounded-xl" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Tạo tài khoản mới</h1>
          <p className="text-xs text-slate-500 mt-1">Bắt đầu kết nối và làm việc trên TalentMatch</p>
        </div>

        {/* Role Picker */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('FREELANCER')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'FREELANCER'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Tôi là Freelancer
          </button>
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'CUSTOMER'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 Tôi là Doanh nghiệp
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên *"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email tài khoản *"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Mật khẩu *"
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

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-tight">
              Tôi đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật của TalentMatch.
            </label>
          </div>

          <Button type="submit" variant="gradient" loading={loading} className="w-full">
            Đăng ký tài khoản
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
