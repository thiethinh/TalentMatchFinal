import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api/client';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';

interface NotificationItem {
  id: number;
  title?: string;
  message: string;
  targetUrl?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    apiClient
      .get('/notifications')
      .then((res) => {
        setNotifications(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number, targetUrl?: string) => {
    try {
      await apiClient.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      if (targetUrl) {
        window.location.href = targetUrl;
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Thông báo của bạn</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật trạng thái dự án, đề xuất và các mốc công việc
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchNotifications}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
          Đang tải thông báo...
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Không có thông báo mới"
          description="Hiện tại bạn chưa nhận được thông báo nào. Các cập nhật quan trọng về hợp đồng và tin nhắn sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
          {notifications.map((n) => {
            const isRead = n.isRead ?? n.read ?? false;
            return (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  isRead ? 'bg-white hover:bg-slate-50/80' : 'bg-blue-50/30 hover:bg-blue-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      isRead ? 'bg-transparent' : 'bg-blue-600'
                    }`}
                  />
                  <div>
                    {n.title && (
                      <p className="text-xs font-bold text-slate-900 mb-0.5">{n.title}</p>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                      title="Đánh dấu đã đọc"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  {n.targetUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(n.id, n.targetUrl)}
                      className="text-xs text-blue-600"
                    >
                      Xem chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
