import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';

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
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[9px]" />
          <button onClick={openUserProfileModal} className="hover:text-blue-600 cursor-pointer">Hồ sơ cá nhân</button>
          <i className="fa-solid fa-chevron-right text-[9px]" />
          <span className="text-slate-900 font-bold">Xác minh danh tính eKYC</span>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-slate-900 rounded-lg p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-sm text-xs font-semibold tracking-wider uppercase text-blue-300">
              <i className="fa-solid fa-shield-halved text-xs text-blue-400" />
              <span>Cổng Định Danh Số Quốc Gia eKYC 2.0</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isEmployer
                ? 'Xác Thực Pháp Nhân Doanh Nghiệp (eKYC Employer)'
                : 'Xác Minh Căn Cước Công Dân Chính Chủ (eKYC Freelancer)'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isEmployer
                ? 'Xác minh Mã số thuế doanh nghiệp và thông tin Người đại diện hợp pháp để nâng cao mức độ tin cậy và tự động hóa giải ngân Escrow VNPAY.'
                : 'Hoàn tất đối soát Căn cước công dân gắn chip để nhận Huy hiệu Tích Xanh và mở khóa quyền rút tiền ví sàn.'}
            </p>
          </div>

          {/* Quick Account Switcher for Test */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Tài khoản:</span>
              <strong className="text-white bg-slate-800 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-user text-blue-400 text-xs" />
                <span>{currentUser.name}</span>
                <span className="text-[10px] uppercase font-mono text-slate-400">({currentUser.role})</span>
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium hidden sm:inline">Chuyển acc test:</span>
              <button
                type="button"
                onClick={() => switchUserById('usr-unverified-free')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                title="Chuyển sang Freelancer chưa xác thực"
              >
                Freelancer chưa eKYC
              </button>
              <button
                type="button"
                onClick={() => switchUserById('usr-unverified-emp')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                title="Chuyển sang Employer chưa xác thực"
              >
                Employer chưa eKYC
              </button>
            </div>
          </div>
        </div>

        {/* Current Verification Status Card */}
        {currentUser.isVerified ? (
          <div className="bg-white rounded-lg border border-emerald-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <i className="fa-solid fa-circle-check text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">Tài Khoản Đã Xác Minh eKYC Chính Chủ</h2>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase">
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
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  Xem Hồ Sơ Chi Tiết
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-0.5">
                <div className="text-slate-500 font-medium text-[11px]">Chủ sở hữu định danh:</div>
                <div className="font-bold text-slate-900 text-xs uppercase">{currentUser.name}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-0.5">
                <div className="text-slate-500 font-medium text-[11px]">
                  {isEmployer ? 'Mã số thuế (MST):' : 'Số định danh CCCD:'}
                </div>
                <div className="font-mono font-bold text-slate-900 text-xs">
                  {isEmployer ? currentUser.taxCode || '0101234567' : '001202****** (Đã mã hóa)'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-0.5">
                <div className="text-slate-500 font-medium text-[11px]">Cấp độ xác minh:</div>
                <div className="font-semibold text-emerald-700 flex items-center gap-1">
                  <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
                  <span>Cấp độ 2 (Full quyền)</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-0.5">
                <div className="text-slate-500 font-medium text-[11px]">Huy hiệu Tích Xanh:</div>
                <div className="font-semibold text-blue-700 flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-blue-600 text-xs" />
                  <span>Đã kích hoạt</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Form Submit eKYC */
          <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-blue-600 text-base" />
                <span>
                  {isEmployer
                    ? 'Nhập Thông Tin Pháp Nhân & Mã Số Thuế Doanh Nghiệp'
                    : 'Nhập Thông Tin Căn Cước Công Dân (CCCD 12 Số)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vui lòng điền đúng thông tin theo giấy tờ tùy thân / ĐKKD để hệ thống tự động thẩm định tức thì.
              </p>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
              
              {/* Form Fields for Employer */}
              {isEmployer ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tên Doanh Nghiệp / Công Ty:</label>
                      <input
                        type="text"
                        value={kycCompanyName}
                        onChange={(e) => setKycCompanyName(e.target.value)}
                        placeholder="VD: Công ty Cổ phần Giải Pháp Số VN"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mã Số Thuế Doanh Nghiệp (MST):</label>
                      <input
                        type="text"
                        value={kycTaxCode}
                        onChange={(e) => setKycTaxCode(e.target.value)}
                        placeholder="VD: 0109887766"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Họ và tên Người đại diện pháp luật:</label>
                      <input
                        type="text"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="VD: NGUYEN THU HA"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-bold uppercase text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Số CCCD Người đại diện:</label>
                      <input
                        type="text"
                        value={kycIdNumber}
                        onChange={(e) => setKycIdNumber(e.target.value)}
                        placeholder="VD: 001202008899"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Upload Business License */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">File Scan Giấy chứng nhận Đăng ký Doanh nghiệp (ĐKKD):</label>
                    <div className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-md p-5 text-center transition-colors cursor-pointer">
                      <i className="fa-solid fa-file-circle-check text-2xl text-blue-600 mx-auto mb-1.5 block" />
                      <div className="font-bold text-slate-900 text-xs">
                        Đã đính kèm: Giay_Phep_DKKD_2026.pdf (Hợp lệ)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Định dạng hỗ trợ: PDF, JPG, PNG (Dung lượng tối đa 10MB)</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form Fields for Freelancer (Employee) */
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Họ và tên theo Căn Cước Công Dân:</label>
                      <input
                        type="text"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="VD: NGUYEN MINH ANH"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-bold uppercase text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Số CCCD (12 chữ số):</label>
                      <input
                        type="text"
                        value={kycIdNumber}
                        onChange={(e) => setKycIdNumber(e.target.value)}
                        placeholder="VD: 001202008899"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ngày sinh:</label>
                      <input
                        type="date"
                        value={kycDob}
                        onChange={(e) => setKycDob(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nơi thường trú:</label>
                      <input
                        type="text"
                        value={kycAddress}
                        onChange={(e) => setKycAddress(e.target.value)}
                        placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                        className="w-full p-2 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* CCCD Image Upload Mock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-md p-4 text-center transition-colors cursor-pointer">
                      <i className="fa-solid fa-camera text-blue-600 text-lg mx-auto mb-1 block" />
                      <div className="font-bold text-slate-900 text-xs">Mặt trước Căn cước công dân</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ Đã sẵn sàng ảnh chụp mẫu</div>
                    </div>

                    <div className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-md p-4 text-center transition-colors cursor-pointer">
                      <i className="fa-solid fa-camera text-blue-600 text-lg mx-auto mb-1 block" />
                      <div className="font-bold text-slate-900 text-xs">Mặt sau CCCD (Chip & MRZ)</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ Đã sẵn sàng ảnh quét chip</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-start gap-2.5">
                <i className="fa-solid fa-lock text-slate-500 text-xs mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  Bảo mật dữ liệu cá nhân tuân thủ Nghị định 13/2023/NĐ-CP. Dữ liệu chỉ dùng cho mục đích xác thực danh tính giao dịch Escrow và bảo vệ quyền lợi hợp đồng trên TalentMatch.
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang thẩm định hồ sơ...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-shield-halved text-xs" />
                      <span>{isEmployer ? 'Xác Thực Doanh Nghiệp' : 'Gửi Hồ Sơ & Kích Hoạt Tích Xanh'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center space-y-3.5 shadow-xl border border-slate-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <i className="fa-solid fa-circle-check text-2xl" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">Xác Minh eKYC Thành Công!</h3>
            
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
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Về Trang Chủ
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  openUserProfileModal();
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-md transition-colors cursor-pointer"
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
