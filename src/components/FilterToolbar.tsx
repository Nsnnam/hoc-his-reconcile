import React from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Building2, 
  ShieldAlert, 
  Calendar,
  X
} from 'lucide-react';
import { FilterCriteria, WorkplaceStat, ErrorGroupStat } from '../types';

interface FilterToolbarProps {
  filters: FilterCriteria;
  onFilterChange: (newFilters: Partial<FilterCriteria>) => void;
  onResetFilters: () => void;
  workplaces: WorkplaceStat[];
  errorGroups: ErrorGroupStat[];
  totalRecords: number;
  filteredCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  workplaces,
  errorGroups,
  totalRecords,
  filteredCount
}) => {
  const hasActiveFilters = 
    Boolean(filters.searchTerm) ||
    filters.noiLamViec !== 'ALL' ||
    filters.trangThaiDoiChieu !== 'ALL' ||
    filters.nhomLoi !== 'ALL' ||
    Boolean(filters.tuNgayKham) ||
    Boolean(filters.denNgayKham) ||
    Boolean(filters.tuNgayDayHOC) ||
    Boolean(filters.denNgayDayHOC);

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
      {/* Search & Main Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Global Search Bar */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo Mã BA (BAxxxx), Mã BN, Họ tên, CCCD, Mã giao dịch..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-medium"
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

        {/* Nơi làm việc Filter */}
        <div className="md:col-span-3">
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.noiLamViec}
              onChange={(e) => onFilterChange({ noiLamViec: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700"
            >
              <option value="ALL">🏢 Tất cả nơi làm việc ({workplaces.length})</option>
              {workplaces.map((w) => (
                <option key={w.noiLamViec} value={w.noiLamViec}>
                  {w.noiLamViec} ({w.total.toLocaleString()} ca)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trạng thái Đối chiếu Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.trangThaiDoiChieu}
            onChange={(e) => onFilterChange({ trangThaiDoiChieu: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700 font-medium"
          >
            <option value="ALL">🔍 Mọi trạng thái đối chiếu</option>
            <option value="MATCH_SUCCESS">✅ HOC Thành công</option>
            <option value="MATCH_FAILED">❌ HOC Thất bại / Lỗi</option>
            <option value="HIS_NO_TRANS">⏳ Chưa có mã GD HIS</option>
            <option value="HIS_TRANS_NOT_IN_HOC">⚠️ Đã gửi, chờ HOC</option>
            <option value="HOC_ONLY">📋 Chỉ có trên HOC</option>
          </select>
        </div>

        {/* Nhóm lỗi Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.nhomLoi}
            onChange={(e) => onFilterChange({ nhomLoi: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700"
          >
            <option value="ALL">⚠️ Nhóm lỗi vi phạm (Tất cả)</option>
            {errorGroups.map((err) => (
              <option key={err.nhomLoi} value={err.nhomLoi}>
                {err.nhomLoi} ({err.count} ca)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second Row: Date Filters & Status Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Date Filter & Active Filter Tags */}
        <div className="flex flex-wrap items-center gap-3">
          {/* HIS Date */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-600 flex items-center gap-1 font-semibold text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiếp nhận (HIS):</span>
            </span>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={filters.tuNgayKham}
              onChange={(e) => onFilterChange({ tuNgayKham: e.target.value })}
              className="w-28 px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            <span className="text-slate-400">-</span>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={filters.denNgayKham}
              onChange={(e) => onFilterChange({ denNgayKham: e.target.value })}
              className="w-28 px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* HOC Push Date */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-600 flex items-center gap-1 font-semibold text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Đẩy cổng (HOC):</span>
            </span>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={filters.tuNgayDayHOC}
              onChange={(e) => onFilterChange({ tuNgayDayHOC: e.target.value })}
              className="w-28 px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            />
            <span className="text-slate-400">-</span>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={filters.denNgayDayHOC}
              onChange={(e) => onFilterChange({ denNgayDayHOC: e.target.value })}
              className="w-28 px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors font-medium ml-1"
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
