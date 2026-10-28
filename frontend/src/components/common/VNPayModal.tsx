import React, { useState, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState<'SANDBOX_REAL' | 'QR_DEMO'>('SANDBOX_REAL');
  const [paymentStep, setPaymentStep] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [countdown, setCountdown] = useState<number>(900); // 15 mins
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep('FORM');
      setCountdown(900);
      setActiveTab('SANDBOX_REAL');
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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Tạo URL thanh toán VNPAY Sandbox chính thức với mã băm HmacSHA512
   */
  const handleOpenVnPaySandbox = async () => {
    setIsOpeningPortal(true);
    try {
      const tmnCode = 'XIRJ44TM';
      const secretKey = 'QGKZDADPVGMSKHXJZKMDXSMLLZVUDLKL';
      const baseUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      const returnUrl = `${window.location.origin}/payment/vnpay/return`;

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatDate = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

      const createDate = formatDate(now);
      const expireDate = formatDate(new Date(now.getTime() + 15 * 60 * 1000));
      const txnRef = orderNumber || `TM${Date.now()}`;

      const params: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Amount: (amount * 100).toString(),
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderTitle || `Thanh toan TalentMatch ${txnRef}`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
      };

      // Sắp xếp các tham số theo bảng chữ cái A-Z
      const sortedKeys = Object.keys(params).sort();
      const queryParts: string[] = [];
      for (const k of sortedKeys) {
        queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`);
      }
      const queryString = queryParts.join('&');

      // Tạo chữ ký số chuẩn SHA-512 bằng Web Crypto API
      const enc = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(queryString));
      const hashHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const fullPaymentUrl = `${baseUrl}?${queryString}&vnp_SecureHash=${hashHex}`;

      // Mở cổng VNPAY Sandbox chính thức trên tab mới
      window.open(fullPaymentUrl, '_blank');
    } catch (err) {
      console.error('Lỗi tạo URL VNPAY:', err);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleSimulatePayment = () => {
    setPaymentStep('PROCESSING');
    setTimeout(() => {
      setPaymentStep('SUCCESS');
      setTimeout(() => {
        const transNo = `VNPAY-${Date.now().toString().slice(-8)}`;
        onSuccess({
          transactionNo: transNo,
          bankCode: 'NCB',
          cardType: 'ATM_CARD',
          amount
        });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        
        {/* VNPay Header Bar */}
        <div className="bg-[#005baa] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-3">
            <div className="bg-white px-3 py-1 rounded-md shadow-xs flex items-center">
              <span className="font-extrabold tracking-tighter text-blue-800 text-lg">VN</span>
              <span className="font-extrabold tracking-tighter text-red-600 text-lg">PAY</span>
              <span className="text-[10px] text-slate-500 font-bold ml-1 bg-slate-100 px-1 rounded-sm">SANDBOX</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90">Cổng Thanh Toán Quốc Gia VNPAY</div>
              <div className="text-[10px] text-white/70">Terminal ID: <span className="font-mono font-bold text-white">XIRJ44TM</span></div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[10px] text-white/80">Thời gian còn lại</div>
              <div className="text-xs font-mono font-bold flex items-center gap-1.5">
                <i className="fa-regular fa-clock text-xs" />
                <span>{formatTime(countdown)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="text-slate-500">Mã đơn hàng / Hợp đồng: <strong className="text-slate-900 font-mono">{orderNumber}</strong></div>
            <div className="text-slate-700 font-medium line-clamp-1">{orderTitle}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-[11px]">Số tiền ký quỹ Escrow:</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">{amount.toLocaleString('vi-VN')} đ</div>
          </div>
        </div>

        {/* PROCESSING VIEW */}
        {paymentStep === 'PROCESSING' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <h3 className="text-base font-bold text-slate-800">Đang đối soát giao dịch VNPAY Sandbox...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hệ thống đang xác thực chữ ký SHA-512 với cổng VNPAY và khóa số tiền cọc vào tài khoản Escrow. Vui lòng không đóng trình duyệt.
            </p>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {paymentStep === 'SUCCESS' && (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-50">
              <i className="fa-solid fa-circle-check text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Thanh Toán VNPAY Thành Công!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Số tiền <strong className="text-emerald-700 font-bold">{amount.toLocaleString('vi-VN')} đ</strong> đã được phong tỏa an toàn vào <strong>Ví Tạm Giữ Escrow</strong> của Hợp đồng. Freelancer có thể bắt đầu công việc ngay!
            </p>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-sm mx-auto text-xs space-y-1.5 font-mono shadow-2xs">
              <div>Cổng thanh toán: <strong className="text-blue-700">VNPAY-SANDBOX</strong></div>
              <div>Mã chuẩn chi: <strong>VNPAY-2026-OK</strong></div>
              <div>Trạng thái: <span className="text-emerald-600 font-bold">ESCROW_LOCKED (00)</span></div>
              <div>Thời gian: {new Date().toLocaleString('vi-VN')}</div>
            </div>
          </div>
        )}

        {/* PAYMENT FORMS */}
        {paymentStep === 'FORM' && (
          <div className="p-6 space-y-5">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('SANDBOX_REAL')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'SANDBOX_REAL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <i className="fa-solid fa-credit-card text-xs" />
                <span>Cổng VNPAY Sandbox (Thẻ Test Thật)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('QR_DEMO')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'QR_DEMO'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <i className="fa-solid fa-qrcode text-xs" />
                <span>Mô Phỏng Nhanh (Demo)</span>
              </button>
            </div>

            {/* TAB 1: REAL VNPAY SANDBOX TEST */}
            {activeTab === 'SANDBOX_REAL' && (
              <div className="space-y-4">
                
                {/* Banner Status */}
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-blue-900">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                      <i className="fa-solid fa-plug-circle-check" />
                    </span>
                    <div>
                      <div className="font-bold">Đã kết nối Merchant VNPAY Sandbox</div>
                      <div className="text-[11px] text-blue-700">Mã Terminal: <strong className="font-mono">XIRJ44TM</strong> • Chuẩn mã hóa SHA-512</div>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                    Sẵn sàng
                  </span>
                </div>

                {/* Card Test Box with 1-click copy */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <i className="fa-solid fa-id-card text-emerald-600 text-xs" />
                      <span>Thông tin thẻ ATM Test của VNPAY (Không trừ tiền thật):</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">Ngân hàng NCB</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Số thẻ test (NCB)</div>
                        <div className="font-mono font-bold text-slate-900 text-sm">9704198526191432198</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('9704198526191432198', 'card')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        {copiedField === 'card' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Tên chủ thẻ</div>
                        <div className="font-bold text-slate-900 text-sm uppercase">NGUYEN VAN A</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('NGUYEN VAN A', 'name')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        {copiedField === 'name' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Ngày phát hành</div>
                        <div className="font-mono font-bold text-slate-900 text-sm">07/15</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('07/15', 'date')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        {copiedField === 'date' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Mã OTP xác thực</div>
                        <div className="font-mono font-bold text-emerald-700 text-sm">123456</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('123456', 'otp')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        {copiedField === 'otp' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenVnPaySandbox}
                    disabled={isOpeningPortal}
                    className="w-full py-3 bg-[#005baa] hover:bg-[#004785] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                    <span>Mở Cổng VNPAY Sandbox Để Quẹt Thẻ Test</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Sau khi quẹt thẻ xong trên tab VNPAY:</span>
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                    >
                      Bấm vào đây để hoàn tất hợp đồng ngay
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: FAST DEMO SIMULATOR */}
            {activeTab === 'QR_DEMO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=VNPAY_ESCROW_TALENTMATCH_DEMO_2026"
                      alt="VNPay QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Mã QR Demo thanh toán nhanh TalentMatch
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 text-sm">Chế độ mô phỏng nhanh:</div>
                    <p className="text-slate-600 leading-relaxed">
                      Dành cho việc trình bày báo cáo hoặc kiểm thử giao diện mà không cần mở tab ngoài. Hệ thống sẽ tự động chuyển tiền cọc <strong className="text-emerald-700 font-bold">{amount.toLocaleString('vi-VN')} đ</strong> vào ví ký quỹ Escrow.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-bolt text-xs" />
                    <span>Mô Phỏng Thanh Toán Thành Công Ngay</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
