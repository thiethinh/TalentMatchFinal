import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Pagination } from '../../components/common/Pagination';

export const AdminCategories: React.FC = () => {
  const { categories, saveCategory, deleteCategory } = useApp();

  // Search & Filter State
  const [catSearchQuery, setCatSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Add / Edit Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catIcon, setCatIcon] = useState('fa-briefcase');
  const [catOrder, setCatOrder] = useState(1);
  const [catSuggestedSkills, setCatSuggestedSkills] = useState('');
  const [catProfessions, setCatProfessions] = useState<string[]>([]);
  const [newProfInput, setNewProfInput] = useState('');
  const [deletingCat, setDeletingCat] = useState<any | null>(null);

  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatName('');
    setCatCode('');
    setCatIcon('fa-briefcase');
    setCatOrder(categories.length + 1);
    setCatSuggestedSkills('');
    setCatProfessions([]);
    setNewProfInput('');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatCode(cat.code);
    setCatIcon(cat.icon || 'fa-briefcase');
    setCatOrder(cat.displayOrder || 1);
    setCatSuggestedSkills(cat.suggestedSkills || '');
    setCatProfessions(Array.isArray(cat.professions) ? [...cat.professions] : []);
    setNewProfInput('');
    setIsCatModalOpen(true);
  };

  const handleAddProfession = () => {
    if (!newProfInput.trim()) return;
    if (!catProfessions.includes(newProfInput.trim())) {
      setCatProfessions([...catProfessions, newProfInput.trim()]);
    }
    setNewProfInput('');
  };

  const handleRemoveProfession = (index: number) => {
    setCatProfessions(catProfessions.filter((_, i) => i !== index));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('Vui lòng nhập tên nhóm ngành!');
      return;
    }
    const success = await saveCategory({
      id: editingCatId || undefined,
      name: catName.trim(),
      code: catCode.trim() || undefined,
      icon: catIcon.trim() || 'fa-briefcase',
      displayOrder: catOrder,
      professions: catProfessions,
      suggestedSkills: catSuggestedSkills.trim()
    });
    if (success) {
      setIsCatModalOpen(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCat) return;
    await deleteCategory(deletingCat.id);
    setDeletingCat(null);
  };

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (!catSearchQuery.trim()) return true;
      const q = catSearchQuery.toLowerCase();
      const name = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      const hasProf = c.professions && c.professions.some((p: string) => p.toLowerCase().includes(q));
      return name.includes(q) || code.includes(q) || hasProf;
    });
  }, [categories, catSearchQuery]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [catSearchQuery]);

  // Pagination calculations
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Total professions count
  const totalProfessionsCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.professions ? c.professions.length : 0), 0);
  }, [categories]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Header */}
      <AdminHeader
        title="Quản Lý Danh Mục Nhóm Ngành & Nghề Nghiệp"
        subtitle="Dữ liệu động lưu trữ trong MySQL bảng job_categories. Mọi thay đổi sẽ tự động đồng bộ trên hồ sơ cá nhân và bộ lọc sàn."
        icon="fa-layer-group"
        badge={`${categories.length} nhóm ngành`}
        actions={
          <button
            type="button"
            onClick={handleOpenAddCategory}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Thêm Nhóm Ngành</span>
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng nhóm ngành</div>
          <div className="text-xl font-extrabold text-blue-700 mt-1 font-mono">{categories.length}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Nhóm công việc chính</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng vị trí nghề nghiệp</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">{totalProfessionsCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Nghề trực thuộc dropdown</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đồng bộ MySQL</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Trực Tiếp</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Bảng job_categories</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phân quyền chỉnh sửa</div>
          <div className="text-xl font-extrabold text-purple-700 mt-1 font-mono">ADMIN</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">RBAC Enforced</div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-list-check text-blue-600 text-sm" />
              <span>Danh Sách Nhóm Ngành Hoạt Động</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredCategories.length} nhóm
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tìm kiếm theo tên ngành, mã code hoặc tên nghề nghiệp cụ thể bên trong.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                placeholder="Tìm nhóm ngành hoặc nghề..."
                value={catSearchQuery}
                onChange={(e) => setCatSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedCategories.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <i className="fa-solid fa-folder-open text-3xl mb-2 block" />
              Không tìm thấy nhóm ngành nào.
            </div>
          ) : (
            paginatedCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Icon, Name, Code, Order, Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-base shrink-0 shadow-2xs">
                        <i className={`fa-solid ${cat.icon || 'fa-briefcase'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{cat.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {cat.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Thứ tự: <strong className="text-slate-700">{cat.displayOrder ?? 0}</strong> • Trạng thái: <strong className="text-emerald-600">Đang hoạt động</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors cursor-pointer text-xs"
                        title="Chỉnh sửa nhóm ngành"
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCat(cat)}
                        className="p-2 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition-colors cursor-pointer text-xs"
                        title="Xóa nhóm ngành"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>

                  {/* Associated Professions */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-briefcase text-blue-500 text-xs" />
                        <span>Vị trí / Nghề nghiệp trực thuộc:</span>
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                        {cat.professions?.length || 0} nghề
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(cat.professions || []).map((prof: string) => (
                        <span
                          key={prof}
                          className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
                        >
                          {prof}
                        </span>
                      ))}
                      {(!cat.professions || cat.professions.length === 0) && (
                        <span className="text-xs text-slate-400 italic">Chưa có nghề nghiệp trực thuộc.</span>
                      )}
                    </div>
                  </div>

                  {/* Suggested Skills */}
                  {cat.suggestedSkills && (
                    <div className="pt-2 border-t border-slate-200 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        Gợi ý kỹ năng liên quan:
                      </span>
                      <p className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200">
                        {cat.suggestedSkills}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
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

      {/* Add / Edit Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-blue-600 text-sm" />
                <span>{editingCatId ? 'Chỉnh Sửa Nhóm Ngành' : 'Thêm Nhóm Ngành Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên nhóm ngành <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: IT & Lập trình"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã định danh (Code):</label>
                  <input
                    type="text"
                    placeholder="it_software"
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biểu tượng FontAwesome:</label>
                  <input
                    type="text"
                    placeholder="fa-code"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thứ tự hiển thị:</label>
                <input
                  type="number"
                  min={1}
                  value={catOrder}
                  onChange={(e) => setCatOrder(Number(e.target.value))}
                  className="w-28 p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Professions tags manager */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700">
                  Các vị trí nghề nghiệp trực thuộc:
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên nghề (ví dụ: Backend Developer) rồi bấm Thêm..."
                    value={newProfInput}
                    onChange={(e) => setNewProfInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddProfession();
                      }
                    }}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddProfession}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors"
                  >
                    Thêm
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[48px]">
                  {catProfessions.map((prof, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      <span>{prof}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProfession(idx)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <i className="fa-solid fa-xmark text-[11px]" />
                      </button>
                    </span>
                  ))}
                  {catProfessions.length === 0 && (
                    <span className="text-slate-400 italic text-[11px]">Chưa thêm nghề nào.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gợi ý kỹ năng (cách nhau bởi dấu phẩy):
                </label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, React, Node.js..."
                  value={catSuggestedSkills}
                  onChange={(e) => setCatSuggestedSkills(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-trash-can" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Xóa Nhóm Ngành Này?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa nhóm ngành <strong>"{deletingCat.name}"</strong>? Toàn bộ danh mục nghề trực thuộc cũng sẽ bị xóa khỏi cơ sở dữ liệu.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

