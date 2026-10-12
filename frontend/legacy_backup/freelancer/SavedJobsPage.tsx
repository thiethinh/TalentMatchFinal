import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { formatCurrency, formatDate } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Bookmark, Trash2 } from 'lucide-react';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = () => {
    setLoading(true);
    apiClient.get('/freelancer/saved-jobs')
      .then((res) => setSavedJobs(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (jobId: number) => {
    try {
      await apiClient.post(`/freelancer/saved-jobs/${jobId}/remove`);
      fetchSaved();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi bỏ lưu.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/40">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Công việc quan tâm</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Danh sách các dự án bạn đã lưu để xem lại hoặc ứng tuyển sau</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          Đang tải danh sách công việc quan tâm...
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-2">
          <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-extrabold text-slate-900 text-sm">Chưa có công việc nào được lưu</p>
          <p className="text-xs text-slate-500 font-medium">Bấm biểu tượng lưu khi xem dự án để lưu lại vào đây.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {savedJobs.map((item) => {
            const j = item.job;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 shadow-md shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all"
              >
                <div>
                  <Link to={`/jobs/${j.id}`} className="font-black text-base text-slate-900 hover:text-blue-600 transition-colors">
                    {j.title}
                  </Link>
                  <p className="text-slate-500 font-medium mt-1">
                    {j.category} • Ngân sách: <span className="font-black text-blue-700">{formatCurrency(j.budget)}</span> • Hạn chót: {formatDate(j.deadline)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/jobs/${j.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all"
                  >
                    Xem chi tiết
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(j.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Bỏ lưu
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
