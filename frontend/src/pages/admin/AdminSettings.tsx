import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';

export const AdminSettings: React.FC = () => {
  const { platformConfig, updatePlatformConfig } = useApp();

  // Settings State
  const [feePercent, setFeePercent] = useState(platformConfig.platformFeePercent);
  const [autoAcceptHours, setAutoAcceptHours] = useState(platformConfig.autoAcceptHours);
  const [minDeposit, setMinDeposit] = useState(platformConfig.minDepositAmount);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setFeePercent(platformConfig.platformFeePercent);
    setAutoAcceptHours(platformConfig.autoAcceptHours);
    setMinDeposit(platformConfig.minDepositAmount);
  }, [platformConfig]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await updatePlatformConfig({
        platformFeePercent: Number(feePercent),
        autoAcceptHours: Number(autoAcceptHours),
        minDepositAmount: Number(minDeposit),
        disputeResolutionDays: platformConfig.disputeResolutionDays || 3
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      alert('Không thể lưu cài đặt. Vui lòng thử lại!');
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Header */}
      <AdminHeader
        title="Cài Đặt Hệ Thống & Cổng Thanh Toán"
        subtitle="Cấu hình tham số nền tảng, tỷ lệ khấu trừ phí sàn tự động, thời gian tự động nghiệm thu Escrow và tích hợp VNPay."
        icon="fa-gear"
      />

      {/* Main Settings Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <i className="fa-solid fa-sliders text-purple-600 text-sm" />
            <span>Tham Số Nền Tảng TalentMatch</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Các giá trị này áp dụng trực tiếp cho tất cả các hợp đồng, thanh toán và xử lý đơn hàng mới.
          </p>
        </div>

        <div className="p-5 sm:p-6 max-w-2xl">
          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            {/* Fee Percent */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Phần trăm phí nền tảng sàn (% Platform Fee):
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={feePercent}
                  onChange={(e) => setFeePercent(Number(e.target.value))}
                  className="w-32 p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-purple-700 text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
                <span className="font-bold text-slate-700 text-xs">
                  % (Mặc định: 10% tính trên tổng giá trị hợp đồng khi hoàn tất)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Số tiền phí sẽ được hệ thống tự động trích lại vào ví doanh thu của sàn khi nghiệm thu.
              </p>
            </div>

            {/* Auto Accept SLA */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Thời gian đếm ngược tự động nghiệm thu (Giờ):
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={24}
                  max={336}
                  value={autoAcceptHours}
                  onChange={(e) => setAutoAcceptHours(Number(e.target.value))}
                  className="w-32 p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
                <span className="font-bold text-slate-700 text-xs">
                  Giờ (Mặc định: 72 giờ = 3 ngày làm việc)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sau khi Freelancer bàn giao sản phẩm, nếu Khách hàng không phản hồi trong khoảng thời gian này, hệ thống sẽ tự động giải ngân.
              </p>
            </div>

            {/* Min Escrow Deposit */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Mức nạp cọc tối thiểu vào Escrow (VND):
              </label>
              <input
                type="number"
                min={50000}
                step={50000}
                value={minDeposit}
                onChange={(e) => setMinDeposit(Number(e.target.value))}
                className="w-full max-w-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 font-mono text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Giới hạn nạp tối thiểu để tránh các giao dịch siêu nhỏ qua cổng thanh toán.
              </p>
            </div>

            {/* VNPay Gateway Configuration Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-emerald-600" />
                <span>Thông tin tích hợp Cổng VNPay Sandbox:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Hoạt động 24/7
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                <div>vnp_TmnCode: <strong className="text-slate-900">TALENTMATCH_SANDBOX</strong></div>
                <div>vnp_HashSecret: <strong className="text-slate-900">9704198526191432152SECRETKEY</strong></div>
                <div>vnp_Url: <span className="text-blue-600">https://sandbox.vnpayment.vn/paymentv2/vpcpay.html</span></div>
                <div>vnp_ReturnUrl: <span className="text-slate-500">http://localhost:5173/contracts?vnpay=return</span></div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="py-2.5 px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin" />
                    <span>Đang lưu cấu hình...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    <span>Lưu Cấu Hình Hệ Thống</span>
                  </>
                )}
              </button>

              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                  <i className="fa-solid fa-circle-check" />
                  <span>Đã lưu thành công vào MySQL!</span>
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
