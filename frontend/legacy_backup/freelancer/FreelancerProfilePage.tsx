import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckCircle2, Circle, User as UserIcon } from 'lucide-react';

export const FreelancerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [profileChecks, setProfileChecks] = useState<any[]>([]);
  const [completion, setCompletion] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Form
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [field, setField] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = () => {
    setLoading(true);
    apiClient.get('/freelancer/profile')
      .then((res) => {
        const p: User = res.data.profile;
        setProfile(p);
        setProfileChecks(res.data.profileChecks || []);
        setCompletion(res.data.profileCompletion || 0);

        setFullName(p.fullName || '');
        setProfessionalTitle(p.professionalTitle || '');
        setField(p.field || '');
        setHourlyRate(p.hourlyRate ? p.hourlyRate.toString() : '');
        setExperienceYears(p.experienceYears ? p.experienceYears.toString() : '');
        setLocation(p.location || '');
        setPhone(p.phone || '');
        setWebsite(p.website || '');
        setSkills(p.skills || '');
        setBio(p.bio || '');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/freelancer/profile', {
        fullName,
        professionalTitle,
        field,
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
        experienceYears: experienceYears ? Number(experienceYears) : null,
        location,
        phone,
        website,
        skills,
        bio,
      });
      alert('Cập nhật hồ sơ Freelancer thành công!');
      fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải hồ sơ...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Hồ sơ chuyên môn Freelancer</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Hoàn thiện thông tin để tăng cơ hội nhận lời mời và trúng thầu dự án</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Edit Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-6">
          <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Chỉnh sửa thông tin chuyên môn</h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Họ và tên *"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Chức danh / Vị trí mong muốn"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Ví dụ: Senior UI/UX Designer"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Đơn giá theo giờ (VNĐ)"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="250000"
              />
              <Input
                label="Số năm kinh nghiệm"
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="4"
              />
              <Input
                label="Tỉnh / Thành phố"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Số điện thoại liên hệ"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
              />
              <Input
                label="Website / Portfolio"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myportfolio.com"
              />
            </div>

            <Input
              label="Kỹ năng chính (phân cách bằng dấu phẩy) *"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Figma, React, Tailwind CSS, TypeScript"
            />

            <div>
              <label className="block font-bold text-slate-800 mb-1">Giới thiệu bản thân & Kinh nghiệm *</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tóm tắt quá trình làm việc, thế mạnh và các dự án tiêu biểu..."
                className="w-full p-3.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button type="submit" variant="primary" loading={saving}>
                Lưu hồ sơ chuyên môn
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Checklist */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900">Độ hoàn thiện hồ sơ</span>
                <span className="font-black text-blue-700 text-sm">{completion}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Các mục cần hoàn thiện
              </span>
              {profileChecks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-slate-600">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span className={item.done ? 'text-slate-900 font-semibold' : 'text-slate-400 font-medium'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
