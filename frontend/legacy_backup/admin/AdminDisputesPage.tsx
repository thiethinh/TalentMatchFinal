import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Project } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Scale, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

export const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = () => {
    setLoading(true);
    apiClient
      .get('/admin/disputes')
      .then((res) => {
        setDisputes(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (approveRefund: boolean) => {
    if (!selectedProject || !note.trim()) {
      alert('Vui lòng nhập lý do / ghi chú phán quyết.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post(
        `/admin/disputes/${selectedProject.id}/resolve?approveDemoRefund=${approveRefund}&note=${encodeURIComponent(
          note.trim()
        )}`
      );
      alert(res.data?.message || 'Đã phân xử tranh chấp thành công.');
      setSelectedProject(null);
      setNote('');
      fetchDisputes();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý tranh chấp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Hội đồng Trọng tài & Tranh chấp (Disputes)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Phân xử khiếu nại giữa Doanh nghiệp và Freelancer, quyết định hoàn tiền hoặc tiếp tục</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách khiếu nại...</div>
        ) : disputes.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Hiện không có hợp đồng nào xảy ra tranh chấp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mã HĐ</th>
                  <th className="py-3 px-4">Dự án</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Freelancer</th>
                  <th className="py-3 px-4">Ngân sách</th>
                  <th className="py-3 px-4">Lý do hủy/khiếu nại</th>
                  <th className="py-3 px-4 text-right">Phân xử</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disputes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">#{p.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      <Link to={`/projects/${p.id}`} className="hover:text-blue-600">
                        {p.application?.job?.title || 'Dự án'}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.customer?.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.freelancer?.fullName}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">{formatCurrency(p.totalPrice)}</td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {p.cancellationReason || 'Yêu cầu trọng tài can thiệp'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedProject(p)}
                      >
                        Phán quyết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Phán quyết tranh chấp Hợp đồng #${selectedProject.id}`}
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p>Dự án: <span className="font-bold text-slate-900">{selectedProject.application?.job?.title}</span></p>
              <p>Khách hàng: <span className="font-semibold">{selectedProject.customer?.fullName}</span></p>
              <p>Freelancer: <span className="font-semibold">{selectedProject.freelancer?.fullName}</span></p>
              <p>Ngân sách tranh chấp: <span className="font-bold text-rose-600">{formatCurrency(selectedProject.totalPrice)}</span></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Ghi chú / Căn cứ phán quyết trọng tài
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nêu rõ lý do đưa ra quyết định hoàn tiền hoặc yêu cầu tiếp tục hợp đồng..."
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="danger"
                size="sm"
                loading={submitting}
                onClick={() => handleResolve(true)}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Hủy & Hoàn tiền cho Khách
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={submitting}
                onClick={() => handleResolve(false)}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Bác khiếu nại (Tiếp tục)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
