import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import {
  ShieldCheck,
  CheckCircle2,
  Camera,
  User as UserIcon,
  Sparkles,
  RefreshCw,
  FileCheck2,
  Lock,
  ChevronRight
} from 'lucide-react';

export const KycVerification: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    switchUserById,
    submitKyc,
    openUserProfileModal
  } = useDemo();

  const [kycFullName, setKycFullName] = useState(currentUser.name);
  const [kycIdNumber, setKycIdNumber] = useState('001202008899');
  const [kycDob, setKycDob] = useState('1995-08-15');
  const [kycAddress, setKycAddress] = useState('Quận 1, TP. Hồ Chí Minh');
  const [kycCompanyName, setKycCompanyName] = useState(currentUser.companyName || 'Công ty TNHH Giải Pháp Số Việt Nam');
  const [kycTaxCode, setKycTaxCode] = useState(currentUser.taxCode || '0109887766');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isEmployer = currentUser.role === 'employer';

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      submitKyc({
        idNumber: kycIdNumber,
        fullName: kycFullName,
        companyName: isEmployer ? kycCompanyName : undefined,
        taxCode: isEmployer ? kycTaxCode : undefined
      });
      setIsVerifying(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={openUserProfileModal} className="hover:text-blue-600 cursor-pointer">Hồ sơ cá nhân</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">Xác minh danh tính eKYC</span>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/30 border border-blue-400/40 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase text-blue-200">
              <ShieldCheck className="w-4 h-4 text-sky-300" />
              <span>Cổng Định Danh Số Quốc Gia eKYC 2.0</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {isEmployer
                ? 'Xác Thực Pháp Nhân Doanh Nghiệp (eKYC Employer)'
                : 'Xác Minh Căn Cước Công Dân Chính Chủ (eKYC Freelancer)'}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              {isEmployer
                ? 'Xác minh Mã số thuế doanh nghiệp và thông tin Người đại diện hợp pháp để nâng cao 95% mức độ tin cậy và tự động hóa giải ngân Escrow VNPAY.'
                : 'Hoàn tất đối soát Căn cước công dân gắn chip bằng công nghệ AI OCR & Liveness Check để nhận Huy hiệu Tích Xanh và mở khóa quyền rút tiền ví sàn.'}
            </p>
          </div>

          {/* Quick Account Switcher for Test */}
          <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-blue-200 font-medium">Tài khoản đang đăng nhập:</span>
              <strong className="text-white bg-white/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-sky-300" />
                <span>{currentUser.name}</span>
                <span className="text-[10px] uppercase font-mono text-sky-200">({currentUser.role})</span>
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-blue-200 font-medium hidden sm:inline">Chuyển acc test:</span>
              <button
                type="button"
                onClick={() => switchUserById('usr-unverified-free')}
                className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                title="Chuyển sang Freelancer chưa xác thực"
              >
                Acc Freelancer chưa eKYC
              </button>
              <button
                type="button"
                onClick={() => switchUserById('usr-unverified-emp')}
                className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                title="Chuyển sang Employer chưa xác thực"
              >
                Acc Employer chưa eKYC
              </button>
            </div>
          </div>
        </div>

        {/* Current Verification Status Card */}
        {currentUser.isVerified ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">Tài Khoản Đã Xác Minh eKYC Chính Chủ</h2>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                      Hợp Lệ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hồ sơ định danh số đã được đối soát hợp chuẩn và tích hợp vào hệ thống bảo chứng Escrow VNPAY.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openUserProfileModal()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Xem Hồ Sơ Chi Tiết
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold">Chủ sở hữu định danh:</div>
                <div className="font-bold text-slate-900 text-sm uppercase">{currentUser.name}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold">
                  {isEmployer ? 'Mã số thuế (MST):' : 'Số định danh CCCD:'}
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {isEmployer ? currentUser.taxCode || '0101234567' : '001202****** (Đã mã hóa)'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold">Cấp độ xác minh:</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cấp độ 2 (Full quyền)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold">Huy hiệu Tích Xanh:</div>
                <div className="font-bold text-blue-700 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Đã kích hoạt</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Form Submit eKYC */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <span>
                  {isEmployer
                    ? 'Nhập Thông Tin Pháp Nhân & Mã Số Thuế Doanh Nghiệp'
                    : 'Nhập Thông Tin Căn Cước Công Dân (CCCD 12 Số)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng điền đúng thông tin theo giấy tờ tùy thân / ĐKKD để AI OCR tự động thẩm định tức thì.
              </p>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-6 text-xs">
              
              {/* Form Fields for Employer */}
              {isEmployer ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Tên Doanh Nghiệp / Công Ty:</label>
                      <input
                        type="text"
                        value={kycCompanyName}
                        onChange={(e) => setKycCompanyName(e.target.value)}
                        placeholder="VD: Công ty Cổ phần Giải Pháp Số VN"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Mã Số Thuế Doanh Nghiệp (MST):</label>
                      <input
                        type="text"
                        value={kycTaxCode}
                        onChange={(e) => setKycTaxCode(e.target.value)}
                        placeholder="VD: 0109887766"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Họ và tên Người đại diện pháp luật:</label>
                      <input
                        type="text"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="VD: NGUYEN THU HA"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Số CCCD Người đại diện:</label>
                      <input
                        type="text"
                        value={kycIdNumber}
                        onChange={(e) => setKycIdNumber(e.target.value)}
                        placeholder="VD: 001202008899"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Upload Business License */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">File Scan Giấy chứng nhận Đăng ký Doanh nghiệp (ĐKKD):</label>
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-2xl p-6 text-center hover:bg-blue-50/80 transition-all cursor-pointer">
                      <FileCheck2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-extrabold text-slate-900 text-xs">
                        Đã đính kèm: Giay_Phep_DKKD_2026.pdf (Hợp lệ)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Định dạng hỗ trợ: PDF, JPG, PNG (Dung lượng tối đa 10MB)</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form Fields for Freelancer (Employee) */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Họ và tên theo Căn Cước Công Dân:</label>
                      <input
                        type="text"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="VD: NGUYEN MINH ANH"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Số CCCD (12 chữ số):</label>
                      <input
                        type="text"
                        value={kycIdNumber}
                        onChange={(e) => setKycIdNumber(e.target.value)}
                        placeholder="VD: 001202008899"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Ngày sinh:</label>
                      <input
                        type="date"
                        value={kycDob}
                        onChange={(e) => setKycDob(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Nơi thường trú:</label>
                      <input
                        type="text"
                        value={kycAddress}
                        onChange={(e) => setKycAddress(e.target.value)}
                        placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* CCCD Image Upload Mock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-2xl p-5 text-center hover:bg-blue-50/80 transition-all cursor-pointer">
                      <Camera className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
                      <div className="font-extrabold text-slate-900 text-xs">Mặt trước Căn cước công dân</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">✓ Đã sẵn sàng ảnh chụp mẫu</div>
                    </div>

                    <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-2xl p-5 text-center hover:bg-blue-50/80 transition-all cursor-pointer">
                      <Camera className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
                      <div className="font-extrabold text-slate-900 text-xs">Mặt sau CCCD (Chip & MRZ)</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">✓ Đã sẵn sàng ảnh quét chip</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  Bảo mật dữ liệu cá nhân tuân thủ Nghị định 13/2023/NĐ-CP. Dữ liệu chỉ dùng cho mục đích xác thực danh tính giao dịch Escrow và bảo vệ quyền lợi hợp đồng trên TalentMatch.
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Hệ thống AI OCR đang thẩm định hồ sơ...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>{isEmployer ? 'Xác Thực Pháp Nhân Doanh Nghiệp' : 'Gửi Hồ Sơ & Kích Hoạt Tích Xanh eKYC'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900">Xác Minh eKYC Thành Công!</h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Tài khoản của bạn đã được cấp <strong>Huy hiệu Tích Xanh chính chủ</strong> và định danh <strong>eKYC Cấp độ 2</strong>. Toàn bộ tính năng nhận thầu, đăng tuyển và rút tiền Escrow đã được mở khóa!
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Về Trang Chủ
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  openUserProfileModal();
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Xem Hồ Sơ Cá Nhân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
