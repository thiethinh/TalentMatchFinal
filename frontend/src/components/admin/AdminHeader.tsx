import React from 'react';
import { useApp } from '../../context/AppContext';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  badge?: string | number | null;
  actions?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  icon = 'fa-shield-halved',
  badge,
  actions
}) => {
  const { orders, resetAllDemoData } = useApp();

  const totalEscrowLocked = orders
    .filter((o) => o.status === 'ORDER_IN_PROGRESS' || o.status === 'DELIVERED')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center text-base font-bold shadow-2xs shrink-0">
          <i className={`fa-solid ${icon}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-extrabold text-[#0F172A] text-lg sm:text-xl tracking-tight">
              {title}
            </h1>
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              SUPER ADMIN
            </span>
            {badge !== undefined && badge !== null && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-right">
          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            Ví Escrow bảo chứng:
          </div>
          <div className="text-sm font-bold text-[#059669] font-mono">
            {totalEscrowLocked.toLocaleString('vi-VN')} đ
          </div>
        </div>

        {actions}

        <button
          type="button"
          onClick={resetAllDemoData}
          className="px-3.5 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-bold text-xs rounded-xl border border-[#CBD5E1] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Khôi phục toàn bộ dữ liệu mẫu ban đầu"
        >
          <i className="fa-solid fa-rotate-left text-xs text-[#64748B]" />
          <span>Khôi phục dữ liệu</span>
        </button>
      </div>
    </div>
  );
};

