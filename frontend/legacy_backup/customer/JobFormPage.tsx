import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const CATEGORIES = [
  "Lập trình & CNTT", "Thiết kế & Sáng tạo", "Marketing & Bán hàng",
  "Viết lách & Nội dung", "Kỹ thuật & Kiến trúc", "Tài chính & Kế toán",
  "Hành chính & Nhân sự", "Luật & Pháp lý", "Đào tạo & Giáo dục", "Khác"
];

export const JobFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [priceType, setPriceType] = useState('FIXED');
  const [deadline, setDeadline] = useState('');
  const [workType, setWorkType] = useState('REMOTE');
  const [experienceLevel, setExperienceLevel] = useState('MIDDLE');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [estimatedDurationDays, setEstimatedDurationDays] = useState('14');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      apiClient.get(`/customer/jobs/${id}`)
        .then((res) => {
          const j = res.data;
          setTitle(j.title || '');
          setCategory(j.category || CATEGORIES[0]);
          setDescription(j.description || '');
          setRequiredSkills(j.requiredSkills || '');
          setBudget(j.budget ? j.budget.toString() : '');
          setPriceType(j.priceType || 'FIXED');
          setDeadline(j.deadline || '');
          setWorkType(j.workType || 'REMOTE');
          setExperienceLevel(j.experienceLevel || 'MIDDLE');
          setAcceptanceCriteria(j.acceptanceCriteria || '');
          setEstimatedDurationDays(j.estimatedDurationDays ? j.estimatedDurationDays.toString() : '14');
        })
        .catch((err) => console.error(err));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title,
      category,
      description,
      requiredSkills,
      budget: Number(budget),
      priceType,
      deadline: deadline || null,
      workType,
      experienceLevel,
      acceptanceCriteria,
      estimatedDurationDays: Number(estimatedDurationDays),
    };

    try {
      if (isEditing) {
        await apiClient.put(`/customer/jobs/${id}`, payload);
        alert('Cập nhật tin tuyển dụng thành công!');
      } else {
        await apiClient.post('/customer/jobs', payload);
        alert('Đăng tin tuyển dụng thành công!');
      }
      navigate('/customer/jobs');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thông tin công việc.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/40 space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {isEditing ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Mô tả chi tiết để thu hút Freelancer chuyên nghiệp và báo giá chính xác
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Tiêu đề công việc *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Thiết kế giao diện Dashboard Web ứng dụng Tài chính"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Lĩnh vực chuyên môn *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Hình thức làm việc</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="REMOTE">Làm việc từ xa (Remote)</option>
                <option value="HYBRID">Linh hoạt (Hybrid)</option>
                <option value="ONSITE">Tại văn phòng (Onsite)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Mô tả công việc chi tiết *</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả bối cảnh dự án, phạm vi công việc, sản phẩm cần bàn giao..."
              className="w-full p-3.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Nên có tối thiểu 30 ký tự để mô tả đầy đủ.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Tiêu chí nghiệm thu sản phẩm</label>
            <textarea
              rows={3}
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="Ví dụ: Bàn giao file Figma hoàn chỉnh, component system, có prototype hoạt động mượt mà..."
              className="w-full p-3.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <Input
            label="Kỹ năng yêu cầu (phân cách bằng dấu phẩy) *"
            required
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="Figma, UI/UX, Design System, Prototype"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Ngân sách dự kiến (VNĐ) *"
              type="number"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="15000000"
            />
            <Input
              label="Hạn chót ứng tuyển"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <Input
              label="Thời gian thực hiện (ngày)"
              type="number"
              value={estimatedDurationDays}
              onChange={(e) => setEstimatedDurationDays(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/customer/jobs">
              <Button variant="outline" type="button">Hủy</Button>
            </Link>
            <Button variant="primary" type="submit" loading={loading}>
              {isEditing ? 'Lưu thay đổi' : 'Đăng tin tuyển dụng'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
