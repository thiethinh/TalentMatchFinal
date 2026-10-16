import React, { useState, useEffect } from 'react';
import { useDemo } from '../../context/DemoContext';

export const WithdrawModal: React.FC = () => {
  const {
    currentUser,
    isWithdrawModalOpen,
    closeWithdrawModal,
    openUserProfileModal,
    withdrawMoney
  } = useDemo();

  const registeredAccounts = currentUser.bankAccounts || [];
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [amount, setAmount] = useState<number>(1000000);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (registeredAccounts.length > 0) {
      const defaultAcc = registeredAccounts.find(a => a.isDefault) || registeredAccounts[0];
      setSelectedAccountId(defaultAcc.id);
    } else {
      setSelectedAccountId('');
    }
  }, [currentUser, isWithdrawModalOpen]);

  if (!isWithdrawModalOpen) return null;

  const currentBalance = currentUser.balance || 0;
  const selectedAccount = registeredAccounts.find(a => a.id === selectedAccountId) || registeredAccounts[0];

  const handleSetAmount = (val: number) => {
    setAmount(val);
    setErrorMsg('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) {
      setErrorMsg('Vui lòng chọn tài khoản ngân hàng thụ hưởng đã đăng ký.');
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
    if (!selectedAccount) return;
    setIsProcessing(true);
    setTimeout(() => {
      const success = withdrawMoney({
        bankName: selectedAccount.bankName,
        accountNumber: selectedAccount.accountNumber,
        accountHolder: selectedAccount.accountHolder,
        amount
      });

      setIsProcessing(false);
      if (success) {
        setStep('success');
      }
    }, 800);
  };

  const handleClose = () => {
    setStep('form');
    setErrorMsg('');
    closeWithdrawModal();
  };

  const handleOpenProfile = () => {
    closeWithdrawModal();
    openUserProfileModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-100 relative my-8 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 text-white relative">
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
          <div className="text-xs text-slate-300 mt-1">
            Số dư ví khả dụng hiện tại: <strong className="text-white text-sm font-bold">{currentBalance.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>

        {/* If no bank accounts registered in profile */}
        {registeredAccounts.length === 0 ? (
          <div className="p-7 text-center space-y-5">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-md flex items-center justify-center mx-auto ring-4 ring-amber-50">
              <i className="fa-solid fa-building-columns text-2xl" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Chưa Đăng Ký Tài Khoản Ngân Hàng</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Theo quy định an toàn tài chính và bảo mật thông tin, bạn <strong>phải đăng ký tài khoản ngân hàng thụ hưởng trước trong phần Hồ Sơ Cá Nhân</strong> trước khi thực hiện lệnh rút tiền.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-left text-xs space-y-2 text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-emerald-600 text-xs" />
                <span>Quy trình bảo mật rút tiền:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li>Đăng ký và xác thực STK ngân hàng thụ hưởng tại mục Hồ sơ.</li>
                <li>Hệ thống lưu trữ cố định nhằm tránh việc nhầm lẫn STK khi rút tiền.</li>
                <li>Hỗ trợ chuyển khoản liên ngân hàng Napas 24/7 nhận tiền tức thì.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md text-xs transition-all cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleOpenProfile}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Đến Hồ Sơ Đăng Ký Ngân Hàng</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Form with Pre-registered Accounts */}
            {step === 'form' && (
              <form onSubmit={handleFormSubmit} className="p-6 sm:p-7 space-y-4 text-xs">
                
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 flex items-center gap-2 font-bold">
                    <i className="fa-solid fa-circle-exclamation text-rose-600 text-xs shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Pre-registered Bank Accounts Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      1. Chọn tài khoản ngân hàng thụ hưởng:
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenProfile}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-credit-card text-xs" />
                      <span>Quản lý STK trong hồ sơ</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {registeredAccounts.map((acc) => {
                      const isSelected = selectedAccount?.id === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedAccountId(acc.id)}
                          className={`p-3.5 rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              🏦
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{acc.bankName}</span>
                                {acc.isDefault && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                                STK: <strong className="text-slate-900 font-bold">{acc.accountNumber}</strong> • {acc.accountHolder}
                              </div>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <i className="fa-solid fa-check text-[10px]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">2. Số tiền muốn rút (VND):</label>
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
                      className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-bold text-emerald-700 text-base focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                    <span className="absolute right-4 top-3 font-bold text-slate-400 text-xs">VNĐ</span>
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[1000000, 2000000, 5000000, 10000000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSetAmount(val)}
                        disabled={val > currentBalance}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          amount === val
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        {(val / 1000000).toFixed(0)} Triệu
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-emerald-50/60 p-3 rounded-md border border-emerald-100 text-[11px] text-emerald-900 flex items-start space-x-2">
                  <i className="fa-solid fa-shield-halved text-emerald-600 text-xs shrink-0 mt-0.5" />
                  <span>
                    Chuyển khoản trực tiếp tới STK đã đăng ký qua cổng Napas 24/7 trong 1-3 phút. Hoàn toàn <strong>miễn phí giao dịch</strong>.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={currentBalance <= 0 || !selectedAccount}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Tiếp tục xác nhận</span>
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </button>
                </div>

              </form>
            )}

            {/* Step 2: Confirmation & OTP */}
            {step === 'confirm' && selectedAccount && (
              <div className="p-6 sm:p-7 space-y-5 text-xs">
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center justify-between">
                    <span>Xác Nhận Lệnh Rút Tiền</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Đã xác minh STK</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ngân hàng thụ hưởng:</span>
                    <strong className="text-slate-900 font-bold">{selectedAccount.bankName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Số tài khoản thụ hưởng:</span>
                    <strong className="text-slate-900 font-mono font-bold">{selectedAccount.accountNumber}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Chủ tài khoản:</span>
                    <strong className="text-slate-900 font-bold uppercase">{selectedAccount.accountHolder}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
                    <span className="font-bold text-slate-900">Số tiền rút:</span>
                    <strong className="text-emerald-700 font-bold text-base">{amount.toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Phí rút sàn TalentMatch:</span>
                    <span className="text-emerald-600 font-bold">0 đ (Miễn phí)</span>
                  </div>
                </div>

                {/* OTP verification */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-800">
                    Mã xác thực giao dịch OTP:
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-lock text-slate-400 text-xs absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Nhập 6 số OTP"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-mono font-bold text-center tracking-widest text-base focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmWithdraw}
                    disabled={isProcessing || otp.length < 4}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? <span>Đang xử lý ngân hàng...</span> : <span>Xác nhận rút tiền</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 'success' && selectedAccount && (
              <div className="p-8 text-center space-y-4 text-xs">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                  <i className="fa-solid fa-circle-check text-3xl" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lệnh Rút Tiền Thành Công!</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Số tiền <strong className="text-emerald-700">{amount.toLocaleString('vi-VN')} đ</strong> đã được chuyển về tài khoản <strong>{selectedAccount.bankName} - {selectedAccount.accountNumber}</strong> ({selectedAccount.accountHolder}).
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 text-left text-[11px] text-slate-600 space-y-1">
                  <div>• Mã giao dịch Napas: <span className="font-mono font-bold text-slate-900">NAPAS-{Date.now().toString().slice(-8)}</span></div>
                  <div>• Trạng thái: <span className="text-emerald-700 font-bold">Thành công (Đã tất toán)</span></div>
                  <div>• Số dư ví còn lại: <span className="font-bold text-slate-900">{(currentUser.balance || 0).toLocaleString('vi-VN')} đ</span></div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-all shadow-xs cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

