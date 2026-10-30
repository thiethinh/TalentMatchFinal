import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Pagination } from '../../components/common/Pagination';
import type { AccountStatus } from '../../types';

export const AdminUsers: React.FC = () => {
  const { users, adminUpdateUserStatus, adminToggleEmailVerified } = useApp();

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'employer' | 'freelancer' | 'admin'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'SUSPENDED'>('ALL');
  const [userRegisteredTimeFilter, setUserRegisteredTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Modal State for user preview
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role match
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;

      // Status match
      if (userStatusFilter === 'VERIFIED' && !u.emailVerified) return false;
      if (userStatusFilter === 'UNVERIFIED' && u.emailVerified) return false;
      if (userStatusFilter === 'SUSPENDED' && u.accountStatus !== 'SUSPENDED') return false;

      // Time match
      if (userRegisteredTimeFilter !== 'all') {
        const userDate = u.createdAt ? new Date(u.createdAt).getTime() : 0;
        const now = new Date().getTime();
        if (userRegisteredTimeFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (userDate < today.getTime()) return false;
        } else if (userRegisteredTimeFilter === '7days') {
          if (now - userDate > 7 * 86400000) return false;
        } else if (userRegisteredTimeFilter === '30days') {
          if (now - userDate > 30 * 86400000) return false;
        }
      }

      // Search match
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const company = (u.companyName || '').toLowerCase();
        return name.includes(q) || email.includes(q) || company.includes(q);
      }

      return true;
    });
  }, [users, userRoleFilter, userStatusFilter, userRegisteredTimeFilter, userSearch]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [userRoleFilter, userStatusFilter, userRegisteredTimeFilter, userSearch]);

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // User distribution stats
  const stats = useMemo(() => {
    const total = users.length;
    const freelancers = users.filter((u) => u.role === 'freelancer').length;
    const employers = users.filter((u) => u.role === 'employer').length;
    const active = users.filter((u) => u.accountStatus === 'ACTIVE' || !u.accountStatus).length;
    const suspended = users.filter((u) => u.accountStatus === 'SUSPENDED').length;
    const verified = users.filter((u) => u.emailVerified).length;
    return { total, freelancers, employers, active, suspended, verified };
  }, [users]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Header */}
      <AdminHeader
        title="Quản Lý Người Dùng & Phân Quyền"
        subtitle="Kiểm soát toàn diện tài khoản Nhà tuyển dụng, Freelancer, thời điểm đăng ký, số dư ví và trạng thái kích hoạt."
        icon="fa-users"
        badge={`${users.length} tài khoản`}
      />

      {/* KPI / Distribution Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng người dùng</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{stats.total}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Toàn hệ thống</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Freelancer</div>
          <div className="text-xl font-extrabold text-blue-700 mt-1 font-mono">{stats.freelancers}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Người làm việc</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nhà tuyển dụng</div>
          <div className="text-xl font-extrabold text-purple-700 mt-1 font-mono">{stats.employers}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Khách hàng</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang hoạt động</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">{stats.active}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Trạng thái ACTIVE</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã xác thực OTP</div>
          <div className="text-xl font-extrabold text-indigo-600 mt-1 font-mono">{stats.verified}</div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Email verified</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang bị khóa</div>
          <div className="text-xl font-extrabold text-rose-600 mt-1 font-mono">{stats.suspended}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">SUSPENDED</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-table-list text-blue-600 text-sm" />
              <span>Danh Sách Người Dùng</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredUsers.length} kết quả
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tra cứu theo tên, email, vai trò, mốc thời gian hoặc trạng thái khóa/mở tài khoản.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-44">
              <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                placeholder="Tìm tên, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <select
              value={userRegisteredTimeFilter}
              onChange={(e) => setUserRegisteredTimeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Đăng ký hôm nay</option>
              <option value="7days">Đăng ký 7 ngày qua</option>
              <option value="30days">Đăng ký 30 ngày qua</option>
            </select>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="employer">Nhà tuyển dụng (Employer)</option>
              <option value="freelancer">Freelancer</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>

            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="VERIFIED">✓ Đã xác thực OTP</option>
              <option value="UNVERIFIED">! Chưa xác thực</option>
              <option value="SUSPENDED">🔒 Đang bị khóa</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-3.5 font-semibold">Người Dùng</th>
                <th className="py-3 px-3.5 font-semibold">Email / Liên Hệ</th>
                <th className="py-3 px-3.5 font-semibold">Vai Trò</th>
                <th className="py-3 px-3.5 font-semibold">Ngày Tham Gia</th>
                <th className="py-3 px-3.5 font-semibold">Hoạt Động Gần Nhất</th>
                <th className="py-3 px-3.5 font-semibold">Xác Thực Email</th>
                <th className="py-3 px-3.5 font-semibold">Trạng Thái TK</th>
                <th className="py-3 px-3.5 font-semibold">Số Dư Khả Dụng</th>
                <th className="py-3 px-3.5 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    <i className="fa-solid fa-user-slash text-2xl mb-2 block" />
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Profile */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`;
                          }}
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.id && <span className="text-[10px] font-mono text-slate-400">#{u.id}</span>}
                          </div>
                          {u.companyName && (
                            <div className="text-[11px] text-slate-500 font-medium">🏢 {u.companyName}</div>
                          )}
                          {u.title && !u.companyName && (
                            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]">{u.title}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email / Contact */}
                    <td className="py-2.5 px-3.5 font-mono text-slate-700">
                      <div>{u.email}</div>
                      {u.phone && <div className="text-[10px] text-slate-400">📞 {u.phone}</div>}
                    </td>

                    {/* Role */}
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'freelancer'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : u.role === 'employer'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {u.role === 'freelancer' ? 'Freelancer' : u.role === 'employer' ? 'Nhà Tuyển Dụng' : 'Quản Trị Viên'}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-regular fa-calendar text-[11px] text-slate-400" />
                        <span>{u.createdAt ? u.createdAt.substring(0, 10) : '2026-10-15'}</span>
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.lastLogin === 'Hiện tại' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span className="text-[11px] font-mono text-slate-700">
                          {u.lastLogin || '2026-10-15 14:00'}
                        </span>
                      </div>
                    </td>

                    {/* Email Verification */}
                    <td className="py-2.5 px-3.5">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <i className="fa-solid fa-circle-check text-[10px] text-emerald-600" />
                          <span>✓ Đã xác thực</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                          <i className="fa-solid fa-circle-exclamation text-[10px] text-amber-600" />
                          <span>! Chưa xác thực</span>
                        </span>
                      )}
                    </td>

                    {/* Account Status Dropdown */}
                    <td className="py-2.5 px-3.5">
                      <select
                        value={u.accountStatus || 'ACTIVE'}
                        onChange={(e) => adminUpdateUserStatus(u.id, e.target.value as AccountStatus)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          u.accountStatus === 'ACTIVE' || !u.accountStatus
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : u.accountStatus === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE (Kích hoạt)</option>
                        <option value="PENDING">PENDING (Chờ)</option>
                        <option value="SUSPENDED">SUSPENDED (Khóa)</option>
                        <option value="RESTRICTED">RESTRICTED</option>
                      </select>
                    </td>

                    {/* Wallet Balance */}
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 font-mono">
                      {(u.balance || 0).toLocaleString('vi-VN')} đ
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => adminToggleEmailVerified(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                          u.emailVerified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        }`}
                        title="Chuyển đổi trạng thái xác thực email OTP"
                      >
                        <i className="fa-solid fa-envelope-circle-check text-xs" />
                        <span>{u.emailVerified ? 'Hủy OTP' : 'Xác thực'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Xem chi tiết người dùng"
                      >
                        <i className="fa-regular fa-eye" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Universal Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedUser.id}`}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <span>{selectedUser.name}</span>
                    <span className="text-xs font-mono text-slate-400">#{selectedUser.id}</span>
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">{selectedUser.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
              <div>
                <span className="text-slate-500 block text-[11px]">Vai trò:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Số dư khả dụng:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {(selectedUser.balance || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Số điện thoại:</span>
                <span className="font-mono text-slate-800">{selectedUser.phone || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Trạng thái:</span>
                <span className="font-bold text-blue-700">{selectedUser.accountStatus || 'ACTIVE'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Ngày đăng ký:</span>
                <span className="font-mono text-slate-700">{selectedUser.createdAt || '2026-10-15'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Xác thực OTP:</span>
                <span className={selectedUser.emailVerified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {selectedUser.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
            </div>

            {selectedUser.bio && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Tiểu sử / Giới thiệu:</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedUser.bio}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
