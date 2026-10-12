import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { Project, Milestone } from '../types';
import { formatCurrency } from '../utils/format';
import { Button } from '../components/ui/Button';
import { ShieldCheck, CreditCard, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const milestoneId = searchParams.get('milestoneId');
  const [project, setProject] = useState<Project | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState('ESCROW_DEMO');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = milestoneId
      ? `/payment/project/${id}?milestoneId=${milestoneId}`
      : `/payment/project/${id}`;
    apiClient
      .get(url)
      .then((res) => {
        setProject(res.data.project);
        setMilestone(res.data.milestone || null);
        setAmount(res.data.amount || 0);
      })
      .catch((err) => {
        alert(err.message || 'Không thể tải thông tin thanh toán.');
        navigate(`/projects/${id}`);
      })
      .finally(() => setLoading(false));
  }, [id, milestoneId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await apiClient.post(`/payment/project/${id}`, {
        milestoneId: milestoneId ? Number(milestoneId) : null,
        method,
      });
      setSuccessCode(res.data.transactionCode);
    } catch (err: any) {
      alert(err.message || 'Thanh toán thất bại.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
        Đang chuẩn bị hóa đơn thanh toán ký quỹ...
      </div>
    );
  }

  if (successCode) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Thanh toán Ký quỹ thành công!</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Ngân sách đã được giữ an toàn trong tài khoản bảo chứng Escrow của sàn. Số tiền chỉ được giải ngân cho Freelancer khi bạn nghiệm thu sản phẩm.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
          Mã giao dịch: <span className="font-bold text-slate-900">{successCode}</span>
        </div>
        <div className="pt-2">
          <Button variant="primary" onClick={() => navigate(`/projects/${id}`)}>
            Quay lại dự án
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/projects/${id}`}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ký quỹ dự án an toàn (Escrow Checkout)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Bảo vệ vốn doanh nghiệp & cam kết bàn giao</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Project Summary */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dự án</p>
              <h2 className="text-sm font-bold text-slate-900">{project?.application?.job?.title || 'Hợp đồng dự án'}</h2>
            </div>
            <span className="text-sm font-bold text-blue-600">{formatCurrency(amount)}</span>
          </div>
          {milestone && (
            <p className="text-xs text-slate-600">
              Thanh toán cho cột mốc: <span className="font-semibold text-slate-900">{milestone.title}</span>
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-900">Phương thức nạp ký quỹ</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod('ESCROW_DEMO')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                method === 'ESCROW_DEMO'
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Ký quỹ Sandbox (Mô phỏng)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Xác nhận thanh toán bảo chứng tức thì</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('VNPAY')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                method === 'VNPAY'
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <Lock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">VNPay Gateway</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Cổng thanh toán ngân hàng nội địa</p>
              </div>
            </button>
          </div>
        </div>

        {/* Security guarantee */}
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            Số tiền được lưu ký an toàn tại sàn TalentMatch cho đến khi hai bên hoàn thành nghiệm thu sản phẩm.
          </span>
        </div>

        <div className="pt-2">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            loading={paying}
            onClick={handlePay}
          >
            Xác nhận ký quỹ {formatCurrency(amount)}
          </Button>
        </div>
      </div>
    </div>
  );
};
