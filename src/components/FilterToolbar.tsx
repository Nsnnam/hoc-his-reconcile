import React from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Building2, 
  ShieldAlert, 
  Calendar,
  Clock,
  Sparkles,
  Stethoscope,
  X
} from 'lucide-react';
import { FilterCriteria, WorkplaceStat, ClinicStat, ErrorGroupStat } from '../types';
import { toInputDateValue, fromInputDateValue } from '../utils/fileParser';
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown';

interface FilterToolbarProps {
  filters: FilterCriteria;
  onFilterChange: (newFilters: Partial<FilterCriteria>) => void;
  onResetFilters: () => void;
  workplaces: WorkplaceStat[];
  clinics: ClinicStat[];
  errorGroups: ErrorGroupStat[];
  totalRecords: number;
  filteredCount: number;
  onClearAllColumnFilters?: () => void;
}

interface DatePickerFieldProps {
  value: string;
  onChange: (val: string) => void;
  accent: 'emerald' | 'purple';
  title?: string;
  placeholder?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ value, onChange, accent, title, placeholder }) => {
  const inputVal = toInputDateValue(value);
  const ringColor = accent === 'emerald' 
    ? 'focus-within:ring-emerald-500 focus-within:border-emerald-500' 
    : 'focus-within:ring-purple-500 focus-within:border-purple-500';

  return (
    <div 
      className={`inline-flex items-center space-x-1 bg-white border border-slate-300 rounded px-1.5 py-0.5 hover:border-slate-400 shadow-2xs transition-all ${ringColor} focus-within:outline-none focus-within:ring-1`}
      title={title || (value ? `Đã chọn: ${value} (Bấm để đổi ngày)` : 'Bấm để mở lịch chọn ngày')}
    >
      <input
        type="date"
        value={inputVal}
        onChange={(e) => onChange(fromInputDateValue(e.target.value))}
        onClick={(e) => {
          try {
            (e.target as any).showPicker?.();
          } catch {}
        }}
        className="text-[11px] bg-transparent text-slate-700 font-mono cursor-pointer focus:outline-none w-[116px]"
      />
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
          className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Xóa ngày này"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  workplaces,
  clinics,
  errorGroups,
  totalRecords,
  filteredCount,
  onClearAllColumnFilters
}) => {
  const activeColumnCount = Object.values(filters.columnFilters || {}).filter(arr => arr && arr.length > 0).length;

  const hasActiveFilters = 
    Boolean(filters.searchTerm) ||
    filters.noiLamViec !== 'ALL' ||
    (filters.danhSachNoiLamViec && filters.danhSachNoiLamViec.length > 0) ||
    (filters.danhSachPhongKham && filters.danhSachPhongKham.length > 0) ||
    filters.trangThaiDoiChieu !== 'ALL' ||
    filters.nhomLoi !== 'ALL' ||
    Boolean(filters.tuNgayKham) ||
    Boolean(filters.denNgayKham) ||
    Boolean(filters.tuNgayDayHOC) ||
    Boolean(filters.denNgayDayHOC) ||
    !filters.chiLayHoSoHIS ||
    activeColumnCount > 0;

  // Options cho Nơi làm việc (Doanh nghiệp, cơ quan)
  const workplaceOptions: MultiSelectOption[] = workplaces.map(w => ({
    value: w.noiLamViec,
    label: w.noiLamViec,
    count: w.total
  }));

  // Options cho Phòng khám tiếp nhận
  const clinicOptions: MultiSelectOption[] = clinics.map(c => ({
    value: c.phongKham,
    label: c.phongKham,
    count: c.count
  }));

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
      {/* Nút tích Bộ lọc Ưu tiên rà soát hồ sơ theo tệp HIS (Mặc định: BẬT) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-sky-50/90 via-blue-50/60 to-indigo-50/60 p-2.5 rounded-lg border border-sky-200/80 text-xs">
        <label className="flex items-start sm:items-center space-x-2.5 cursor-pointer select-none flex-1">
          <input
            type="checkbox"
            checked={filters.chiLayHoSoHIS}
            onChange={(e) => onFilterChange({ chiLayHoSoHIS: e.target.checked })}
            className="w-4 h-4 mt-0.5 sm:mt-0 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer accent-sky-600 shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center flex-wrap gap-1.5 font-bold text-sky-950">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Chỉ rà soát hồ sơ thuộc tệp HIS (Khớp mã giao dịch cột K & Chưa đẩy HOC)</span>
              <span className="text-[10px] bg-sky-200/80 text-sky-800 px-1.5 py-0.2 rounded font-semibold">
                Mặc định BẬT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tự động lấy hồ sơ chưa đẩy HOC và hồ sơ đã đẩy có Transaction ID trùng khớp với cột K trong tệp xuất HIS; bỏ qua các Transaction ID dư trên HOC (bỏ tích nếu muốn xem toàn bộ).
            </p>
          </div>
        </label>
        <div className="shrink-0 self-end sm:self-center">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            filters.chiLayHoSoHIS 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {filters.chiLayHoSoHIS ? '✓ Đang lọc tệp HIS' : '⚠ Đang hiện cả HOC dư'}
          </span>
        </div>
      </div>

      {/* Main Filter Row: Search, Multi-workplace, Multi-clinic, Status, Error group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Global Search Bar */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm Mã BA, Mã BN, Họ tên, CCCD, Mã GD..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-medium"
          />
          {filters.searchTerm && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchTerm: '' })}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nơi làm việc (Doanh nghiệp, cơ quan) - Multi-Select với Checkboxes */}
        <div className="lg:col-span-3">
          <MultiSelectDropdown
            label="Nơi làm việc / Doanh nghiệp"
            icon={<Building2 className="w-3.5 h-3.5 text-teal-600" />}
            options={workplaceOptions}
            selectedValues={filters.danhSachNoiLamViec || []}
            onChange={(sel) => onFilterChange({ danhSachNoiLamViec: sel, noiLamViec: 'ALL' })}
            placeholder="🏢 Nơi làm việc"
            badgeColor="bg-teal-100 text-teal-800"
          />
        </div>

        {/* Phòng khám tiếp nhận - Multi-Select với Checkboxes */}
        <div className="lg:col-span-3">
          <MultiSelectDropdown
            label="Phòng khám tiếp nhận"
            icon={<Stethoscope className="w-3.5 h-3.5 text-indigo-600" />}
            options={clinicOptions}
            selectedValues={filters.danhSachPhongKham || []}
            onChange={(sel) => onFilterChange({ danhSachPhongKham: sel, phongKham: 'ALL' })}
            placeholder="🏥 Phòng khám"
            badgeColor="bg-indigo-100 text-indigo-800"
          />
        </div>

        {/* Trạng thái Đối chiếu Filter */}
        <div className="lg:col-span-2">
          <select
            value={filters.trangThaiDoiChieu}
            onChange={(e) => onFilterChange({ trangThaiDoiChieu: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700 font-medium"
          >
            <option value="ALL">🔍 Mọi trạng thái</option>
            <option value="MATCH_SUCCESS">✅ HOC Thành công</option>
            <option value="MATCH_FAILED">❌ HOC Báo lỗi</option>
            <option value="HIS_NO_TRANS">⏳ Chưa có mã GD</option>
            <option value="HIS_TRANS_NOT_IN_HOC">⚠️ Đã gửi, chờ HOC</option>
            {!filters.chiLayHoSoHIS && (
              <option value="HOC_ONLY">📋 Chỉ có trên HOC (Dư)</option>
            )}
          </select>
        </div>
      </div>

      {/* Second Row: Date Filters, Error Group, Column Filter Badge & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nhóm lỗi Filter */}
          <div className="w-48">
            <select
              value={filters.nhomLoi}
              onChange={(e) => onFilterChange({ nhomLoi: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700"
            >
              <option value="ALL">⚠️ Nhóm lỗi vi phạm (Tất cả)</option>
              {errorGroups.map((err) => (
                <option key={err.nhomLoi} value={err.nhomLoi}>
                  {err.nhomLoi} ({err.count} ca)
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* HIS Date */}
          <div className="flex items-center space-x-1.5 bg-emerald-50/60 py-1 px-2 rounded-lg border border-emerald-100">
            <span className="text-emerald-800 flex items-center gap-1 font-semibold text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiếp nhận (HIS):</span>
            </span>
            <DatePickerField
              value={filters.tuNgayKham}
              onChange={(val) => onFilterChange({ tuNgayKham: val })}
              accent="emerald"
              title="Chọn từ ngày tiếp nhận khám"
            />
            <span className="text-slate-400 font-bold">-</span>
            <DatePickerField
              value={filters.denNgayKham}
              onChange={(val) => onFilterChange({ denNgayKham: val })}
              accent="emerald"
              title="Chọn đến ngày tiếp nhận khám"
            />
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* HOC Push Date */}
          <div className="flex items-center space-x-1.5 bg-purple-50/60 py-1 px-2 rounded-lg border border-purple-100">
            <span className="text-purple-800 flex items-center gap-1 font-semibold text-[11px]">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Đẩy cổng (HOC):</span>
            </span>
            <DatePickerField
              value={filters.tuNgayDayHOC}
              onChange={(val) => onFilterChange({ tuNgayDayHOC: val })}
              accent="purple"
              title="Chọn từ ngày hồ sơ được đẩy lên cổng HOC"
            />
            <span className="text-slate-400 font-bold">-</span>
            <DatePickerField
              value={filters.denNgayDayHOC}
              onChange={(val) => onFilterChange({ denNgayDayHOC: val })}
              accent="purple"
              title="Chọn đến ngày hồ sơ được đẩy lên cổng HOC"
            />
          </div>

          {/* Column filter indicator tag */}
          {activeColumnCount > 0 && (
            <div className="inline-flex items-center space-x-1 bg-sky-100 text-sky-800 px-2 py-1 rounded-lg border border-sky-300 font-medium text-[11px]">
              <Filter className="w-3 h-3 text-sky-600 fill-current" />
              <span>Đang lọc {activeColumnCount} cột tiêu đề</span>
              {onClearAllColumnFilters && (
                <button
                  type="button"
                  onClick={onClearAllColumnFilters}
                  className="ml-1 text-sky-700 hover:text-rose-600 font-bold"
                  title="Xóa bộ lọc trên các cột bảng"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors font-medium ml-1 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className="text-slate-600 font-medium">
          Hiển thị <strong className="text-sky-700">{filteredCount.toLocaleString()}</strong> / {totalRecords.toLocaleString()} hồ sơ
          {filteredCount < totalRecords && (
            <span className="text-amber-600 ml-1.5 font-normal">
              (Đang lọc {Math.round((filteredCount / totalRecords) * 100)}%)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
