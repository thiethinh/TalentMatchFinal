import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { PlusCircle, ShieldCheck } from 'lucide-react';

export const CreateProject: React.FC = () => {
  const { createProject, currentUser } = useDemo();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT & Lập trình');
  const [budget, setBudget] = useState(10000000);
  const [budgetType, setBudgetType] = useState<'FIXED' | 'MILESTONE'>('MILESTONE');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('ReactJS, Node.js, Rest API');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createProject({
      title,
      category,
      employerId: currentUser.id,
      employerName: currentUser.name,
      employerAvatar: currentUser.avatar,
      employerCompany: currentUser.companyName,
      employerVerified: currentUser.isVerified,
      budget,
      budgetType,
      deadline,
      description,
      requiredSkills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
    });

    navigate('/projects');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center">
          <PlusCircle className="w-7 h-7 text-blue-600 mr-2" />
          <span>Đăng Dự Án Tuyển Dụng Dịch Vụ Mới</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Nhận báo giá từ hàng nghìn Freelancer chuyên nghiệp tại Việt Nam. Bạn chỉ nạp tiền Escrow khi chọn được ứng viên ưng ý.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">Tiêu đề dự án tuyển dụng (*):</label>
          <input
            type="text"
            placeholder="Ví dụ: Cần thuê Lập trình viên ReactJS xây dựng Website bán hàng..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Danh mục công việc:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium bg-white"
            >
              <option value="IT & Lập trình">IT & Lập trình</option>
              <option value="Thiết kế & Đồ họa">Thiết kế & Đồ họa</option>
              <option value="Content & Dịch thuật">Content & Dịch thuật</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Hỗ trợ Doanh nghiệp">Hỗ trợ Doanh nghiệp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Hình thức ngân sách:</label>
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value as 'FIXED' | 'MILESTONE')}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium bg-white"
            >
              <option value="MILESTONE">Chia Cột mốc (Milestone-based)</option>
              <option value="FIXED">Trọn gói cố định (Fixed Price)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Ngân sách dự kiến (VND):</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-blue-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Thời hạn nhận bài (Deadline):</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">Kỹ năng yêu cầu (phân cách bằng dấu phẩy):</label>
          <input
            type="text"
            placeholder="ReactJS, Figma, UI/UX, Node.js..."
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">Mô tả chi tiết yêu cầu công việc (Scope of Work):</label>
          <textarea
            rows={5}
            placeholder="Mô tả cụ thể mục tiêu dự án, đầu ra cần bàn giao và các tiêu chí nghiệm thu..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 leading-relaxed"
            required
          />
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Đăng tin tuyển dụng hoàn toàn miễn phí. Tiền chỉ được nạp vào Ví Tạm Giữ Escrow khi bạn chọn được Báo giá ứng ý và ký hợp đồng với Freelancer.
          </span>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md"
          >
            Đăng Dự Án Tuyển Dụng Ngay
          </button>
        </div>
      </form>

    </div>
  );
};
