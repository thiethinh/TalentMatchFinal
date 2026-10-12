import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { User, Role } from '../../types';
import { formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Lock, Unlock, Users, Shield } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);

    apiClient
      .get(`/admin/users?${params.toString()}`)
      .then((res) => {
        setUsers(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleLock = async (id: number) => {
    try {
      const res = await apiClient.post(`/admin/users/${id}/lock`);
      alert(res.data?.message || 'Cập nhật trạng thái khóa thành công!');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Quản lý Tài khoản Người dùng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kiểm soát phân quyền, khóa và mở khóa tài khoản sàn</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="CUSTOMER">Doanh nghiệp (Customer)</option>
            <option value="FREELANCER">Nhân tài (Freelancer)</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <Button variant="primary" size="sm" type="submit">
          Tìm kiếm
        </Button>
      </form>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách người dùng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Người dùng</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày đăng ký</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={u.role === 'ADMIN' ? 'purple' : u.role === 'CUSTOMER' ? 'brand' : 'neutral'}
                        size="sm"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.locked ? (
                        <Badge variant="danger" size="sm">
                          Đã khóa
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          Hoạt động
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(u.createdAt || '')}</td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant={u.locked ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => toggleLock(u.id)}
                          className={u.locked ? 'text-emerald-700' : 'text-rose-600 hover:bg-rose-50 border-rose-200'}
                        >
                          {u.locked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5 mr-1" /> Mở khóa
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 mr-1" /> Khóa
                            </>
                          )}
                        </Button>
                      )}
                    </td>
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
