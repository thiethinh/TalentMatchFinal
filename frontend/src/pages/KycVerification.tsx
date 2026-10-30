import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const KycVerification: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    switchUserById,
    submitKyc,
    openUserProfileModal
  } = useApp();

  const isGuestOrPlaceholder = !currentUser.name || currentUser.name === 'Khách' || currentUser.name.startsWith('usr-');
  const initialName = isGuestOrPlaceholder ? '' : currentUser.name.toUpperCase();

  const [kycFullName, setKycFullName] = useState(initialName);
  const [kycIdNumber, setKycIdNumber] = useState('');
  const [kycDob, setKycDob] = useState('');
  const [kycAddress, setKycAddress] = useState('');
  const [kycCompanyName, setKycCompanyName] = useState(currentUser.companyName || '');
  const [kycTaxCode, setKycTaxCode] = useState(currentUser.taxCode || '');

  // File Upload states (thay thế hoàn toàn dữ liệu mẫu hardcode)
  const [frontCccdFile, setFrontCccdFile] = useState<File | null>(null);
  const [frontCccdPreview, setFrontCccdPreview] = useState<string | null>(null);
  const [backCccdFile, setBackCccdFile] = useState<File | null>(null);
  const [backCccdPreview, setBackCccdPreview] = useState<string | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseName, setLicenseName] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEmployer = currentUser.role === 'employer';

  // Đồng bộ khi đổi người dùng nhưng KHÔNG tự động điền dữ liệu giả
  useEffect(() => {
    if (currentUser) {
      const isGuest = !currentUser.name || currentUser.name === 'Khách' || currentUser.name.startsWith('usr-');
      setKycFullName(isGuest ? '' : currentUser.name.toUpperCase());
      setKycCompanyName(currentUser.companyName || '');
      setKycTaxCode(currentUser.taxCode || '');
    }
  }, [currentUser]);

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontCccdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFrontCccdPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackCccdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBackCccdPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseFile(file);
      setLicenseName(file.name);
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!kycFullName.trim()) {
      setFormError('Vui lòng nhập họ và tên chính xác theo giấy tờ tùy thân.');
      return;
    }

    if (isEmployer) {
      if (!kycCompanyName.trim()) {
        setFormError('Vui lòng nhập tên công ty / doanh nghiệp.');
        return;
      }
      if (!kycTaxCode.trim()) {
        setFormError('Vui lòng nhập mã số thuế doanh nghiệp (10 hoặc 13 chữ số).');
        return;
      }
    } else {
      const cleanId = kycIdNumber.trim();
      if (!cleanId || cleanId.length !== 12 || !/^\d{12}$/.test(cleanId)) {
        setFormError('Số Căn cước công dân (CCCD) phải bao gồm đúng 12 chữ số.');
        return;
      }
      if (!kycDob.trim()) {
        setFormError('Vui lòng chọn ngày sinh theo Căn cước công dân.');
        return;
      }
      if (!kycAddress.trim()) {
        setFormError('Vui lòng nhập nơi thường trú theo Căn cước công dân.');
        return;
      }
    }

    setIsVerifying(true);
    setTimeout(() => {
      submitKyc({
        idNumber: kycIdNumber.trim(),
        fullName: kycFullName.trim().toUpperCase(),
        companyName: isEmployer ? kycCompanyName.trim() : undefined,
        taxCode: isEmployer ? kycTaxCode.trim() : undefined
      });
      setIsVerifying(false);
      setShowSuccessModal(true);
    }, 1200);
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
          /* Form Submit eKYC - Bắt đầu trống để người dùng nhập thông tin thật */
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
                Vui lòng điền đúng thông tin theo giấy tờ tùy thân / ĐKKD để hệ thống thẩm định và kích hoạt Tích Xanh.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
              
              {/* Form Fields for Employer */}
              {isEmployer ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Tên Doanh Nghiệp / Công Ty: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={kycCompanyName}
                        onChange={(e) => setKycCompanyName(e.target.value)}
                        placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mã Số Thuế Doanh Nghiệp (MST): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={kycTaxCode}
                        onChange={(e) => setKycTaxCode(e.target.value)}
                        placeholder="VD: 0109887766 (10 hoặc 13 chữ số)"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Họ và tên Người đại diện pháp luật: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="VD: NGUYỄN VĂN A"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Số CCCD Người đại diện: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={kycIdNumber}
                        maxLength={12}
                        onChange={(e) => setKycIdNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="VD: 001202008899"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Upload Business License */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      File Scan Giấy chứng nhận Đăng ký Doanh nghiệp (ĐKKD):
                    </label>
                    <input
                      ref={licenseInputRef}
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={handleLicenseFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => licenseInputRef.current?.click()}
                      className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-md p-5 text-center transition-colors cursor-pointer"
                    >
                      {licenseName ? (
                        <div className="space-y-1">
                          <i className="fa-solid fa-file-circle-check text-2xl text-emerald-600 mx-auto block" />
                          <div className="font-bold text-slate-900 text-xs">
                            Đã đính kèm: {licenseFile ? licenseFile.name : licenseName}
                          </div>
                          <span className="text-[11px] text-blue-600 hover:underline inline-block font-semibold">
                            Nhấn để thay đổi file
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <i className="fa-solid fa-arrow-up-from-bracket text-2xl text-slate-400 mx-auto block" />
                          <div className="font-bold text-slate-800 text-xs">
                            Nhấn để chọn file Giấy ĐKKD (PDF, JPG, PNG)
                          </div>
                          <div className="text-[11px] text-slate-500">Dung lượng tối đa 10MB</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Form Fields for Freelancer */
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Họ và tên theo Căn Cước Công Dân: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="VD: NGUYỄN VĂN A"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Số CCCD (12 chữ số): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={kycIdNumber}
                        maxLength={12}
                        onChange={(e) => setKycIdNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Nhập 12 chữ số CCCD gắn chip"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Ngày sinh: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={kycDob}
                        onChange={(e) => setKycDob(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nơi thường trú theo CCCD: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={kycAddress}
                        onChange={(e) => setKycAddress(e.target.value)}
                        placeholder="VD: Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* CCCD Image Upload */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ảnh chụp Căn cước công dân gắn chip (Mặt trước & Mặt sau):
                    </label>
                    
                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFrontFileChange}
                      className="hidden"
                    />
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackFileChange}
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Mặt trước */}
                      <div
                        onClick={() => frontInputRef.current?.click()}
                        className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-md p-4 text-center transition-colors cursor-pointer min-h-[110px] flex flex-col items-center justify-center"
                      >
                        {frontCccdPreview ? (
                          <div className="space-y-1 w-full">
                            <img
                              src={frontCccdPreview}
                              alt="Mặt trước CCCD"
                              className="h-16 mx-auto object-cover rounded border border-slate-200"
                            />
                            <div className="font-bold text-slate-900 text-[11px] truncate px-2">
                              {frontCccdFile?.name || 'Ảnh mặt trước'}
                            </div>
                            <span className="text-[10px] text-blue-600 font-semibold hover:underline">
                              Nhấn để đổi ảnh khác
                            </span>
                          </div>
                        ) : (
                          <>
                            <i className="fa-solid fa-camera text-blue-600 text-lg mx-auto mb-1 block" />
                            <div className="font-bold text-slate-900 text-xs">Mặt trước Căn cước công dân</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Nhấn để chụp hoặc tải ảnh</div>
                          </>
                        )}
                      </div>

                      {/* Mặt sau */}
                      <div
                        onClick={() => backInputRef.current?.click()}
                        className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-md p-4 text-center transition-colors cursor-pointer min-h-[110px] flex flex-col items-center justify-center"
                      >
                        {backCccdPreview ? (
                          <div className="space-y-1 w-full">
                            <img
                              src={backCccdPreview}
                              alt="Mặt sau CCCD"
                              className="h-16 mx-auto object-cover rounded border border-slate-200"
                            />
                            <div className="font-bold text-slate-900 text-[11px] truncate px-2">
                              {backCccdFile?.name || 'Ảnh mặt sau'}
                            </div>
                            <span className="text-[10px] text-blue-600 font-semibold hover:underline">
                              Nhấn để đổi ảnh khác
                            </span>
                          </div>
                        ) : (
                          <>
                            <i className="fa-solid fa-camera text-blue-600 text-lg mx-auto mb-1 block" />
                            <div className="font-bold text-slate-900 text-xs">Mặt sau CCCD (Chip & MRZ)</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Nhấn để chụp hoặc tải ảnh</div>
                          </>
                        )}
                      </div>
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

export default KycVerification;
