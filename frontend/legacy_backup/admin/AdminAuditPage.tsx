import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { AdminAuditLog } from '../../types';
import { formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { FileCheck, ShieldAlert } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/audit')
      .then((res) => {
        setLogs(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Nhật ký Kiểm toán Quản trị (Audit Log)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Lưu vết tất cả thao tác can thiệp, khóa tài khoản, xử lý tranh chấp của Admin</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải nhật ký kiểm toán...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">Chưa có bản ghi nhật ký kiểm toán nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Admin thực hiện</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Đối tượng</th>
                  <th className="py-3 px-4">Mã đối tượng</th>
                  <th className="py-3 px-4">Chi tiết / Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{formatDate(log.createdAt)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{log.actorEmail}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="purple" size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{log.targetType}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">#{log.targetId}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm truncate">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
