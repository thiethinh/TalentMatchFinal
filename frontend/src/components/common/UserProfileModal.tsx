import { resolveAvatarUrl } from '../../utils/avatar';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

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
    updateUserProfile,
    uploadAvatar,
    addToast,
    vnpayTransactions,
    logout,
    freelancers,
    projects,
    orders,
    categories
  } = useApp();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'bank'>('profile');
  const [txFilter, setTxFilter] = useState<'ALL' | 'ESCROW_DEPOSIT' | 'PAYOUT'>('ALL');

  // Inline Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editTaxCode, setEditTaxCode] = useState('');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('it-dev');

  // Bank Form State (empty by default)
  const [showAddBank, setShowAddBank] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState(VIETNAM_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // eKYC State (no hardcoded fake values - empty by default if not set)
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycFullName, setKycFullName] = useState('');
  const [kycIdNumber, setKycIdNumber] = useState('');
  const [kycCompanyName, setKycCompanyName] = useState('');
  const [kycTaxCode, setKycTaxCode] = useState('');
  const [isVerifyingKyc, setIsVerifyingKyc] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Vui lòng chọn file hình ảnh (PNG, JPG, JPEG, WEBP)', 'warning');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Kích thước ảnh không được vượt quá 10MB', 'warning');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Matching Freelancer profile
  const freelancerProfile = freelancers.find(
    (f) => f.userId === currentUser.id || f.name === currentUser.name
  );

  useEffect(() => {
    if (isUserProfileModalOpen) {
      const currentTitle = currentUser.title || freelancerProfile?.title || '';
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phone || '');
      setEditTitle(currentTitle);
      setEditBio(currentUser.bio || freelancerProfile?.bio || '');
      setEditSkills((currentUser.skills || freelancerProfile?.skills || []).join(', '));
      setEditCompanyName(currentUser.companyName || '');
      setEditTaxCode(currentUser.taxCode || '');

      if (categories && categories.length > 0) {
        const found = categories.find((c) => c.professions?.some((p) => p.toLowerCase() === currentTitle.toLowerCase()) || c.professions?.includes(currentTitle));
        if (found) {
          setSelectedCategoryCode(found.code);
        } else if (categories[0]) {
          setSelectedCategoryCode(categories[0].code);
        }
      }

      setKycFullName(currentUser.name || '');
      setKycIdNumber('');
      setKycCompanyName(currentUser.companyName || '');
      setKycTaxCode(currentUser.taxCode || '');
      setAccountHolder(currentUser.name ? currentUser.name.toUpperCase() : '');
    }
  }, [currentUser, freelancerProfile, isUserProfileModalOpen, categories]);

  if (!isUserProfileModalOpen) return null;

  // Filter transactions for current user
  const userTransactions = vnpayTransactions.filter(
    (tx) => tx.userEmail === currentUser.email || tx.userEmail === currentUser.name
  );

  const filteredTransactions = userTransactions.filter((tx) => {
    if (txFilter === 'ALL') return true;
    return tx.type === txFilter;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSkills = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateUserProfile({
      name: editName.trim() || currentUser.name,
      phone: editPhone.trim(),
      title: editTitle.trim(),
      bio: editBio.trim(),
      skills: parsedSkills,
      companyName: editCompanyName.trim(),
      taxCode: editTaxCode.trim()
    });

    setIsEditingProfile(false);
  };

  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;

    const matchedBank = VIETNAM_BANKS.find((b) => b.name === selectedBankName) || VIETNAM_BANKS[0];
    addBankAccount({
      bankName: matchedBank.name,
      bankCode: matchedBank.id,
      accountNumber: accountNumber.trim(),
      accountHolder: (accountHolder.trim() || currentUser.name).toUpperCase(),
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
        idNumber: kycIdNumber || '001202889911',
        fullName: kycFullName || currentUser.name,
        companyName: currentUser.role === 'employer' ? kycCompanyName : undefined,
        taxCode: currentUser.role === 'employer' ? kycTaxCode : undefined
      });
      setIsVerifyingKyc(false);
      setShowKycForm(false);
    }, 1000);
  };

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

          <div className="flex items-center gap-2">
            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <i className="fa-solid fa-pen text-[10px]" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            )}

            <button
              onClick={closeUserProfileModal}
              className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {/* Profile Card Header with Avatar */}
        <div className="px-6 sm:px-8 pt-0 pb-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative -mt-10 sm:-mt-12 shrink-0 z-10 group">
                <img
                  src={resolveAvatarUrl(currentUser.avatar, currentUser.name)}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover border-4 border-white shadow-md bg-white ring-1 ring-slate-200"
                />
                
                {/* Hover overlay button to change avatar */}
                <label
                  htmlFor="avatar-upload-file-input"
                  className="absolute inset-0 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
                  title="Tải ảnh đại diện mới từ máy tính"
                >
                  <i className="fa-solid fa-camera text-base" />
                  <span className="text-[9px] font-bold mt-0.5">Đổi ảnh</span>
                  <input
                    id="avatar-upload-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>

                {/* Badge button bottom-right for easy click */}
                <label
                  htmlFor="avatar-upload-file-input"
                  className="absolute -bottom-1.5 -right-1.5 bg-blue-600 hover:bg-blue-700 text-white w-7 h-7 rounded-full ring-2 ring-white flex items-center justify-center text-xs shadow-sm cursor-pointer transition-colors"
                  title="Tải ảnh đại diện từ máy tính"
                >
                  {isUploadingAvatar ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <i className="fa-solid fa-camera" />
                  )}
                </label>

                {currentUser.isVerified && (
                  <div className="absolute -top-1.5 -left-1.5 bg-blue-600 text-white w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] shadow-xs" title="Đã xác thực eKYC">
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                )}
              </div>

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
                  {(currentUser.title || freelancerProfile?.title) && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-700 font-sans font-semibold">{currentUser.title || freelancerProfile?.title}</span>
                    </>
                  )}
                  {currentUser.role === 'employer' && currentUser.companyName && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-sans font-medium">{currentUser.companyName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Email Verification Status */}
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
                    onClick={() => verifyEmail(currentUser.id)}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Xác thực ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Navigation Tabs */}
          <div className="flex items-center gap-4 mt-4 border-t border-slate-100 pt-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-address-card" />
              <span>Hồ Sơ & Năng Lực</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left" />
              <span>Lịch Sử Giao Dịch Ví ({userTransactions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bank'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-building-columns" />
              <span>Tài Khoản Rút Tiền ({(currentUser.bankAccounts || []).length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">

          {/* TAB: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-receipt text-blue-600" />
                    <span>Lịch Sử Giao Dịch Ví & Ký Quỹ Escrow VNPAY</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghi nhận biến động số dư, tiền cọc Escrow và rút tiền Napas 24/7.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', 'ESCROW_DEPOSIT', 'PAYOUT'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTxFilter(mode)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        txFilter === mode
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {mode === 'ALL' ? 'Tất cả' : mode === 'ESCROW_DEPOSIT' ? 'Ký quỹ Escrow' : 'Rút tiền'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <i className="fa-solid fa-receipt text-2xl text-slate-300 mx-auto block" />
                  <span>Không tìm thấy giao dịch nào phù hợp với bộ lọc.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{tx.transactionNo}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'ESCROW_DEPOSIT'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.type === 'PAYOUT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.type === 'ESCROW_DEPOSIT' ? 'Nạp Cọc Escrow' : tx.type === 'PAYOUT' ? 'Rút Tiền Napas' : 'Hoàn Cọc'}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px]">{tx.description}</div>
                        <div className="text-[10px] text-slate-400">{tx.payDate} • Cổng: {tx.bankCode}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-bold text-sm ${
                          tx.type === 'PAYOUT' ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                          {tx.type === 'PAYOUT' ? '-' : '+'}{tx.amount.toLocaleString('vi-VN')} đ
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700">✓ Thành công</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BANK ACCOUNTS */}
          {activeTab === 'bank' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-building-columns text-emerald-600" />
                    <span>Tài Khoản Ngân Hàng Thụ Hưởng Rút Tiền</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý danh sách STK ngân hàng chính chủ để rút tiền về tức thì qua Napas 24/7.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddBank(!showAddBank)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <i className={`fa-solid ${showAddBank ? 'fa-xmark' : 'fa-plus'} text-xs`} />
                  <span>{showAddBank ? 'Hủy thêm' : 'Thêm STK mới'}</span>
                </button>
              </div>

              {/* Add Bank Form */}
              {showAddBank && (
                <form onSubmit={handleAddBankSubmit} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="font-bold text-emerald-950">Đăng ký thông tin tài khoản ngân hàng thụ hưởng:</div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ngân hàng:</label>
                    <select
                      value={selectedBankName}
                      onChange={(e) => setSelectedBankName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      {VIETNAM_BANKS.map((b) => (
                        <option key={b.id} value={b.name}>{b.logo} {b.shortName} - {b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số tài khoản:</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Nhập số tài khoản ngân hàng"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên chủ tài khoản:</label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="VD: NGUYEN VAN A"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold uppercase focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddBank(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer shadow-xs"
                    >
                      Lưu Tài Khoản
                    </button>
                  </div>
                </form>
              )}

              {/* Bank Accounts List */}
              {(currentUser.bankAccounts || []).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <i className="fa-solid fa-credit-card text-2xl text-slate-300 mx-auto block" />
                  <span>Chưa có tài khoản ngân hàng nào được lưu. Bấm "Thêm STK mới" để đăng ký.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(currentUser.bankAccounts || []).map((acc) => (
                    <div key={acc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🏦</span>
                        <div>
                          <div className="font-bold text-slate-900">{acc.bankName}</div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            STK: <strong>{acc.accountNumber}</strong> • {acc.accountHolder}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {acc.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            Mặc định
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeBankAccount(acc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                          title="Xóa tài khoản"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE & CAPABILITIES */}
          {activeTab === 'profile' && (
            <>
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

              {/* INLINE EDIT PROFILE FORM */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-blue-200 p-5 space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-user-pen text-blue-600" />
                      <span>Chỉnh Sửa Trực Tiếp Thông Tin Hồ Sơ Cá Nhân</span>
                    </h3>
                    <span className="text-[11px] text-slate-500">Cập nhật ngay vào hệ thống</span>
                  </div>

                  {/* Avatar Upload Banner */}
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveAvatarUrl(currentUser.avatar, currentUser.name)}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-lg object-cover border border-blue-300 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <i className="fa-solid fa-camera text-blue-600 text-xs" />
                          <span>Ảnh đại diện tài khoản</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 10MB)
                        </div>
                      </div>
                    </div>
                    <label
                      htmlFor="avatar-upload-file-input"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang tải lên...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-upload text-[11px]" />
                          <span>Chọn Ảnh Từ Máy Tính</span>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {currentUser.role === 'admin'
                          ? 'Họ và tên Quản trị viên:'
                          : currentUser.role === 'employer'
                          ? 'Họ và tên người đại diện:'
                          : 'Họ và tên hiển thị:'}
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số điện thoại liên hệ:</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="VD: 0987654321"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* FREELANCER: DYNAMIC CATEGORY & PROFESSION DROPDOWNS */}
                    {currentUser.role === 'freelancer' && (
                      <div id="edit-category-section" className="sm:col-span-2 space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-200/80">
                          <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <i className="fa-solid fa-briefcase text-blue-600 text-xs" />
                            <span>Nhóm Ngành & Vị Trí Nghề Nghiệp (Dữ Liệu Động MySQL)</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              1. Chọn Nhóm ngành nghề chuyên môn:
                            </label>
                            <select
                              id="edit-category-select"
                              value={selectedCategoryCode}
                              onChange={(e) => {
                                const code = e.target.value;
                                setSelectedCategoryCode(code);
                                const cat = categories.find((c) => c.code === code);
                                if (cat && cat.professions && cat.professions.length > 0) {
                                  setEditTitle(cat.professions[0]);
                                  if (cat.suggestedSkills && (!editSkills || editSkills.trim() === '')) {
                                    setEditSkills(cat.suggestedSkills);
                                  }
                                }
                              }}
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-2xs"
                            >
                              {categories.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.name} ({c.professions?.length || 0} nghề)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              2. Chọn Vị trí / Nghề nghiệp liên quan:
                            </label>
                            <select
                              id="edit-profession-select"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full p-2.5 bg-white border border-blue-400 rounded-lg text-xs font-bold text-blue-900 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-2xs"
                            >
                              {(categories.find((c) => c.code === selectedCategoryCode)?.professions || [
                                '3D Character Artist & Unreal Engine Specialist',
                                'Full-Stack Web Developer',
                                'Frontend Developer (React/Vue)',
                                'Backend Developer (Node.js/Java/Go)',
                                'Mobile App Developer'
                              ]).map((prof) => (
                                <option key={prof} value={prof}>
                                  {prof}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            3. Kỹ năng chuyên môn thành thạo (cách nhau bởi dấu phẩy):
                          </label>
                          <input
                            id="edit-skills-input"
                            type="text"
                            value={editSkills}
                            onChange={(e) => setEditSkills(e.target.value)}
                            placeholder="Blender, Unreal Engine 5, ZBrush, Maya, Rigging..."
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-2xs"
                          />

                          {/* Quick Add Chips from Suggested Skills */}
                          {(() => {
                            const activeCat = categories.find((c) => c.code === selectedCategoryCode);
                            const suggestedList = activeCat?.suggestedSkills
                              ? activeCat.suggestedSkills.split(',').map((s) => s.trim()).filter(Boolean)
                              : [];
                            if (suggestedList.length === 0) return null;
                            const currentSkillList = editSkills.split(',').map((s) => s.trim().toLowerCase());
                            return (
                              <div className="mt-2.5">
                                <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex items-center gap-1">
                                  <i className="fa-solid fa-wand-magic-sparkles text-amber-500" />
                                  <span>Gợi ý kỹ năng ngành {activeCat?.name} (bấm để thêm / bớt nhanh):</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {suggestedList.map((skill) => {
                                    const isAdded = currentSkillList.includes(skill.toLowerCase());
                                    return (
                                      <button
                                        type="button"
                                        key={skill}
                                        onClick={() => {
                                          if (isAdded) {
                                            const updated = editSkills
                                              .split(',')
                                              .map((s) => s.trim())
                                              .filter((s) => s.toLowerCase() !== skill.toLowerCase())
                                              .join(', ');
                                            setEditSkills(updated);
                                          } else {
                                            const updated = editSkills.trim()
                                              ? `${editSkills.trim()}, ${skill}`
                                              : skill;
                                            setEditSkills(updated);
                                          }
                                        }}
                                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                                          isAdded
                                            ? 'bg-blue-600 text-white shadow-2xs'
                                            : 'bg-white hover:bg-blue-100 text-blue-700 border border-blue-200'
                                        }`}
                                      >
                                        <span>{skill}</span>
                                        <i className={`fa-solid ${isAdded ? 'fa-check' : 'fa-plus'} text-[9px]`} />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* EMPLOYER FIELDS */}
                    {currentUser.role === 'employer' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Tên Doanh Nghiệp / Tổ Chức:
                          </label>
                          <input
                            type="text"
                            value={editCompanyName}
                            onChange={(e) => setEditCompanyName(e.target.value)}
                            placeholder="VD: Công ty Cổ phần TechStartup Việt Nam"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Chức vụ người đại diện:
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="VD: Giám Đốc Tuyển Dụng / HR Manager"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Mã Số Thuế Doanh Nghiệp (MST):
                          </label>
                          <input
                            type="text"
                            value={editTaxCode}
                            onChange={(e) => setEditTaxCode(e.target.value)}
                            placeholder="VD: 0101234567"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {/* ADMIN FIELDS */}
                    {currentUser.role === 'admin' && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Chức danh quản trị hệ thống:
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="VD: Hệ Thống Trọng Tài & Quản Trị TalentMatch"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-purple-900 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {/* BIO / RESPONSIBILITY */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          {currentUser.role === 'admin'
                            ? 'Mô tả phạm vi quản trị & trách nhiệm hệ thống:'
                            : currentUser.role === 'employer'
                            ? 'Giới thiệu doanh nghiệp & năng lực tuyển dụng:'
                            : 'Mô tả năng lực & Giới thiệu bản thân (Bio):'}
                        </label>
                        <span className="text-[10px] text-slate-400">Hiển thị công khai trên Marketplace</span>
                      </div>
                      <textarea
                        id="edit-bio-input"
                        rows={3}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Mô tả kinh nghiệm, năng lực thực hiện dự án, phong cách làm việc..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-floppy-disk text-xs" />
                      <span>Lưu Thay Đổi Hồ Sơ</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Contact & Identity Cards (Read-only view) */
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                        <i className="fa-solid fa-address-card" />
                      </span>
                      <span>Thông Tin Liên Hệ & Định Danh</span>
                    </h3>

                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen text-[10px]" />
                      <span>Sửa thông tin</span>
                    </button>
                  </div>

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
              )}

              {/* eKYC Section */}
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

                {/* If verified & not updating */}
                {currentUser.isVerified && !showKycForm ? (
                  <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-3.5 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{currentUser.role === 'employer' ? 'Pháp Nhân Doanh Nghiệp Đã Được Thẩm Định Hợp Chuẩn' : 'Căn Cước Công Dân Gắn Chip Đã Xác Thực'}</span>
                          <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Tích xanh uy tín đã được kích hoạt trên sàn TalentMatch & cổng Escrow VNPAY.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowKycForm(true)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Cập nhật lại
                      </button>
                    </div>
                  </div>
                ) : (
                  /* eKYC Form */
                  <form onSubmit={handleKycSubmit} className="space-y-3.5 text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {currentUser.role === 'employer' ? 'Tên Doanh Nghiệp / Tổ Chức:' : 'Họ và tên theo CCCD:'}
                        </label>
                        <input
                          type="text"
                          value={currentUser.role === 'employer' ? kycCompanyName : kycFullName}
                          onChange={(e) => currentUser.role === 'employer' ? setKycCompanyName(e.target.value) : setKycFullName(e.target.value)}
                          placeholder={currentUser.role === 'employer' ? 'VD: Công ty TNHH Giải Pháp Số' : 'VD: NGUYEN VAN A'}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {currentUser.role === 'employer' ? 'Mã Số Thuế (MST 10 hoặc 13 số):' : 'Số CCCD gắn chip (12 số):'}
                        </label>
                        <input
                          type="text"
                          value={currentUser.role === 'employer' ? kycTaxCode : kycIdNumber}
                          onChange={(e) => currentUser.role === 'employer' ? setKycTaxCode(e.target.value) : setKycIdNumber(e.target.value)}
                          placeholder={currentUser.role === 'employer' ? 'VD: 0101234567' : 'VD: 001202008899'}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {currentUser.isVerified && (
                        <button
                          type="button"
                          onClick={() => setShowKycForm(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isVerifyingKyc}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {isVerifyingKyc ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang thẩm định OCR...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-shield-halved text-xs" />
                            <span>Gửi Thẩm Định eKYC</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Freelancer Specific Details */}
              {currentUser.role === 'freelancer' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                        <i className="fa-solid fa-award" />
                      </span>
                      <span>Năng Lực Chuyên Môn & Điểm Tín Nhiệm TalentCredit</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(true);
                        setTimeout(() => {
                          document.getElementById('edit-category-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <i className="fa-solid fa-pen text-[10px]" />
                      <span>Chỉnh sửa Bio, Nghề & Kỹ năng</span>
                    </button>
                  </div>

                  {freelancerProfile && (
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
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                        <i className="fa-solid fa-briefcase text-blue-600 text-xs" />
                        <span>Mô Tả Năng Lực & Giới Thiệu (Bio):</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setTimeout(() => {
                            document.getElementById('edit-bio-input')?.focus();
                          }, 100);
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <i className="fa-solid fa-pen-to-square text-[10px]" />
                        <span>Sửa Bio</span>
                      </button>
                    </div>
                    <div
                      onClick={() => {
                        setIsEditingProfile(true);
                        setTimeout(() => {
                          document.getElementById('edit-bio-input')?.focus();
                        }, 100);
                      }}
                      className="text-slate-600 text-xs bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                      title="Bấm để chỉnh sửa mô tả Bio"
                    >
                      <p>{currentUser.bio || freelancerProfile?.bio || 'Chưa cập nhật mô tả bản thân. Bấm để thêm.'}</p>
                      <div className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1 font-medium">
                        <i className="fa-solid fa-pen-to-square text-[9px]" />
                        <span>Bấm vào để chỉnh sửa Bio</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                        <i className="fa-solid fa-tags text-blue-600 text-xs" />
                        <span>Vị trí công việc & Kỹ năng chuyên môn:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setTimeout(() => {
                            document.getElementById('edit-category-section')?.scrollIntoView({ behavior: 'smooth' });
                            document.getElementById('edit-profession-select')?.focus();
                          }, 100);
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <i className="fa-solid fa-pen-to-square text-[10px]" />
                        <span>Chỉnh sửa Nghề & Kỹ năng</span>
                      </button>
                    </div>

                    <div className="mb-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">Nghề nghiệp:</span>
                        <span className="font-bold text-slate-900">{currentUser.title || freelancerProfile?.title || 'Chưa chọn nghề'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setTimeout(() => {
                            document.getElementById('edit-category-section')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Đổi vị trí →
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(currentUser.skills || freelancerProfile?.skills || []).map((sk) => (
                        <span key={sk} className="bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-1 rounded-lg text-xs shadow-2xs">
                          {sk}
                        </span>
                      ))}
                      {(currentUser.skills || freelancerProfile?.skills || []).length === 0 && (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="text-xs text-blue-600 italic hover:underline cursor-pointer"
                        >
                          + Thêm kỹ năng chuyên môn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Employer Specific Details */}
              {currentUser.role === 'employer' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-building" />
                    </span>
                    <span>Thông Tin Doanh Nghiệp Tuyển Dụng</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">Tên công ty / Doanh nghiệp</div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{currentUser.companyName || 'Doanh nghiệp tuyển dụng'}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">Mã số thuế doanh nghiệp</div>
                      <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{currentUser.taxCode || 'Chưa cập nhật'}</div>
                    </div>

                    {currentUser.title && (
                      <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 sm:col-span-2">
                        <div className="text-[11px] font-medium text-slate-400 mb-0.5">Chức vụ đại diện</div>
                        <div className="font-semibold text-slate-900 text-xs">{currentUser.title}</div>
                      </div>
                    )}
                  </div>

                  {currentUser.bio && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-700 mb-1">Giới thiệu doanh nghiệp:</div>
                      <p className="text-slate-600 text-xs bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        {currentUser.bio}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-slate-600 text-xs">
                    <div>Tin tuyển dụng đã đăng: <strong className="text-blue-700 font-mono font-bold">{postedProjectsCount}</strong></div>
                    <div className="text-slate-300">•</div>
                    <div>Hợp đồng đang thực hiện: <strong className="text-emerald-700 font-mono font-bold">{activeOrdersCount}</strong></div>
                  </div>
                </div>
              )}

              {/* Admin Specific Details */}
              {currentUser.role === 'admin' && (
                <div className="bg-white rounded-xl border border-purple-200 p-5 space-y-4 shadow-2xs">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2.5 border-b border-purple-100 pb-3">
                    <span className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-crown" />
                    </span>
                    <span>Quyền Hạn & Phạm Vi Quản Trị Hệ Thống</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3 rounded-lg bg-purple-50/60 border border-purple-100">
                      <div className="text-[11px] font-medium text-purple-600 mb-0.5">Chức danh quản trị</div>
                      <div className="font-bold text-purple-950 text-xs sm:text-sm">
                        {currentUser.title || 'Hệ Thống Trọng Tài & Quản Trị TalentMatch'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <div className="text-[11px] font-medium text-emerald-600 mb-0.5">Cấp bậc phân quyền</div>
                      <div className="font-bold text-emerald-800 text-xs sm:text-sm flex items-center gap-1.5">
                        <i className="fa-solid fa-shield-halved text-emerald-600" />
                        <span>Super Administrator (Toàn Quyền Sàn)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">Nhiệm vụ & Phạm vi quản trị:</div>
                    <p className="text-slate-600 text-xs bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                      {currentUser.bio || 'Giám sát toàn diện hệ thống: Quản lý người dùng, kiểm duyệt dự án, trọng tài giải quyết tranh chấp Escrow, kiểm soát dòng tiền VNPay và quản lý danh mục nhóm ngành nghề trên toàn bộ sàn TalentMatch.'}
                    </p>
                  </div>
                </div>
              )}
            </>
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
            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditingProfile(true);
                  setTimeout(() => {
                    document.getElementById('edit-category-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors border border-blue-200 cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <i className="fa-solid fa-pen text-[10px]" />
                <span>Chỉnh Sửa Bio & Kỹ Năng</span>
              </button>
            )}

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
