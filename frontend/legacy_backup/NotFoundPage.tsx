import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-2xl mb-4 border border-blue-100 shadow-sm">
        404
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trang không tồn tại</h1>
      <p className="mt-2 text-xs text-slate-500 max-w-md leading-relaxed">
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển. Vui lòng kiểm tra lại địa chỉ hoặc quay về trang chủ.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" size="sm">
            <Home className="w-4 h-4 mr-1.5" /> Về trang chủ
          </Button>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3.5 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Quay lại
        </button>
      </div>
    </div>
  );
};
