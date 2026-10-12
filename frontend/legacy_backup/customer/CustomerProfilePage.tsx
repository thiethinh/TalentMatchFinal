import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, Save, User as UserIcon, MapPin, Globe } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient
      .get('/customer/profile')
      .then((res) => {
        setProfile(res.data || {});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put('/customer/profile', profile);
      alert(res.data?.message || 'Cập nhật thông tin thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        Đang tải hồ sơ doanh nghiệp...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Hồ sơ Doanh nghiệp</h1>
            <p className="text-xs text-slate-500 mt-0.5">Thông tin công ty và thông tin liên hệ nhà tuyển dụng</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ và tên người đại diện"
            value={profile.fullName || ''}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            required
          />
          <Input
            label="Email tài khoản"
            value={profile.email || ''}
            disabled
            helperText="Email dùng để đăng nhập và nhận thông báo"
          />
          <Input
            label="Tên doanh nghiệp / Đơn vị tuyển dụng"
            value={profile.companyName || ''}
            onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
            placeholder="Ví dụ: Công ty TNHH Giải Pháp Số"
          />
          <Input
            label="Quy mô công ty"
            value={profile.companySize || ''}
            onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
            placeholder="Ví dụ: 10-50 nhân sự"
          />
          <Input
            label="Số điện thoại"
            value={profile.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="0912 345 678"
          />
          <Input
            label="Địa chỉ trụ sở"
            value={profile.location || ''}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            placeholder="Hà Nội / TP. Hồ Chí Minh"
          />
        </div>

        <Input
          label="Website công ty"
          value={profile.website || ''}
          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          placeholder="https://example.com"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Giới thiệu doanh nghiệp / Sứ mệnh
          </label>
          <textarea
            rows={4}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Mô tả ngắn gọn về lĩnh vực hoạt động, văn hóa công ty để thu hút ứng viên tài năng..."
            className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" type="submit" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
};
