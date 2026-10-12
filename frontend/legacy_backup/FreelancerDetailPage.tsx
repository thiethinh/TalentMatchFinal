import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { User } from '../types';
import { formatCurrency } from '../utils/format';
import { Star, MapPin, Globe, Mail, Phone, Calendar, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const FreelancerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/freelancers/${id}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs font-semibold text-slate-500">Đang tải hồ sơ Freelancer...</div>;
  }

  if (!profile) {
    return <div className="p-12 text-center text-xs font-semibold text-slate-500">Hồ sơ Freelancer không khả dụng hoặc đã bị ẩn.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 border border-white/20 shadow-md flex items-center justify-center font-black text-2xl text-white">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  profile.fullName.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500 stroke-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{profile.fullName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200/70">
                  <ShieldCheck className="w-3 h-3 text-sky-600" /> Xác thực CCCD / Bank
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">{profile.professionalTitle || profile.field || 'Chuyên gia Freelancer'}</p>

              <div className="flex items-center gap-4 text-xs text-slate-600 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-amber-700 font-extrabold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {profile.rating?.toFixed(1) || '5.0'} / 5.0
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.location}
                  </span>
                )}
                {profile.experienceYears !== undefined && (
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {profile.experienceYears} năm kinh nghiệm
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-left md:text-right flex-shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Đơn giá tiêu chuẩn</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-700 block mt-0.5">
              {profile.hourlyRate ? `${formatCurrency(profile.hourlyRate)}/h` : 'Thương lượng'}
            </span>
            <div className="mt-4 flex items-center md:justify-end gap-2">
              <Link to={`/customer/talent`}>
                <Button variant="primary" size="md">
                  Gửi lời mời dự án
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-4 text-xs leading-relaxed">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Giới thiệu chuyên môn & Năng lực</h2>
            <p className="text-slate-700 whitespace-pre-line font-medium leading-relaxed">
              {profile.bio || 'Chuyên gia chưa cập nhật mô tả chi tiết.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-4 text-xs">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Kỹ năng & Chuyên môn công nghệ</h2>
            {profile.skills ? (
              <div className="flex items-center gap-2 flex-wrap">
                {profile.skills.split(',').map((s, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold rounded-xl border border-slate-200/60 transition-colors">
                    {s.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Chưa khai báo kỹ năng.</p>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3">Thông tin liên hệ & Portfolio</h3>
            {profile.email && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="truncate font-medium">{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium">{profile.phone}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline truncate font-semibold">
                  {profile.website}
                </a>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-400 font-extrabold text-[11px]">
                  <ShieldCheck className="w-4 h-4" /> Bảo lãnh hoàn tất hợp đồng
                </div>
                <p className="text-[11px] text-neutral-300 leading-normal">
                  Ký hợp đồng qua TalentMatch để nhận bảo hộ Escrow, nghiệm thu từng Milestone và hóa đơn VAT.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
