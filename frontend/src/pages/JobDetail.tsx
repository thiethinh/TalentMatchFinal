import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    projects,
    proposals,
    currentUser,
    savedProjectIds,
    toggleSaveProject,
    submitProposal,
    updateProposal,
    withdrawProposal,
    jobQuestions,
    fetchJobQuestions,
    askJobQuestion,
    answerJobQuestion,
    openAuthModal,
    addToast
  } = useDemo();

  // Find project by ID
  const project = projects.find((p) => p.id === id);

  // Application Drawer / Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(project ? project.budget : 5000000);
  const [estimatedDays, setEstimatedDays] = useState<number>(7);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInputs, setAnswerInputs] = useState<Record<number, string>>({});
  const milestonesProposal = [
    { title: 'Giai đoạn 1: Khảo sát & Thiết kế kiến trúc', amount: Math.round((project?.budget || 5000000) * 0.4), days: 3 },
    { title: 'Giai đoạn 2: Lập trình chức năng & Tích hợp', amount: Math.round((project?.budget || 5000000) * 0.4), days: 3 },
    { title: 'Giai đoạn 3: Kiểm thử & Bàn giao nghiệm thu', amount: Math.round((project?.budget || 5000000) * 0.2), days: 1 }
  ];

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
          <i className="fa-solid fa-briefcase" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy thông tin công việc</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Công việc này có thể đã kết thúc, bị xóa hoặc đường dẫn không còn khả dụng.
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <i className="fa-solid fa-arrow-left text-xs" />
          <span>Quay lại danh sách công việc</span>
        </Link>
      </div>
    );
  }

  const isSaved = savedProjectIds.includes(project.id);
  const projectProposals = proposals.filter((p) => p.projectId === project.id);
  const myProposal = projectProposals.find(
    (p) => p.freelancerId === currentUser.id || p.freelancerName === currentUser.name
  );

  // Similar jobs in same category
  const similarProjects = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.name.split('.').pop()?.toUpperCase() || 'FILE'
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  useEffect(() => {
    if (project) {
      fetchJobQuestions(project.id);
    }
  }, [project?.id]);

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenEditProposal = () => {
    if (!myProposal) return;
    setBidAmount(myProposal.bidAmount);
    setEstimatedDays(myProposal.estimatedDays);
    setCoverLetter(myProposal.coverLetter);
    setIsEditingProposal(true);
    setShowApplyModal(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!myProposal) return;
    await withdrawProposal(myProposal.id);
    setShowWithdrawModal(false);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role === 'guest') {
      openAuthModal();
      return;
    }
    if (!questionInput.trim() || !project) return;
    await askJobQuestion(project.id, questionInput.trim());
    setQuestionInput('');
  };

  const handleAnswerQuestion = async (qId: number) => {
    const text = answerInputs[qId];
    if (!text || !text.trim() || !project) return;
    await answerJobQuestion(qId, text.trim(), project.id);
    setAnswerInputs((prev) => ({ ...prev, [qId]: '' }));
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      addToast('Vui lòng nhập thư ngỏ chào giá / phương án thực hiện!', 'warning');
      return;
    }

    if (isEditingProposal && myProposal) {
      updateProposal(myProposal.id, bidAmount, estimatedDays, coverLetter.trim());
      setShowApplyModal(false);
      setIsEditingProposal(false);
      return;
    }

    submitProposal({
      projectId: project.id,
      freelancerId: currentUser.id,
      freelancerName: currentUser.name,
      freelancerAvatar: currentUser.avatar,
      freelancerTitle: 'Chuyên gia Freelancer',
      freelancerRating: 5.0,
      freelancerCompletedCount: 12,
      bidAmount,
      estimatedDays,
      coverLetter: coverLetter.trim(),
      attachments: uploadedFiles,
      milestonesProposal: project.budgetType === 'MILESTONE' ? milestonesProposal : undefined
    });

    addToast('Gửi hồ sơ chào giá thành công! Khách hàng sẽ xem xét và phản hồi.', 'success');
    setShowApplyModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/jobs" className="hover:text-blue-600 transition-colors">Việc làm & Dự án</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{project.category}</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{project.title}</span>
      </nav>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Job Content & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                <i className="fa-solid fa-layer-group text-xs" />
                <span>{project.category}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSaveProject(project.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title={isSaved ? 'Bỏ lưu dự án' : 'Lưu dự án để theo dõi'}
                >
                  <i className={`text-xs ${isSaved ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart'}`} />
                  <span>{isSaved ? 'Đã lưu việc' : 'Lưu việc'}</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {project.title}
            </h1>

            {/* Quick Meta Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="space-y-0.5">
                <div className="text-slate-400 font-medium">Đăng ngày</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <i className="fa-regular fa-calendar text-slate-400" />
                  <span>{project.createdAt}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-slate-400 font-medium">Hạn chào giá</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <i className="fa-regular fa-clock text-slate-400" />
                  <span>{project.deadline}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-slate-400 font-medium">Số lượng báo giá</div>
                <div className="font-semibold text-blue-600 flex items-center gap-1">
                  <i className="fa-solid fa-users text-blue-500" />
                  <span>{project.proposalsCount} Đề xuất</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-slate-400 font-medium">Bảo chứng thanh toán</div>
                <div className="font-semibold text-emerald-600 flex items-center gap-1">
                  <i className="fa-solid fa-shield-halved text-emerald-500" />
                  <span>Escrow VNPAY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-file-lines" />
              </span>
              <span>Mô Tả Chi Tiết Yêu Cầu Công Việc</span>
            </h2>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
              {project.description}
            </div>

            {/* Scope & Deliverables Highlights */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check text-emerald-600" />
                <span>Tiêu chuẩn bàn giao & Nghiệm thu:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 pl-1">
                <li>Bàn giao toàn bộ mã nguồn / sản phẩm hoàn chỉnh cùng tài liệu hướng dẫn vận hành.</li>
                <li>Hỗ trợ bảo hành kỹ thuật, sửa lỗi phát sinh tối thiểu 15 ngày sau nghiệm thu.</li>
                <li>Tuân thủ quyền sở hữu trí tuệ: Khách hàng nắm giữ 100% bản quyền sau khi thanh toán giải ngân Escrow.</li>
              </ul>
            </div>
          </div>

          {/* Milestones Roadmap Card (if MILESTONE budget) */}
          {project.budgetType === 'MILESTONE' && project.milestones && project.milestones.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-list-check" />
                  </span>
                  <span>Lộ Trình Cột Mốc Thanh Toán Ký Quỹ Escrow ({project.milestones.length} Giai Đoạn)</span>
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Tiền cọc từng đợt
                </span>
              </div>

              <div className="space-y-3">
                {project.milestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span>{m.title}</span>
                      </div>
                      <div className="text-slate-500 text-xs pl-7 flex items-center gap-3">
                        <span>Hạn hoàn tất: <strong className="text-slate-700">{m.dueDate}</strong></span>
                        <span>•</span>
                        <span>Nghiệm thu trực tiếp</span>
                      </div>
                    </div>

                    <div className="text-right pl-7 sm:pl-0">
                      <div className="text-[11px] text-slate-400 font-medium">Giá trị cột mốc</div>
                      <div className="text-base font-bold text-blue-700 font-mono">
                        {Number(m.amount).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-tags" />
              </span>
              <span>Kỹ Năng & Công Nghệ Yêu Cầu</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Attached Brief Documents Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-paperclip" />
              </span>
              <span>Tài Liệu Đính Kèm Của Khách Hàng (Specs / Brief)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-bold shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Tai-lieu-yeu-cau-ky-thuat.pdf</div>
                    <div className="text-[10px] text-slate-400">2.4 MB • Tài liệu mô tả tính năng</div>
                  </div>
                </div>
                <a
                  href="#download"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast('Đang tải tài liệu đặc tả dự án...', 'info');
                  }}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Tải về"
                >
                  <i className="fa-solid fa-cloud-arrow-down text-sm" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                    Figma
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Wireframe-Mockup-UI.figma</div>
                    <div className="text-[10px] text-slate-400">Thiết kế khung dây mẫu</div>
                  </div>
                </div>
                <a
                  href="#figma"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast('Mở liên kết Figma mẫu...', 'info');
                  }}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Mở liên kết"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-sm" />
                </a>
              </div>
            </div>
          </div>

          {/* Submitted Proposals Status Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-paper-plane" />
                </span>
                <span>Tình Trạng Ứng Tuyển & Báo Giá ({projectProposals.length})</span>
              </h2>
            </div>

            {myProposal ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <div>
                      <div className="font-bold text-emerald-950 text-xs sm:text-sm">Bạn đã nộp hồ sơ báo giá cho công việc này</div>
                      <div className="text-[11px] text-emerald-700">Ngày gửi: {myProposal.createdAt}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    myProposal.status === 'ACCEPTED'
                      ? 'bg-emerald-600 text-white'
                      : myProposal.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-700'
                      : myProposal.status === 'WITHDRAWN'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {myProposal.status === 'ACCEPTED'
                      ? 'Được chọn làm việc'
                      : myProposal.status === 'REJECTED'
                      ? 'Chưa phù hợp'
                      : myProposal.status === 'WITHDRAWN'
                      ? 'Đã rút hồ sơ'
                      : 'Đang chờ xét duyệt'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/70 text-xs">
                  <div>
                    <span className="text-emerald-800">Mức giá chào:</span>{' '}
                    <strong className="text-emerald-950 font-mono font-bold">
                      {myProposal.bidAmount.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <div>
                    <span className="text-emerald-800">Thời gian cam kết:</span>{' '}
                    <strong className="text-emerald-950">{myProposal.estimatedDays} ngày</strong>
                  </div>
                  <div>
                    <span className="text-emerald-800">Tệp đính kèm:</span>{' '}
                    <strong className="text-emerald-950">{myProposal.attachments?.length || 0} file</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-lg border border-emerald-100 leading-relaxed">
                  <strong>Thư chào giá của bạn:</strong> {myProposal.coverLetter}
                </div>

                {/* Proposal Actions */}
                {myProposal.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/60">
                    <button
                      type="button"
                      onClick={handleOpenEditProposal}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-md border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <i className="fa-solid fa-pen-to-square text-[11px] text-blue-600" />
                      <span>Chỉnh Sửa Báo Giá</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWithdrawModal(true)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-md border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <i className="fa-solid fa-rotate-left text-[11px]" />
                      <span>Rút Hồ Sơ Ứng Tuyển</span>
                    </button>
                  </div>
                )}

                {myProposal.status === 'WITHDRAWN' && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500 italic">
                      Bạn đã rút hồ sơ ứng tuyển. Bạn có thể nộp lại đề xuất mới nếu muốn.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProposal(false);
                        setShowApplyModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs cursor-pointer"
                    >
                      Nộp Lại Đề Xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Bạn chưa gửi hồ sơ chào giá cho công việc này. Hãy nghiên cứu kỹ yêu cầu và nộp đề xuất chuyên nghiệp để được khách hàng lựa chọn!
                </p>
                {currentUser.role === 'freelancer' ? (
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <i className="fa-solid fa-paper-plane text-xs" />
                    <span>Nộp Hồ Sơ Chào Giá Ngay</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    (Vui lòng đăng nhập với vai trò Freelancer để nộp báo giá)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION: JOB DISCUSSION & Q&A BEFORE APPLYING             */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <i className="fa-solid fa-comments text-amber-500 text-sm" />
                  <span>Hỏi Đáp & Thảo Luận Về Dự Án ({jobQuestions[project.id]?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Freelancer có thể đặt câu hỏi về yêu cầu, công nghệ hoặc thời hạn để Nhà tuyển dụng giải đáp công khai trước khi ứng tuyển.
                </p>
              </div>
            </div>

            {/* Ask Question Form */}
            <form onSubmit={handleAskQuestion} className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 text-xs">
                Đặt câu hỏi / Thắc mắc của bạn cho Nhà tuyển dụng:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="VD: Dự án có yêu cầu làm việc trực tiếp tại văn phòng không? Đã có bản thiết kế Figma chưa?..."
                  className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs" />
                  <span>Gửi Câu Hỏi</span>
                </button>
              </div>
            </form>

            {/* Questions Thread */}
            <div className="space-y-3">
              {(!jobQuestions[project.id] || jobQuestions[project.id].length === 0) ? (
                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
                  <i className="fa-solid fa-circle-question text-2xl text-slate-300 block" />
                  <div className="text-xs font-semibold text-slate-600">Chưa có câu hỏi thảo luận nào</div>
                  <p className="text-[11px] text-slate-400">Hãy là người đầu tiên đặt câu hỏi cho nhà tuyển dụng!</p>
                </div>
              ) : (
                jobQuestions[project.id].map((q) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={q.authorAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + q.authorName}
                          alt={q.authorName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{q.authorName}</span>
                          <span className="text-[10px] text-slate-400 ml-2">{q.createdAt}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.answer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.answer ? '✓ Đã phản hồi' : '⏳ Chờ giải đáp'}
                      </span>
                    </div>

                    <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 font-medium leading-relaxed">
                      "{q.question}"
                    </p>

                    {/* Employer Reply Display */}
                    {q.answer ? (
                      <div className="ml-4 pl-3.5 border-l-2 border-indigo-400 bg-indigo-50/60 p-3 rounded-r-xl space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-950">
                          <i className="fa-solid fa-reply text-indigo-600" />
                          <span>Phản hồi từ Nhà tuyển dụng ({project.employerName}):</span>
                          <span className="text-slate-400 font-normal text-[10px]">({q.answeredAt})</span>
                        </div>
                        <p className="text-indigo-900 leading-relaxed font-medium">{q.answer}</p>
                      </div>
                    ) : (
                      /* If viewing user is Employer or Author, allow answering */
                      (currentUser.role === 'employer' || currentUser.id === project.employerId) && (
                        <div className="flex gap-2 pt-1 ml-4">
                          <input
                            type="text"
                            value={answerInputs[q.id] || ''}
                            onChange={(e) => setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Nhập câu trả lời công khai của bạn..."
                            className="flex-1 p-2 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAnswerQuestion(q.id)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-paper-plane text-[10px]" />
                            <span>Trả Lời</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1/3): Budget & Employer Profile Sidebar */}
        <div className="space-y-6">
          
          {/* Budget & Action Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs sticky top-24">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngân sách dự kiến</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono mt-1">
                {project.budget.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <i className="fa-solid fa-shield-halved text-emerald-600" />
                <span>{project.budgetType === 'FIXED' ? 'Trọn gói (Cố định)' : 'Theo cột mốc nghiệm thu'}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-lock text-emerald-600" />
                <span>Bảo chứng Escrow 100%</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Tiền cọc được cổng VNPAY phong tỏa an toàn. Bạn chỉ cần tập trung làm việc, hoàn tất nghiệm thu tiền sẽ về ví ngay.
              </p>
            </div>

            {/* Apply Button */}
            {currentUser.role === 'freelancer' ? (
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-paper-plane text-xs" />
                <span>{myProposal ? 'Chỉnh Sửa Báo Giá Đã Nộp' : 'Ứng Tuyển / Nộp Báo Giá'}</span>
              </button>
            ) : currentUser.role === 'guest' ? (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-right-to-bracket text-xs" />
                <span>Đăng Nhập Để Nộp Báo Giá</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Tài khoản Nhà tuyển dụng không thể nộp báo giá công việc.
              </div>
            )}

            {/* Employer Profile Card */}
            <div className="pt-5 border-t border-slate-100 space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin Nhà tuyển dụng</div>
              
              <div className="flex items-center gap-3">
                <img
                  src={project.employerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={project.employerName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                    <span>{project.employerName}</span>
                    {project.employerVerified && (
                      <i className="fa-solid fa-circle-check text-blue-600 text-xs shrink-0" title="Doanh nghiệp xác thực" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {project.employerCompany || 'Doanh nghiệp khởi nghiệp'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Đánh giá</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <span>5.0</span>
                    <i className="fa-solid fa-star text-amber-500 text-[10px]" />
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Tỷ lệ thuê</div>
                  <div className="font-bold text-emerald-700 font-mono">95%</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-slate-400 w-4 text-center" />
                  <span>Hà Nội / TP. Hồ Chí Minh</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-clock text-slate-400 w-4 text-center" />
                  <span>Thành viên từ Tháng 1/2026</span>
                </div>
              </div>
            </div>

            {/* Similar Jobs Suggestions */}
            {similarProjects.length > 0 && (
              <div className="pt-5 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Việc làm tương tự</div>
                <div className="space-y-2.5">
                  {similarProjects.map((sim) => (
                    <Link
                      key={sim.id}
                      to={`/jobs/${sim.id}`}
                      className="block p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 line-clamp-1">{sim.title}</div>
                      <div className="flex items-center justify-between text-slate-500 font-mono">
                        <span className="text-blue-700 font-bold">{sim.budget.toLocaleString('vi-VN')} đ</span>
                        <span className="text-[10px]">{sim.proposalsCount} báo giá</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* RICH PROPOSAL / APPLICATION MODAL WITH FILE UPLOAD */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                  <i className="fa-solid fa-paper-plane" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Nộp Hồ Sơ Chào Giá & Kế Hoạch Triển Khai</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-md">{project.title}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitApplication} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Financial & Time Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mức giá đề xuất của bạn (VNĐ):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={100000}
                      min={500000}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-sm text-blue-700 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">đ</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Ngân sách khách hàng: {project.budget.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Thời gian hoàn thành ước tính (Ngày):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Cam kết bàn giao đúng hẹn để đạt điểm TalentCredit cao.
                  </div>
                </div>
              </div>

              {/* Cover Letter / Solution Proposal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Thư ngỏ & Phương án kỹ thuật thực hiện dự án:
                </label>
                <textarea
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Giới thiệu năng lực của bạn, giải thích phương pháp bạn sẽ giải quyết yêu cầu của khách hàng, các công nghệ dự định sử dụng và cam kết nghiệm thu..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* Detailed File & Image Upload Section (Đáp ứng yêu cầu 3) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Đính kèm CV, Portfolio hoặc Hình ảnh sản phẩm tương tự:
                </label>
                
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center bg-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.zip"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <i className="fa-solid fa-cloud-arrow-up text-2xl text-blue-600 mx-auto mb-1.5 block" />
                  <div className="font-semibold text-slate-800 text-xs">
                    Kéo thả hoặc bấm để chọn tệp tải lên
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Hỗ trợ tệp PDF, DOCX, Hình ảnh PNG, JPG (Tối đa 25MB mỗi tệp)
                  </div>
                </div>

                {/* Uploaded File List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">
                            {f.type}
                          </span>
                          <span className="text-xs font-medium text-slate-800 truncate">{f.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">({f.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(i)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Xóa tệp"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs" />
                  <span>Xác Nhận Gửi Báo Giá</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal: Confirm Withdraw in JobDetail */}
      {showWithdrawModal && myProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs my-8">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Rút Hồ Sơ Ứng Tuyển</h3>
                <p className="text-[11px] text-slate-500">Xác nhận hủy đề xuất chào giá</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200">
              Bạn có chắc chắn muốn rút hồ sơ ứng tuyển khỏi dự án <strong>"{project.title}"</strong>? Sau khi rút, hồ sơ sẽ được đóng lại và bạn có thể nộp đề xuất mới bất kỳ lúc nào.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors cursor-pointer text-xs"
              >
                Không Rút
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md shadow-xs transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-rotate-left text-xs" />
                <span>Xác Nhận Rút</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
