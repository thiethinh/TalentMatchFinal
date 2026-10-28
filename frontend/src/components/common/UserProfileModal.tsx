import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200/90 relative my-8 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 h-24 sm:h-26 px-6 sm:px-8 pt-4 pb-3 text-white shrink-0 flex items-start justify-between">
          <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-semibold tracking-wider uppercase">
            <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-user" />
            </span>
            <span className="text-white font-bold">Hồ Sơ Tài Khoản Cá Nhân</span>
          </div>

          <button
            onClick={closeUserProfileModal}
            className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Profile Card Header with Avatar */}
        <div className="px-6 sm:px-8 pt-0 pb-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* Only the avatar wrapper has negative margin to overlap the banner smoothly */}
              <div className="relative -mt-10 sm:-mt-12 shrink-0 z-10">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover border-4 border-white shadow-md bg-white ring-1 ring-slate-200"
                />
                {currentUser.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] shadow-xs" title="Đã xác thực eKYC">
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                )}
              </div>

              {/* Name & Role: rendered completely on white background with generous breathing room */}
              <div className="pt-2 sm:pt-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">{currentUser.name}</h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    currentUser.role === 'employer'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : currentUser.role === 'freelancer'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : currentUser.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {currentUser.role === 'employer' ? 'Nhà Tuyển Dụng' : currentUser.role === 'freelancer' ? 'Freelancer' : currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Khách'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-2 flex-wrap">
                  <span>ID: {currentUser.id}</span>
                  {currentUser.role === 'employer' && currentUser.companyName && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-sans font-medium">{currentUser.companyName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2 pb-1 sm:pb-0 shrink-0">
              {currentUser.emailVerified ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-xs" />
                  <span>Email Đã Xác Thực</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-circle-exclamation text-amber-600 text-xs" />
                    <span>Chưa Xác Thực Email</span>
                  </span>
                  <button
                    onClick={() => {
                      verifyEmail(currentUser.id);
                    }}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Xác thực ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Financial Wallet Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/90 p-4 sm:p-5 rounded-xl border border-slate-200/90 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-wallet text-base" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Số dư khả dụng trong ví</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-700 font-mono">
                    {(currentUser.balance || 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  closeUserProfileModal();
                  openWithdrawModal();
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Rút tiền
              </button>
            </div>

            <div className="bg-slate-50/90 p-4 sm:p-5 rounded-xl border border-slate-200/90 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-lock text-base" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Tiền phong tỏa Escrow VNPAY</div>
                <div className="text-base sm:text-lg font-bold text-blue-700 font-mono">
                  {(currentUser.escrowBalance || 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Account Security Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-address-card" />
              </span>
              <span>Thông Tin Liên Hệ & Định Danh</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-white text-slate-500 flex items-center justify-center shadow-2xs shrink-0 text-xs">
                  <i className="fa-solid fa-envelope" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-400">Email liên hệ</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate" title={currentUser.email}>
                    {currentUser.email || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-white text-slate-500 flex items-center justify-center shadow-2xs shrink-0 text-xs">
                  <i className="fa-solid fa-phone" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-400">Số điện thoại</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800">
                    {currentUser.phone || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-white text-slate-500 flex items-center justify-center shadow-2xs shrink-0 text-xs">
                  <i className="fa-solid fa-calendar-days" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-400">Ngày tham gia hệ thống</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800">
                    {currentUser.createdAt || '2026-01-15'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-white text-slate-500 flex items-center justify-center shadow-2xs shrink-0 text-xs">
                  <i className="fa-solid fa-clock-rotate-left" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-400">Thời gian đăng nhập cuối</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800">
                    {currentUser.lastLogin || 'Vừa truy cập'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* eKYC Identity & Business Verification Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-shield-halved" />
                </span>
                <span>
                  {currentUser.role === 'employer'
                    ? 'Xác Minh Doanh Nghiệp eKYC (Pháp Nhân & MST)'
                    : 'Xác Minh Danh Tính eKYC (CCCD Gắn Chip)'}
                </span>
              </h3>

              {currentUser.isVerified ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-xs" />
                  <span>Đã Xác Minh Chính Chủ</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                  <i className="fa-solid fa-circle-exclamation text-amber-600 text-xs" />
                  <span>Chưa Xác Minh</span>
                </span>
              )}
            </div>

            {/* Case 1: Already Verified Banner */}
            {currentUser.isVerified && !showKycForm ? (
              <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-file-circle-check text-base" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>
                          {currentUser.role === 'employer'
                            ? 'Pháp Nhân Doanh Nghiệp Đã Được Thẩm Định Hợp Chuẩn'
                            : 'Căn Cước Công Dân Gắn Chip Đã Xác Thực'}
                        </span>
                        <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Tích Xanh uy tín đã kích hoạt trên toàn sàn TalentMatch & Cổng ký quỹ Escrow VNPAY.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowKycForm(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs hover:bg-slate-50"
                  >
                    Xem / Cập nhật
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                  {currentUser.role === 'employer' ? (
                    <>
                      <div><span className="text-slate-500">Tên công ty:</span> <strong className="text-slate-800 ml-1.5 font-semibold">{currentUser.companyName || 'Công ty TNHH Giải Pháp Số'}</strong></div>
                      <div><span className="text-slate-500">Mã số thuế:</span> <strong className="font-mono text-slate-800 ml-1.5 font-semibold">{currentUser.taxCode || '0101234567'}</strong></div>
                      <div><span className="text-slate-500">Đại diện pháp luật:</span> <strong className="text-slate-800 ml-1.5 font-semibold">{currentUser.name}</strong></div>
                      <div><span className="text-slate-500">Trạng thái:</span> <span className="text-emerald-700 font-semibold ml-1.5">Đối soát Tổng Cục Thuế hợp lệ</span></div>
                    </>
                  ) : (
                    <>
                      <div><span className="text-slate-500">Loại giấy tờ:</span> <strong className="text-slate-800 ml-1.5 font-semibold">CCCD 12 Số (Gắn chip)</strong></div>
                      <div><span className="text-slate-500">Số định danh:</span> <strong className="font-mono text-slate-800 ml-1.5 font-semibold">001202****** (Đã ẩn)</strong></div>
                      <div><span className="text-slate-500">Họ và tên:</span> <strong className="text-slate-800 ml-1.5 font-semibold">{currentUser.name.toUpperCase()}</strong></div>
                      <div><span className="text-slate-500">Cấp độ định danh:</span> <span className="text-emerald-700 font-semibold ml-1.5">eKYC Cấp độ 2 (Full quyền)</span></div>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {/* Case 2: Unverified Banner or Form Editing */}
            {(!currentUser.isVerified || showKycForm) && (
              <form onSubmit={handleKycSubmit} className="space-y-3.5 animate-in fade-in duration-150">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                    <i className="fa-solid fa-shield-halved text-amber-600" />
                    <span>
                      {currentUser.role === 'employer'
                        ? 'Yêu cầu xác minh Doanh nghiệp để kích hoạt bảo chứng Escrow'
                        : 'Yêu cầu xác minh eKYC CCCD để nhận hợp đồng & rút tiền'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {currentUser.role === 'employer'
                      ? 'Vui lòng cung cấp Mã số thuế và thông tin Người đại diện để hệ thống tự động đối soát với CSDL Đăng ký kinh doanh quốc gia.'
                      : 'Hệ thống áp dụng công nghệ OCR đối soát trực tiếp Căn cước công dân gắn chip để đảm bảo tính an toàn cho giao dịch Escrow.'}
                  </p>
                </div>

                {/* Form Fields for Employer */}
                {currentUser.role === 'employer' ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Doanh Nghiệp / Tổ Chức:</label>
                        <input
                          type="text"
                          value={kycCompanyName}
                          onChange={(e) => setKycCompanyName(e.target.value)}
                          placeholder="VD: Công ty TNHH Giải Pháp Công Nghệ Số"
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Số Thuế (MST 10 hoặc 13 số):</label>
                        <input
                          type="text"
                          value={kycTaxCode}
                          onChange={(e) => setKycTaxCode(e.target.value)}
                          placeholder="VD: 0109887766"
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-mono font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Họ tên Người đại diện pháp luật:</label>
                        <input
                          type="text"
                          value={kycFullName}
                          onChange={(e) => setKycFullName(e.target.value)}
                          placeholder="VD: NGUYEN VAN A"
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số CCCD Người đại diện:</label>
                        <input
                          type="text"
                          value={kycIdNumber}
                          onChange={(e) => setKycIdNumber(e.target.value)}
                          placeholder="VD: 001202008899"
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-mono font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Upload Mock for Business License */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ảnh chụp Giấy phép ĐKKD / Đăng ký Doanh nghiệp:</label>
                      <div className="border border-dashed border-slate-300 hover:border-blue-500 rounded-md p-4 text-center bg-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
                        <i className="fa-solid fa-cloud-arrow-up text-xl text-slate-400 mx-auto mb-1.5 block" />
                        <div className="text-xs font-semibold text-slate-700">Tải lên file scan Giấy chứng nhận ĐKKD (PDF, JPG, PNG)</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Tự động nhận diện trong vòng 2 giây</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Fields for Freelancer (Employee) */
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Họ và tên theo CCCD (Chính chủ):</label>
                        <input
                          type="text"
                          value={kycFullName}
                          onChange={(e) => setKycFullName(e.target.value)}
                          placeholder="VD: NGUYEN VAN A"
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số Căn cước công dân (12 số):</label>
                        <input
                          type="text"
                          value={kycIdNumber}
                          onChange={(e) => setKycIdNumber(e.target.value)}
                          placeholder="VD: 001202008899"
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-mono font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* CCCD Front & Back Mock Upload Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="border border-dashed border-slate-300 hover:border-blue-500 rounded-md p-3.5 text-center bg-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
                        <i className="fa-solid fa-camera text-blue-600 text-lg mx-auto mb-1 block" />
                        <div className="text-xs font-semibold text-slate-700">Mặt trước CCCD</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Chụp rõ khuôn mặt & số định danh</div>
                      </div>

                      <div className="border border-dashed border-slate-300 hover:border-blue-500 rounded-md p-3.5 text-center bg-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
                        <i className="fa-solid fa-camera text-blue-600 text-lg mx-auto mb-1 block" />
                        <div className="text-xs font-semibold text-slate-700">Mặt sau CCCD (Chip & MRZ)</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Chụp rõ mã quét chip điện tử</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  {currentUser.isVerified && (
                    <button
                      type="button"
                      onClick={() => setShowKycForm(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-md cursor-pointer transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isVerifyingKyc}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isVerifyingKyc ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang thẩm định OCR...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-halved text-xs" />
                        <span>
                          {currentUser.role === 'employer'
                            ? 'Xác Thực Doanh Nghiệp eKYC Ngay'
                            : 'Gửi Hồ Sơ & Kích Hoạt Tích Xanh'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bank Accounts for Withdrawal Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-building-columns" />
                </span>
                <span>Tài Khoản Ngân Hàng Thụ Hưởng (Rút Tiền)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBank(!showAddBank)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <i className="fa-solid fa-plus text-xs" />
                <span>{showAddBank ? 'Hủy thêm' : '+ Thêm tài khoản'}</span>
              </button>
            </div>

            {/* List of Registered Bank Accounts */}
            {(currentUser.bankAccounts || []).length === 0 ? (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 flex items-start space-x-3">
                <i className="fa-solid fa-circle-exclamation text-amber-600 text-base mt-0.5" />
                <div>
                  <div className="font-semibold text-xs text-amber-900">Chưa có tài khoản ngân hàng nào được liên kết</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    Để thực hiện rút tiền về tài khoản, bạn cần đăng ký số tài khoản ngân hàng chính chủ tại đây trước.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(currentUser.bankAccounts || []).map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base shadow-2xs shrink-0">
                        🏛️
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                          <span>{acc.bankName}</span>
                          {acc.isDefault && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-slate-700 font-semibold text-xs tracking-wider mt-1 flex items-center gap-2">
                          <span>{acc.accountNumber}</span>
                          <span className="text-slate-300 font-sans">•</span>
                          <span className="text-slate-500 font-sans uppercase font-medium">{acc.accountHolder}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold border border-emerald-200">
                        <i className="fa-solid fa-circle-check text-xs" />
                        <span>Napas 24/7</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBankAccount(acc.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa liên kết"
                      >
                        <i className="fa-solid fa-trash-can text-xs" />
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
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3 animate-in fade-in duration-150"
              >
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-building-columns text-blue-600 text-xs" />
                  <span>Đăng ký thông tin tài khoản ngân hàng nhận tiền:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ngân hàng:</label>
                    <div className="relative">
                      <select
                        value={selectedBankName}
                        onChange={(e) => setSelectedBankName(e.target.value)}
                        className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-md text-xs font-medium appearance-none focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer"
                      >
                        {VIETNAM_BANKS.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.logo} {b.shortName}
                          </option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down text-[10px] text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số tài khoản:</label>
                    <input
                      type="text"
                      placeholder="VD: 1028394857"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-mono font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên chủ tài khoản:</label>
                    <input
                      type="text"
                      placeholder="VD: NGUYEN VAN A"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-bold uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddBank(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-md cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs cursor-pointer"
                  >
                    Lưu Tài Khoản Ngân Hàng
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Role-Specific Profile Details: EMPLOYER */}
          {currentUser.role === 'employer' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-building" />
                </span>
                <span>Thông Tin Doanh Nghiệp Tuyển Dụng</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="text-[11px] font-medium text-slate-400 mb-0.5">Tên công ty / Tổ chức</div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{currentUser.companyName || 'Doanh nghiệp tư nhân'}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="text-[11px] font-medium text-slate-400 mb-0.5">Mã số thuế</div>
                  <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{currentUser.taxCode || '0101234567'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-slate-600 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Tin tuyển dụng đã đăng:</span>
                  <span className="font-bold text-blue-700 font-mono">{postedProjectsCount}</span>
                </div>
                <div className="text-slate-300">•</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Hợp đồng đang thực hiện:</span>
                  <span className="font-bold text-emerald-700 font-mono">{activeOrdersCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Role-Specific Profile Details: FREELANCER */}
          {currentUser.role === 'freelancer' && freelancerProfile && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-award" />
                </span>
                <span>Năng Lực Chuyên Môn & Điểm Tín Nhiệm TalentCredit</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-center shadow-2xs">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Điểm Tín Nhiệm</div>
                  <div className="text-lg font-bold text-amber-900 mt-1 font-mono">{freelancerProfile.talentCreditScore} / 1000</div>
                  <div className="text-[11px] font-medium text-amber-700 mt-0.5">Hạng: {freelancerProfile.talentCreditBadge}</div>
                </div>

                <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 text-center shadow-2xs">
                  <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Đánh Giá Trung Bình</div>
                  <div className="text-lg font-bold text-blue-900 mt-1 flex items-center justify-center gap-1.5 font-mono">
                    <span>{freelancerProfile.rating}</span>
                    <i className="fa-solid fa-star text-amber-500 text-xs" />
                  </div>
                  <div className="text-[11px] text-blue-700 mt-0.5">({freelancerProfile.reviewCount} đánh giá)</div>
                </div>

                <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-center shadow-2xs">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Dự Án Hoàn Thành</div>
                  <div className="text-lg font-bold text-emerald-900 mt-1 font-mono">{freelancerProfile.completedOrders}</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">Đơn hàng Escrow</div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-800 text-xs mb-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-briefcase text-blue-600 text-xs" />
                  <span>Mô Tả Năng Lực & Kinh Nghiệm Bản Thân:</span>
                </div>
                <p className="text-slate-600 text-xs bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                  {freelancerProfile.bio}
                </p>
              </div>

              {/* Skills */}
              <div>
                <div className="font-semibold text-slate-800 text-xs mb-2">Kỹ năng chuyên môn thành thạo:</div>
                <div className="flex flex-wrap gap-2">
                  {freelancerProfile.skills.map((sk) => (
                    <span key={sk} className="bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-1 rounded-lg text-xs shadow-2xs">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio Link */}
              {freelancerProfile.portfolioUrl && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Link Portfolio trực tiếp:</span>
                  <a
                    href={freelancerProfile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 underline"
                  >
                    <span>{freelancerProfile.portfolioUrl}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50/90 border-t border-slate-200 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                closeUserProfileModal();
                logout();
                navigate('/');
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <i className="fa-solid fa-right-from-bracket text-xs" />
              <span>Đăng Xuất Tài Khoản</span>
            </button>
          </div>

          <div className="flex items-center space-x-2.5">
            {currentUser.role === 'employer' && (
              <Link
                to="/employer/dashboard"
                onClick={closeUserProfileModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
              >
                Đến Dashboard Tuyển Dụng
              </Link>
            )}

            {currentUser.role === 'freelancer' && (
              <Link
                to="/freelancer/dashboard"
                onClick={closeUserProfileModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
              >
                Đến Dashboard Freelancer
              </Link>
            )}

            {currentUser.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={closeUserProfileModal}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
              >
                Đến Cổng Admin
              </Link>
            )}

            <button
              onClick={closeUserProfileModal}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
