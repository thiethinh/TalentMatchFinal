import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Lock,
  ExternalLink,
  Award,
  Star,
  Briefcase,
  LogOut,
  Calendar,
  Clock,
  CreditCard,
  Plus,
  Trash2,
  Building,
  ChevronDown,
  FileCheck2,
  Camera,
  Upload,
  Sparkles
} from 'lucide-react';

const VIETNAM_BANKS = [
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)', shortName: 'Vietcombank', logo: '🏛️' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)', shortName: 'Techcombank', logo: '🔴' },
  { id: 'MBB', name: 'MB Bank (Quân Đội)', shortName: 'MB Bank', logo: '⭐' },
  { id: 'CTG', name: 'VietinBank (Công Thương Việt Nam)', shortName: 'VietinBank', logo: '🔷' },
  { id: 'BIDV', name: 'BIDV (Đầu Tư và Phát Triển)', shortName: 'BIDV', logo: '🟢' },
  { id: 'ACB', name: 'ACB (Á Châu)', shortName: 'ACB', logo: '🔵' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', shortName: 'VPBank', logo: '🍀' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)', shortName: 'TPBank', logo: '🟣' }
];

export const UserProfileModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isUserProfileModalOpen,
    closeUserProfileModal,
    openWithdrawModal,
    verifyEmail,
    submitKyc,
    addBankAccount,
    removeBankAccount,
    logout,
    freelancers,
    projects,
    orders
  } = useDemo();

  const [showAddBank, setShowAddBank] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState(VIETNAM_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(currentUser.name.toUpperCase());

  // eKYC State
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycFullName, setKycFullName] = useState(currentUser.name);
  const [kycIdNumber, setKycIdNumber] = useState('001202008899');
  const [kycCompanyName, setKycCompanyName] = useState(currentUser.companyName || 'Công ty TNHH Công Nghệ & Dịch Vụ Số');
  const [kycTaxCode, setKycTaxCode] = useState(currentUser.taxCode || '0109887766');
  const [isVerifyingKyc, setIsVerifyingKyc] = useState(false);

  if (!isUserProfileModalOpen) return null;

  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;

    const matchedBank = VIETNAM_BANKS.find((b) => b.name === selectedBankName) || VIETNAM_BANKS[0];
    addBankAccount({
      bankName: matchedBank.name,
      bankCode: matchedBank.id,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim().toUpperCase(),
      isDefault: (currentUser.bankAccounts || []).length === 0
    });

    setAccountNumber('');
    setShowAddBank(false);
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingKyc(true);
    setTimeout(() => {
      submitKyc({
        idNumber: kycIdNumber,
        fullName: kycFullName,
        companyName: currentUser.role === 'employer' ? kycCompanyName : undefined,
        taxCode: currentUser.role === 'employer' ? kycTaxCode : undefined
      });
      setIsVerifyingKyc(false);
      setShowKycForm(false);
    }, 1200);
  };

  // Find matching freelancer profile if user is freelancer
  const freelancerProfile = freelancers.find(
    (f) => f.userId === currentUser.id || f.name === currentUser.name
  );

  // Count employer stats
  const postedProjectsCount = projects.filter((p) => p.employerId === currentUser.id || p.employerName === currentUser.name).length;
  const activeOrdersCount = orders.filter((o) => (o.employerId === currentUser.id || o.freelancerId === currentUser.id) && o.status === 'ORDER_IN_PROGRESS').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 relative my-8 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 h-32 px-6 pt-5 text-white shrink-0">
          <button
            onClick={closeUserProfileModal}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs text-blue-200 font-semibold tracking-wide uppercase">
            <UserIcon className="w-4 h-4" />
            <span>Hồ Sơ Tài Khoản Cá Nhân</span>
          </div>
        </div>

        {/* Profile Card Header with Avatar */}
        <div className="px-6 sm:px-8 -mt-12 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg bg-white ring-2 ring-slate-200"
                />
                {currentUser.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full ring-2 ring-white" title="Đã xác thực eKYC">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser.name}</h2>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                    currentUser.role === 'employer'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : currentUser.role === 'freelancer'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    {currentUser.role === 'employer' ? 'Nhà Tuyển Dụng' : currentUser.role === 'freelancer' ? 'Freelancer' : currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Khách'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {currentUser.id}</div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2">
              {currentUser.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Email Đã Xác Thực</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Chưa Xác Thực Email</span>
                  </span>
                  <button
                    onClick={() => {
                      verifyEmail(currentUser.id);
                    }}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Xác thực ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Financial Wallet Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Số dư khả dụng trong ví</div>
                  <div className="text-base sm:text-lg font-black text-emerald-700">
                    {(currentUser.balance || 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  closeUserProfileModal();
                  openWithdrawModal();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              >
                Rút tiền
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Tiền phong tỏa Escrow VNPAY</div>
                <div className="text-base sm:text-lg font-black text-blue-700">
                  {(currentUser.escrowBalance || 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Account Security Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Thông Tin Liên Hệ & Định Danh</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Email:</span>
                <span className="font-bold text-slate-900">{currentUser.email || 'Chưa cập nhật'}</span>
              </div>

              <div className="flex items-center space-x-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Số điện thoại:</span>
                <span className="font-bold text-slate-900">{currentUser.phone || '0901234567 (Mặc định)'}</span>
              </div>

              <div className="flex items-center space-x-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Ngày tham gia:</span>
                <span className="font-bold text-slate-900">{currentUser.createdAt || '2026-01-15'}</span>
              </div>

              <div className="flex items-center space-x-2 text-slate-700">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Đăng nhập cuối:</span>
                <span className="font-bold text-slate-900">{currentUser.lastLogin || 'Vừa truy cập'}</span>
              </div>
            </div>
          </div>

          {/* eKYC Identity & Business Verification Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>
                  {currentUser.role === 'employer'
                    ? 'Xác Minh Doanh Nghiệp eKYC (Pháp Nhân & MST)'
                    : 'Xác Minh Danh Tính eKYC (CCCD Gắn Chip)'}
                </span>
              </h3>

              {currentUser.isVerified ? (
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã Xác Minh Chính Chủ</span>
                </span>
              ) : (
                <span className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chưa Xác Minh</span>
                </span>
              )}
            </div>

            {/* Case 1: Already Verified Banner */}
            {currentUser.isVerified && !showKycForm ? (
              <div className="p-4 bg-gradient-to-r from-blue-50/80 via-emerald-50/50 to-white rounded-2xl border border-blue-200/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>
                          {currentUser.role === 'employer'
                            ? 'Pháp Nhân Doanh Nghiệp Đã Được Thẩm Định Hợp Chuẩn'
                            : 'Căn Cước Công Dân Gắn Chip Đã Xác Thực'}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Tích Xanh uy tín đã kích hoạt trên toàn sàn TalentMatch & Cổng ký quỹ Escrow VNPAY.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowKycForm(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    Xem / Cập nhật
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-blue-100 text-[11px]">
                  {currentUser.role === 'employer' ? (
                    <>
                      <div>Tên công ty: <strong className="text-slate-800">{currentUser.companyName || 'Công ty TNHH Giải Pháp Số'}</strong></div>
                      <div>Mã số thuế: <strong className="font-mono text-slate-800">{currentUser.taxCode || '0101234567'}</strong></div>
                      <div>Đại diện pháp luật: <strong className="text-slate-800">{currentUser.name}</strong></div>
                      <div>Trạng thái: <span className="text-emerald-700 font-bold">Đối soát Tổng Cục Thuế hợp lệ</span></div>
                    </>
                  ) : (
                    <>
                      <div>Loại giấy tờ: <strong className="text-slate-800">CCCD 12 Số (Gắn chip)</strong></div>
                      <div>Số định danh: <strong className="font-mono text-slate-800">001202****** (Đã ẩn)</strong></div>
                      <div>Họ và tên: <strong className="text-slate-800">{currentUser.name.toUpperCase()}</strong></div>
                      <div>Cấp độ định danh: <span className="text-emerald-700 font-bold">eKYC Cấp độ 2 (Full quyền)</span></div>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {/* Case 2: Unverified Banner or Form Editing */}
            {(!currentUser.isVerified || showKycForm) && (
              <form onSubmit={handleKycSubmit} className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>
                      {currentUser.role === 'employer'
                        ? 'Yêu cầu xác minh Doanh nghiệp để kích hoạt bảo chứng Escrow'
                        : 'Yêu cầu xác minh eKYC CCCD để nhận hợp đồng & rút tiền'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {currentUser.role === 'employer'
                      ? 'Vui lòng cung cấp Mã số thuế và thông tin Người đại diện để hệ thống AI tự động đối soát với CSDL Đăng ký kinh doanh quốc gia.'
                      : 'Hệ thống áp dụng công nghệ AI OCR đối soát trực tiếp Căn cước công dân gắn chip để đảm bảo tính an toàn cho giao dịch Escrow.'}
                  </p>
                </div>

                {/* Form Fields for Employer */}
                {currentUser.role === 'employer' ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tên Doanh Nghiệp / Tổ Chức:</label>
                        <input
                          type="text"
                          value={kycCompanyName}
                          onChange={(e) => setKycCompanyName(e.target.value)}
                          placeholder="VD: Công ty TNHH Giải Pháp Công Nghệ Số"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Mã Số Thuế (MST 10 hoặc 13 số):</label>
                        <input
                          type="text"
                          value={kycTaxCode}
                          onChange={(e) => setKycTaxCode(e.target.value)}
                          placeholder="VD: 0109887766"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Họ tên Người đại diện pháp luật:</label>
                        <input
                          type="text"
                          value={kycFullName}
                          onChange={(e) => setKycFullName(e.target.value)}
                          placeholder="VD: NGUYEN VAN A"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Số CCCD Người đại diện:</label>
                        <input
                          type="text"
                          value={kycIdNumber}
                          onChange={(e) => setKycIdNumber(e.target.value)}
                          placeholder="VD: 001202008899"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Upload Mock for Business License */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Ảnh chụp Giấy phép ĐKKD / Đăng ký Doanh nghiệp:</label>
                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                        <div className="text-xs font-bold text-slate-700">Tải lên file scan Giấy chứng nhận ĐKKD (PDF, JPG, PNG)</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Tự động nhận diện bằng OCR trong vòng 2 giây</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Fields for Freelancer (Employee) */
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Họ và tên theo CCCD (Chính chủ):</label>
                        <input
                          type="text"
                          value={kycFullName}
                          onChange={(e) => setKycFullName(e.target.value)}
                          placeholder="VD: NGUYEN VAN A"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Số Căn cước công dân (12 số):</label>
                        <input
                          type="text"
                          value={kycIdNumber}
                          onChange={(e) => setKycIdNumber(e.target.value)}
                          placeholder="VD: 001202008899"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* CCCD Front & Back Mock Upload Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-3.5 text-center bg-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer">
                        <Camera className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs font-bold text-slate-700">Mặt trước CCCD</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Chụp rõ khuôn mặt & số định danh</div>
                      </div>

                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-3.5 text-center bg-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer">
                        <Camera className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs font-bold text-slate-700">Mặt sau CCCD (Chip & MRZ)</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Chụp rõ mã quét chip điện tử</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  {currentUser.isVerified && (
                    <button
                      type="button"
                      onClick={() => setShowKycForm(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isVerifyingKyc}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isVerifyingKyc ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang thẩm định AI OCR...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {currentUser.role === 'employer'
                            ? 'Xác Thực Doanh Nghiệp eKYC Ngay'
                            : 'Gửi Hồ Sơ & Kích Hoạt Tích Xanh eKYC'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bank Accounts for Withdrawal Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Tài Khoản Ngân Hàng Thụ Hưởng (Rút Tiền)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBank(!showAddBank)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddBank ? 'Hủy thêm' : '+ Thêm tài khoản'}</span>
              </button>
            </div>

            {/* List of Registered Bank Accounts */}
            {(currentUser.bankAccounts || []).length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">Chưa có tài khoản ngân hàng nào được liên kết</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Để thực hiện rút tiền về tài khoản, bạn cần đăng ký số tài khoản ngân hàng chính chủ tại đây trước.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(currentUser.bankAccounts || []).map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                        🏛️
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                          <span>{acc.bankName}</span>
                          {acc.isDefault && (
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-slate-700 font-bold text-xs tracking-wider mt-0.5">
                          {acc.accountNumber} — <span className="text-slate-500 font-sans">{acc.accountHolder}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Napas 24/7</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBankAccount(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa liên kết"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Bank Account Inline Form */}
            {showAddBank && (
              <form
                onSubmit={handleAddBankSubmit}
                className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in duration-150"
              >
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đăng ký thông tin tài khoản ngân hàng nhận tiền:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Ngân hàng:</label>
                    <div className="relative">
                      <select
                        value={selectedBankName}
                        onChange={(e) => setSelectedBankName(e.target.value)}
                        className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-xl text-xs font-semibold appearance-none focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                      >
                        {VIETNAM_BANKS.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.logo} {b.shortName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Số tài khoản:</label>
                    <input
                      type="text"
                      placeholder="VD: 1028394857"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên chủ tài khoản:</label>
                    <input
                      type="text"
                      placeholder="VD: NGUYEN VAN A"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddBank(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Lưu Tài Khoản Ngân Hàng
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Role-Specific Profile Details: EMPLOYER */}
          {currentUser.role === 'employer' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Thông Tin Doanh Nghiệp Tuyển Dụng</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Tên công ty / Tổ chức:</div>
                  <div className="font-bold text-slate-900 text-sm">{currentUser.companyName || 'Doanh nghiệp tư nhân'}</div>
                </div>

                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Mã số thuế:</div>
                  <div className="font-mono font-bold text-slate-800">{currentUser.taxCode || '0101234567'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-slate-600">
                <div>
                  Tin tuyển dụng đã đăng: <span className="font-bold text-blue-700">{postedProjectsCount}</span>
                </div>
                <div>•</div>
                <div>
                  Hợp đồng đang thực hiện: <span className="font-bold text-emerald-700">{activeOrdersCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Role-Specific Profile Details: FREELANCER */}
          {currentUser.role === 'freelancer' && freelancerProfile && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Năng Lực Chuyên Môn & Điểm Tín Nhiệm TalentCredit</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                  <div className="text-[10px] font-bold text-amber-800 uppercase">Điểm Tín Nhiệm</div>
                  <div className="text-lg font-black text-amber-900 mt-0.5">{freelancerProfile.talentCreditScore} / 1000</div>
                  <div className="text-[10px] font-bold text-amber-700">Hạng: {freelancerProfile.talentCreditBadge}</div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                  <div className="text-[10px] font-bold text-blue-800 uppercase">Đánh Giá Trung Bình</div>
                  <div className="text-lg font-black text-blue-900 mt-0.5 flex items-center justify-center gap-1">
                    <span>{freelancerProfile.rating}</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="text-[10px] text-blue-700">({freelancerProfile.reviewCount} đánh giá)</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Dự Án Hoàn Thành</div>
                  <div className="text-lg font-black text-emerald-900 mt-0.5">{freelancerProfile.completedOrders}</div>
                  <div className="text-[10px] text-emerald-700">Đơn hàng Escrow</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mô Tả Năng Lực & Kinh Nghiệm Bản Thân:</span>
                </div>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {freelancerProfile.bio}
                </p>
              </div>

              {/* Skills */}
              <div>
                <div className="font-bold text-slate-800 mb-1.5">Kỹ năng chuyên môn thành thạo:</div>
                <div className="flex flex-wrap gap-1.5">
                  {freelancerProfile.skills.map((sk) => (
                    <span key={sk} className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2.5 py-1 rounded-lg text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio Link */}
              {freelancerProfile.portfolioUrl && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-700">Link Portfolio trực tiếp:</span>
                  <a
                    href={freelancerProfile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 underline"
                  >
                    <span>{freelancerProfile.portfolioUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                closeUserProfileModal();
                logout();
                navigate('/');
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Đăng Xuất Tài Khoản</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser.role === 'employer' && (
              <Link
                to="/employer/dashboard"
                onClick={closeUserProfileModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs"
              >
                Đến Dashboard Tuyển Dụng
              </Link>
            )}

            {currentUser.role === 'freelancer' && (
              <Link
                to="/freelancer/dashboard"
                onClick={closeUserProfileModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs"
              >
                Đến Dashboard Freelancer
              </Link>
            )}

            {currentUser.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={closeUserProfileModal}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs"
              >
                Đến Cổng Admin
              </Link>
            )}

            <button
              onClick={closeUserProfileModal}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
