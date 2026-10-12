import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Clock
} from 'lucide-react';

interface VNPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderNumber?: string;
  orderTitle?: string;
  onSuccess: (transactionData: {
    transactionNo: string;
    bankCode: string;
    cardType: string;
    amount: number;
  }) => void;
}

export const VNPayModal: React.FC<VNPayModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderNumber = 'TM-2026-VNPAY',
  orderTitle = 'Nạp cọc Hợp đồng Escrow TalentMatch',
  onSuccess
}) => {
  const [paymentStep, setPaymentStep] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [countdown, setCountdown] = useState<number>(900); // 15 mins

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep('FORM');
      setCountdown(900);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = () => {
    setPaymentStep('PROCESSING');
    setTimeout(() => {
      setPaymentStep('SUCCESS');
      setTimeout(() => {
        const transNo = `VNPAY-${Date.now().toString().slice(-8)}`;
        onSuccess({
          transactionNo: transNo,
          bankCode: 'VNPAYQR',
          cardType: 'QR_CODE',
          amount
        });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative my-6">
        
        {/* VNPay Header Bar */}
        <div className="bg-gradient-to-r from-red-700 via-rose-600 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white px-3 py-1 rounded-lg shadow-xs flex items-center">
              <span className="font-extrabold tracking-tighter text-blue-800 text-lg">VN</span>
              <span className="font-extrabold tracking-tighter text-red-600 text-lg">PAY</span>
              <span className="text-[10px] text-slate-500 font-bold ml-1 bg-slate-100 px-1 rounded">SANDBOX</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90">Cổng Thanh Toán Quốc Gia VNPAY</div>
              <div className="text-[10px] text-white/70">Bảo mật chuẩn PCI-DSS Level 1</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[10px] text-white/80">Thời gian còn lại</div>
              <div className="text-xs font-mono font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(countdown)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="text-slate-500">Mã đơn hàng / Hợp đồng: <strong className="text-slate-900 font-mono">{orderNumber}</strong></div>
            <div className="text-slate-700 font-medium line-clamp-1">{orderTitle}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500">Số tiền thanh toán:</div>
            <div className="text-lg font-extrabold text-red-600">{amount.toLocaleString('vi-VN')} đ</div>
          </div>
        </div>

        {/* PROCESSING VIEW */}
        {paymentStep === 'PROCESSING' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <h3 className="text-lg font-bold text-slate-800">Đang kết nối & xử lý giao dịch VNPAY...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hệ thống đang xác thực mã giao dịch với ngân hàng phát hành và khóa tiền cọc vào tài khoản Escrow. Vui lòng không đóng trình duyệt.
            </p>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {paymentStep === 'SUCCESS' && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Thanh Toán VNPAY Thành Công!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Số tiền <strong className="text-emerald-700 font-bold">{amount.toLocaleString('vi-VN')} đ</strong> đã được nạp an toàn vào <strong>Ví Tạm Giữ Escrow</strong> của Hợp đồng. Freelancer có thể bắt đầu công việc ngay lập tức!
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-sm mx-auto text-xs space-y-1 font-mono">
              <div>Phương thức: <strong className="text-blue-700">VNPAY-QR Code</strong></div>
              <div>Mã chuẩn chi: <strong>VNPAY-2026-OK</strong></div>
              <div>Trạng thái: <span className="text-emerald-600 font-bold">ESCROW_FUNDED (00)</span></div>
              <div>Thời gian: {new Date().toLocaleString('vi-VN')}</div>
            </div>
          </div>
        )}

        {/* VNPAY-QR PAYMENT FORM */}
        {paymentStep === 'FORM' && (
          <div className="p-6 space-y-6">
            
            {/* VNPAY-QR Header Banner */}
            <div className="flex items-center gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-xs">Thanh toán tức thì qua VNPAY-QR</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Hỗ trợ quét mã trực tiếp trên 40+ ứng dụng Ngân hàng (VCB, MB, Techcombank, Vietinbank, BIDV, ACB...) và ví VNPAY.
                </div>
              </div>
            </div>

            {/* VNPAY-QR Content Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-center relative group">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=VNPAY_ESCROW_TALENTMATCH_DEMO_2026"
                    alt="VNPay QR Code"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <span className="text-xs bg-white text-blue-800 font-bold px-2 py-1 rounded shadow">Mã QR Demo</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Mở ứng dụng Mobile Banking của bạn và chọn <strong>Quét mã QR</strong>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-sm">Hướng dẫn thanh toán qua VNPay-QR:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Mở App ngân hàng (VCB, MB, Techcombank, BIDV, Agribank...)</li>
                    <li>Chọn chức năng <strong>Quét QR (QR Pay)</strong></li>
                    <li>Quét mã QR bên cạnh và xác nhận số tiền <strong>{amount.toLocaleString('vi-VN')} đ</strong></li>
                    <li>Tiền sẽ được nạp trực tiếp vào <strong>Ví Tạm Giữ Escrow</strong></li>
                  </ol>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Hệ thống Escrow tự động phong tỏa tiền cọc và chỉ giải ngân sau khi bạn nghiệm thu sản phẩm.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-700 hover:to-blue-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>[ Mô Phỏng Quét QR & Thanh Toán Ngay ]</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
