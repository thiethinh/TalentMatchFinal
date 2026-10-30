import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const VIETNAM_BANKS = [
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)', shortName: 'Vietcombank', logo: '🏛️' },
  { id: 'MBB', name: 'MB Bank (Quân Đội)', shortName: 'MB Bank', logo: '⭐' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)', shortName: 'Techcombank', logo: '🔴' },
  { id: 'CTG', name: 'VietinBank (Công Thương Việt Nam)', shortName: 'VietinBank', logo: '🔷' },
  { id: 'BIDV', name: 'BIDV (Đầu Tư và Phát Triển)', shortName: 'BIDV', logo: '🏦' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', shortName: 'VPBank', logo: '🍀' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)', shortName: 'TPBank', logo: '🟣' },
  { id: 'ACB', name: 'ACB (Á Châu)', shortName: 'ACB', logo: '🏢' },
];

export const WithdrawModal: React.FC = () => {
  const {
    currentUser,
    isWithdrawModalOpen,
    closeWithdrawModal,
    openUserProfileModal,
    withdrawMoney,
    vnpayTransactions
  } = useApp();

  const registeredAccounts = currentUser.bankAccounts || [];
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  
  // Custom bank account fields (empty by default as required by user)
  const [customBankName, setCustomBankName] = useState(VIETNAM_BANKS[0].name);
  const [customAccountNumber, setCustomAccountNumber] = useState('');
  const [customAccountHolder, setCustomAccountHolder] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);

  const [amount, setAmount] = useState<number>(1000000);
  const [step, setStep] = useState<'form' | 'confirm' | 'success' | 'history'>('form');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  useEffect(() => {
    if (registeredAccounts.length > 0) {
      const defaultAcc = registeredAccounts.find(a => a.isDefault) || registeredAccounts[0];
      setSelectedAccountId(defaultAcc.id);
    } else {
      setSelectedAccountId('custom');
      setCustomAccountNumber('');
      setCustomAccountHolder(currentUser.name ? currentUser.name.toUpperCase() : '');
    }
  }, [currentUser, isWithdrawModalOpen, registeredAccounts.length]);

  if (!isWithdrawModalOpen) return null;

  const currentBalance = currentUser.balance || 0;
  const isCustom = selectedAccountId === 'custom';
  const selectedAccount = registeredAccounts.find(a => a.id === selectedAccountId);

  // Active bank details for current transaction
  const activeBankName = isCustom ? customBankName : (selectedAccount?.bankName || '');
  const activeAccountNumber = isCustom ? customAccountNumber.trim() : (selectedAccount?.accountNumber || '');
  const activeAccountHolder = isCustom ? customAccountHolder.trim().toUpperCase() : (selectedAccount?.accountHolder || '');

  // Filter withdrawal transactions for this user
  const userWithdrawalHistory = vnpayTransactions.filter(
    (tx) => tx.type === 'PAYOUT' && (tx.userEmail === currentUser.email || tx.userEmail === currentUser.name)
  );

  const handleSetAmount = (val: number) => {
    setAmount(val);
    setErrorMsg('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCustom) {
      if (!customAccountNumber.trim()) {
        setErrorMsg('Vui lòng nhập Số tài khoản ngân hàng thụ hưởng.');
        return;
      }
      if (!customAccountHolder.trim()) {
        setErrorMsg('Vui lòng nhập Tên chủ tài khoản.');
        return;
      }
    } else if (!selectedAccount) {
      setErrorMsg('Vui lòng chọn tài khoản ngân hàng thụ hưởng.');
      return;
    }

    if (amount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }
    if (amount < 100000) {
      setErrorMsg('Hạn mức rút tiền tối thiểu là 100,000 đ.');
      return;
    }
    if (amount > currentBalance) {
      setErrorMsg(`Số dư khả dụng không đủ (${currentBalance.toLocaleString('vi-VN')} đ).`);
      return;
    }

    setErrorMsg('');
    setStep('confirm');
    setOtp('');
  };

  const handleConfirmWithdraw = () => {
    if (otp !== '123456') {
      setErrorMsg('Mã OTP không chính xác. Vui lòng nhập mã test 123456.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      const success = withdrawMoney({
        bankName: activeBankName,
        accountNumber: activeAccountNumber,
        accountHolder: activeAccountHolder,
        amount,
        saveToProfile: isCustom && saveToProfile
      });

      setIsProcessing(false);
      if (success) {
        setLastTxId(`NAPAS-${Date.now().toString().slice(-8)}`);
        setStep('success');
      }
    }, 700);
  };

  const handleClose = () => {
    setStep('form');
    setErrorMsg('');
    closeWithdrawModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 relative my-8 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 text-white relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
          
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <i className="fa-solid fa-wallet text-xs" />
            <span>Cổng Thanh Toán & Ví TalentMatch</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold">Rút Tiền Về Ngân Hàng</h2>
          <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
            <span>
              Số dư ví khả dụng: <strong className="text-emerald-400 text-sm font-bold">{currentBalance.toLocaleString('vi-VN')} đ</strong>
            </span>
            <button
              type="button"
              onClick={() => setStep(step === 'history' ? 'form' : 'history')}
              className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
            >
              {step === 'history' ? '← Quay lại rút tiền' : 'Xem lịch sử rút tiền'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2 text-xs font-semibold">
              <i className="fa-solid fa-circle-exclamation text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW: Transaction History */}
          {step === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-blue-600" />
                  <span>Lịch Sử Lệnh Rút Tiền ({userWithdrawalHistory.length})</span>
                </h3>
                <span className="text-[11px] text-slate-500">Chuyển khoản Napas 24/7</span>
              </div>

              {userWithdrawalHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-lg border border-slate-200">
                  <i className="fa-solid fa-receipt text-2xl text-slate-300 mx-auto mb-2 block" />
                  <span>Chưa có lệnh rút tiền nào được thực hiện.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userWithdrawalHistory.map((tx) => (
                    <div key={tx.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">{tx.transactionNo}</span>
                        <span className="text-emerald-700 font-bold font-mono">
                          -{tx.amount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">{tx.description}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span>{tx.payDate}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Thành công</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                ← Quay Lại Màn Hình Rút Tiền
              </button>
            </div>
          )}

          {/* STEP 1: Withdrawal Form */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              {/* Account Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">1. Tài khoản ngân hàng nhận tiền:</label>
                  <button
                    type="button"
                    onClick={() => {
                      closeWithdrawModal();
                      openUserProfileModal();
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    Quản lý STK hồ sơ
                  </button>
                </div>

                {/* Pre-registered options if available */}
                {registeredAccounts.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {registeredAccounts.map((acc) => {
                      const isSelected = selectedAccountId === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedAccountId(acc.id)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-base">🏦</span>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{acc.bankName}</div>
                              <div className="text-[11px] text-slate-600 font-mono">
                                STK: <strong>{acc.accountNumber}</strong> • {acc.accountHolder}
                              </div>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <i className="fa-solid fa-check text-[9px]" />}
                          </div>
                        </div>
                      );
                    })}

                    {/* Option to enter a different account */}
                    <div
                      onClick={() => setSelectedAccountId('custom')}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-semibold ${
                        isCustom
                          ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 text-blue-900'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-plus text-xs" />
                        <span>Nhập tài khoản ngân hàng thụ hưởng khác</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isCustom ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isCustom && <i className="fa-solid fa-check text-[9px]" />}
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct bank input form (Shown if custom selected or no accounts registered) */}
                {isCustom && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chọn Ngân hàng thụ hưởng:</label>
                      <select
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      >
                        {VIETNAM_BANKS.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.logo} {b.shortName} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số tài khoản (STK):</label>
                        <input
                          type="text"
                          value={customAccountNumber}
                          onChange={(e) => setCustomAccountNumber(e.target.value)}
                          placeholder="Nhập số tài khoản"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên chủ tài khoản (In hoa):</label>
                        <input
                          type="text"
                          value={customAccountHolder}
                          onChange={(e) => setCustomAccountHolder(e.target.value)}
                          placeholder="VD: NGUYEN VAN A"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold uppercase focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Lưu thông tin tài khoản này vào Hồ sơ cá nhân để dùng lại lần sau</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">2. Số tiền muốn rút (VNĐ):</label>
                  <button
                    type="button"
                    onClick={() => handleSetAmount(currentBalance)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    Rút toàn bộ ({currentBalance.toLocaleString('vi-VN')} đ)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={100000}
                    max={currentBalance}
                    value={amount}
                    onChange={(e) => handleSetAmount(Number(e.target.value))}
                    className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700 text-base focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <span className="absolute right-4 top-3 font-bold text-slate-400 text-xs">VNĐ</span>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[500000, 1000000, 2000000, 5000000, 10000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSetAmount(val)}
                      disabled={val > currentBalance}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {(val / 1000000) >= 1 ? `${(val / 1000000)} Triệu` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Policy note */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                <i className="fa-solid fa-shield-halved text-emerald-600 text-xs shrink-0 mt-0.5" />
                <span>
                  Chuyển khoản trực tiếp qua Napas 24/7 nhận tiền trong 1-3 phút. <strong>Miễn phí 100%</strong> phí giao dịch nền tảng.
                </span>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={currentBalance <= 0 || (isCustom && !customAccountNumber.trim())}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Tiếp Tục Xác Nhận</span>
                  <i className="fa-solid fa-arrow-right text-[10px]" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Confirm with OTP */}
          {step === 'confirm' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Xác nhận lệnh rút tiền Napas 24/7
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>Ngân hàng thụ hưởng:</div>
                  <div className="font-bold text-slate-900 text-right">{activeBankName}</div>

                  <div>Số tài khoản:</div>
                  <div className="font-mono font-bold text-slate-900 text-right">{activeAccountNumber}</div>

                  <div>Chủ tài khoản:</div>
                  <div className="font-bold text-slate-900 text-right">{activeAccountHolder}</div>

                  <div>Số tiền rút:</div>
                  <div className="font-bold text-emerald-700 font-mono text-sm text-right">
                    {amount.toLocaleString('vi-VN')} đ
                  </div>

                  <div>Phí rút tiền:</div>
                  <div className="text-emerald-700 font-bold text-right">0 đ (Miễn phí)</div>

                  <div>Số dư sau khi rút:</div>
                  <div className="font-mono text-slate-700 text-right">
                    {(currentBalance - amount).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-2 pt-1">
                <label className="block font-bold text-slate-800">
                  Nhập mã xác thực OTP bảo mật:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập 6 số OTP (test: 123456)"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-base focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setOtp('123456')}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-[11px] cursor-pointer shrink-0"
                  >
                    Điền mã test
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Mã OTP thử nghiệm nhanh: <strong className="text-emerald-700 font-mono">123456</strong>
                </p>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  ← Sửa lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWithdraw}
                  disabled={isProcessing || !otp}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang chuyển khoản...</span>
                    </>
                  ) : (
                    <span>Xác Nhận Rút Tiền</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 'success' && (
            <div className="p-4 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <i className="fa-solid fa-check text-2xl" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Lệnh Rút Tiền Thành Công!</h3>
                <p className="text-xs text-slate-600">
                  Hệ thống Napas 24/7 đã thực hiện chuyển khoản tới ngân hàng thụ hưởng của bạn.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã giao dịch:</span>
                  <span className="font-mono font-bold text-slate-800">{lastTxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền đã rút:</span>
                  <span className="font-bold text-emerald-700 font-mono">{amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-semibold text-slate-800">{activeBankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <span className="font-mono font-semibold text-slate-800">{activeAccountNumber}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Số dư khả dụng mới:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {(currentBalance).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('history')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Xem Lịch Sử Giao Dịch
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Hoàn Tất
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
