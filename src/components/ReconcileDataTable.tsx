import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Copy, 
  Check, 
  Building2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Filter,
  X
} from 'lucide-react';
import { ReconciledRecord } from '../types';
import { ColumnFilterPopup, ColumnFilterItem } from './ColumnFilterPopup';
import { extractDateOnly } from '../utils/fileParser';

interface ReconcileDataTableProps {
  records: ReconciledRecord[];
  onSelectRecord: (record: ReconciledRecord) => void;
  baseRecords?: ReconciledRecord[];
  columnFilters?: Record<string, string[]>;
  onColumnFilterChange?: (colKey: string, selected: string[]) => void;
  onClearAllColumnFilters?: () => void;
}

export const ReconcileDataTable: React.FC<ReconcileDataTableProps> = ({
  records,
  onSelectRecord,
  baseRecords,
  columnFilters = {},
  onColumnFilterChange,
  onClearAllColumnFilters
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRecords = records.slice(startIndex, startIndex + pageSize);

  // Nguồn dữ liệu để tính các giá trị phân loại cho từng cột
  const sourceList = (baseRecords && baseRecords.length > 0) ? baseRecords : records;

  // 1. Filter items cho Mã BA
  const baFilterItems: ColumnFilterItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of sourceList) {
      const val = r.maBA || 'Chưa có BA';
      map.set(val, (map.get(val) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }, [sourceList]);

  // 2. Filter items cho Họ tên
  const nameFilterItems: ColumnFilterItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of sourceList) {
      const val = r.hoTen || 'Chưa cập nhật tên';
      map.set(val, (map.get(val) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }, [sourceList]);

  // 3. Filter items cho Nơi làm việc
  const workplaceFilterItems: ColumnFilterItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of sourceList) {
      const val = r.noiLamViec || 'Khám tự do / Khác';
      map.set(val, (map.get(val) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }, [sourceList]);

  // 4. Filter items cho Ngày tiếp nhận (HIS)
  const hisDateFilterItems: ColumnFilterItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of sourceList) {
      const val = extractDateOnly(r.ngayKham) || 'Chưa rõ ngày';
      map.set(val, (map.get(val) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }, [sourceList]);

  // 5. Filter items cho Thời gian đẩy (HOC)
  const hocDateFilterItems: ColumnFilterItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of sourceList) {
      const val = extractDateOnly(r.thoiDiemXuLyHOC) || 'Chưa đẩy cổng';
      map.set(val, (map.get(val) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }, [sourceList]);

  // 6. Filter items cho Mã giao dịch (HIS)
  const transFilterItems: ColumnFilterItem[] = useMemo(() => {
    let coCount = 0;
    let chuaCount = 0;
    for (const r of sourceList) {
      if (r.maGiaoDich) coCount++;
      else chuaCount++;
    }
    return [
      { value: 'CO_MA_GD', label: '✓ Đã có mã giao dịch (Đã đẩy)', count: coCount },
      { value: 'CHUA_CO_MA_GD', label: '✕ Chưa có mã giao dịch', count: chuaCount }
    ];
  }, [sourceList]);

  // 7. Filter items cho Trạng thái HOC & Đối chiếu
  const statusFilterItems: ColumnFilterItem[] = useMemo(() => {
    const counts: Record<string, number> = {
      MATCH_SUCCESS: 0,
      MATCH_FAILED: 0,
      HIS_TRANS_NOT_IN_HOC: 0,
      HIS_NO_TRANS: 0,
      HOC_ONLY: 0
    };
    for (const r of sourceList) {
      if (counts[r.trangThaiDoiChieu] !== undefined) {
        counts[r.trangThaiDoiChieu]++;
      }
    }
    return [
      { value: 'MATCH_SUCCESS', label: '✅ Thành công (Khớp)', count: counts.MATCH_SUCCESS },
      { value: 'MATCH_FAILED', label: '❌ HOC Báo lỗi', count: counts.MATCH_FAILED },
      { value: 'HIS_TRANS_NOT_IN_HOC', label: '⏳ Đã gửi (Chờ HOC)', count: counts.HIS_TRANS_NOT_IN_HOC },
      { value: 'HIS_NO_TRANS', label: '⚠️ Chưa có mã GD', count: counts.HIS_NO_TRANS },
      { value: 'HOC_ONLY', label: '📋 Chỉ có trên HOC', count: counts.HOC_ONLY }
    ].filter(item => item.count > 0);
  }, [sourceList]);

  // 8. Filter items cho Chi tiết lỗi / Nhóm lỗi
  const errorFilterItems: ColumnFilterItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of sourceList) {
      const val = r.nhomLoi || (r.trangThaiHOC === 'Thành công' ? 'Hoàn thành (Không lỗi)' : 'Khác / Chưa có thông tin lỗi');
      map.set(val, (map.get(val) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }, [sourceList]);

  // 9. Filter items cho Thông tin khác (Giới tính, CCCD, SĐT, Khoa phòng)
  const otherFilterItems: ColumnFilterItem[] = useMemo(() => {
    let nam = 0, nu = 0, coCccd = 0, chuaCccd = 0, coSdt = 0, chuaSdt = 0;
    const pkMap = new Map<string, number>();

    for (const r of sourceList) {
      if (r.gioiTinh === 'Nam') nam++;
      else if (r.gioiTinh === 'Nữ') nu++;

      if (r.cccd) coCccd++;
      else chuaCccd++;

      if (r.sdt) coSdt++;
      else chuaSdt++;

      if (r.khoaPhong) {
        pkMap.set(r.khoaPhong, (pkMap.get(r.khoaPhong) || 0) + 1);
      }
    }

    const items: ColumnFilterItem[] = [
      { value: 'NAM', label: 'Giới tính: Nam', count: nam },
      { value: 'NU', label: 'Giới tính: Nữ', count: nu },
      { value: 'CO_CCCD', label: 'Đã có CCCD', count: coCccd },
      { value: 'CHUA_CCCD', label: 'Chưa có CCCD', count: chuaCccd },
      { value: 'CO_SDT', label: 'Đã có SĐT', count: coSdt },
      { value: 'CHUA_SDT', label: 'Chưa có SĐT', count: chuaSdt }
    ];

    for (const [pk, count] of pkMap.entries()) {
      items.push({
        value: `PK:${pk}`,
        label: `🏥 ${pk}`,
        count
      });
    }

    return items.filter(it => it.count > 0);
  }, [sourceList]);

  const activeColumnCount = Object.values(columnFilters || {}).filter(arr => arr && arr.length > 0).length;

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCH_SUCCESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Thành công</span>
          </span>
        );
      case 'MATCH_FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>HOC Báo lỗi</span>
          </span>
        );
      case 'HIS_TRANS_NOT_IN_HOC':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>Đã gửi (Chờ HOC)</span>
          </span>
        );
      case 'HIS_NO_TRANS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Chưa có mã GD</span>
          </span>
        );
      case 'HOC_ONLY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <span>Chỉ có trên HOC</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Bar */}
      <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 text-xs">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-bold text-slate-800">
            Bảng chi tiết đối chiếu ({records.length.toLocaleString()} hồ sơ)
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 hidden sm:inline">
            Tích chọn lọc tại từng tiêu đề cột hoặc bấm vào hàng để xem đối soát chi tiết
          </span>
          {activeColumnCount > 0 && onClearAllColumnFilters && (
            <button
              type="button"
              onClick={onClearAllColumnFilters}
              className="inline-flex items-center space-x-1 bg-sky-100 text-sky-800 hover:bg-rose-100 hover:text-rose-700 px-2 py-0.5 rounded-full border border-sky-300 hover:border-rose-300 font-semibold text-[11px] transition-colors ml-1"
              title="Nhấn để xóa toàn bộ các bộ lọc cột đang áp dụng"
            >
              <Filter className="w-3 h-3 text-sky-600 fill-current" />
              <span>Đang lọc {activeColumnCount} cột • Bấm để xóa</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Page size selector */}
        <div className="flex items-center space-x-2 text-slate-600">
          <span>Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-300 rounded px-2 py-1 text-xs bg-white font-medium"
          >
            <option value={25}>25 dòng/trang</option>
            <option value={50}>50 dòng/trang</option>
            <option value={100}>100 dòng/trang</option>
            <option value={250}>250 dòng/trang</option>
            <option value={500}>500 dòng/trang</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold text-[11px] select-none sticky top-0 z-10">
              {/* 1. STT */}
              <th className="py-2.5 px-3 w-12 text-center">STT</th>

              {/* 2. Mã BA */}
              <th className="py-2.5 px-3 w-32">
                <div className="flex items-center justify-between">
                  <span>Mã BA (BN)</span>
                  <ColumnFilterPopup
                    columnTitle="Mã BA"
                    items={baFilterItems}
                    selectedValues={columnFilters?.maBA || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('maBA', sel)}
                  />
                </div>
              </th>

              {/* 3. Tên bệnh nhân */}
              <th className="py-2.5 px-3 w-40">
                <div className="flex items-center justify-between">
                  <span>Tên bệnh nhân</span>
                  <ColumnFilterPopup
                    columnTitle="Tên bệnh nhân"
                    items={nameFilterItems}
                    selectedValues={columnFilters?.hoTen || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('hoTen', sel)}
                  />
                </div>
              </th>

              {/* 4. Nơi làm việc */}
              <th className="py-2.5 px-3 w-44">
                <div className="flex items-center justify-between">
                  <span>Nơi làm việc</span>
                  <ColumnFilterPopup
                    columnTitle="Nơi làm việc"
                    items={workplaceFilterItems}
                    selectedValues={columnFilters?.noiLamViec || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('noiLamViec', sel)}
                  />
                </div>
              </th>

              {/* 5. Ngày tiếp nhận (HIS) */}
              <th className="py-2.5 px-3 w-36">
                <div className="flex items-center justify-between">
                  <span>Ngày TN (HIS)</span>
                  <ColumnFilterPopup
                    columnTitle="Ngày tiếp nhận (HIS)"
                    items={hisDateFilterItems}
                    selectedValues={columnFilters?.ngayKham || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('ngayKham', sel)}
                  />
                </div>
              </th>

              {/* 6. Thời gian đẩy (HOC) */}
              <th className="py-2.5 px-3 w-36">
                <div className="flex items-center justify-between">
                  <span>Thời gian đẩy</span>
                  <ColumnFilterPopup
                    columnTitle="Thời gian đẩy (HOC)"
                    items={hocDateFilterItems}
                    selectedValues={columnFilters?.thoiDiemXuLyHOC || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('thoiDiemXuLyHOC', sel)}
                  />
                </div>
              </th>

              {/* 7. Mã giao dịch */}
              <th className="py-2.5 px-3 w-40">
                <div className="flex items-center justify-between">
                  <span>Mã GD (HIS)</span>
                  <ColumnFilterPopup
                    columnTitle="Mã giao dịch"
                    items={transFilterItems}
                    selectedValues={columnFilters?.maGiaoDich || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('maGiaoDich', sel)}
                  />
                </div>
              </th>

              {/* 8. Trạng thái HOC */}
              <th className="py-2.5 px-3 w-32 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span>Trạng thái HOC</span>
                  <ColumnFilterPopup
                    columnTitle="Trạng thái HOC"
                    items={statusFilterItems}
                    selectedValues={columnFilters?.trangThaiHOC || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('trangThaiHOC', sel)}
                    align="right"
                  />
                </div>
              </th>

              {/* 9. Chi tiết lỗi & Phản hồi */}
              <th className="py-2.5 px-3 w-60">
                <div className="flex items-center justify-between">
                  <span>Chi tiết lỗi & Phản hồi</span>
                  <ColumnFilterPopup
                    columnTitle="Chi tiết lỗi & Phản hồi"
                    items={errorFilterItems}
                    selectedValues={columnFilters?.nhomLoi || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('nhomLoi', sel)}
                    align="right"
                  />
                </div>
              </th>

              {/* 10. Thông tin khác */}
              <th className="py-2.5 px-3 w-28 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span>Thông tin khác</span>
                  <ColumnFilterPopup
                    columnTitle="Thông tin khác"
                    items={otherFilterItems}
                    selectedValues={columnFilters?.thongTinKhac || []}
                    onFilterChange={(sel) => onColumnFilterChange?.('thongTinKhac', sel)}
                    align="right"
                  />
                </div>
              </th>

              {/* 11. Xem chi tiết */}
              <th className="py-2.5 px-3 w-16 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  Không tìm thấy hồ sơ nào phù hợp với bộ lọc hiện tại
                </td>
              </tr>
            ) : (
              currentRecords.map((r, idx) => {
                const rowNum = startIndex + idx + 1;
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="hover:bg-sky-50/60 cursor-pointer transition-colors group"
                  >
                    {/* STT */}
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {rowNum}
                    </td>

                    {/* Mã BA & Mã BN */}
                    <td className="py-2 px-3">
                      <div className="font-bold text-sky-700 font-mono flex items-center space-x-1">
                        <span>{r.maBA || '—'}</span>
                        {r.isPrioritized && (
                          <span title="Mã giao dịch từ HIS được ưu tiên">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      {r.maBN && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.maBN}
                        </div>
                      )}
                    </td>

                    {/* Họ và tên */}
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800">
                        {r.hoTen || 'Chưa cập nhật'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        {r.gioiTinh && <span>{r.gioiTinh}</span>}
                        {r.ngaySinh && (
                          <>
                            <span>•</span>
                            <span>{r.ngaySinh}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Nơi làm việc */}
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-1 text-slate-700 font-medium">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[170px]" title={r.noiLamViec}>
                          {r.noiLamViec}
                        </span>
                      </div>
                      {r.khoaPhong && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[170px]" title={r.khoaPhong}>
                          {r.khoaPhong}
                        </div>
                      )}
                    </td>

                    {/* 1. Ngày đăng ký / tiếp nhận khám từ HIS */}
                    <td className="py-2 px-3 text-slate-700">
                      {r.ngayKham ? (
                        <div className="flex items-center space-x-1.5 font-mono text-[11px] font-medium text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r.ngayKham}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">Chưa có ngày</span>
                      )}
                    </td>

                    {/* 2. Thời gian hồ sơ được đẩy lên cổng HOC */}
                    <td className="py-2 px-3 text-slate-700">
                      {r.thoiDiemXuLyHOC ? (
                        <div className="flex items-center space-x-1.5 font-mono text-[11px] font-medium text-purple-900 bg-purple-50/70 px-1.5 py-0.5 rounded border border-purple-100 w-fit">
                          <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{r.thoiDiemXuLyHOC}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">Chưa đẩy cổng</span>
                      )}
                    </td>

                    {/* Mã giao dịch */}
                    <td className="py-2 px-3">
                      {r.maGiaoDich ? (
                        <div className="flex items-center space-x-1">
                          <span
                            className="font-mono text-[11px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[150px]"
                            title={r.maGiaoDich}
                          >
                            {r.maGiaoDich}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(r.maGiaoDich, r.id, e)}
                            className="text-slate-400 hover:text-sky-600 p-1 rounded"
                            title="Sao chép mã giao dịch"
                          >
                            {copiedId === r.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa có mã</span>
                      )}
                    </td>

                    {/* Trạng thái HOC & Đối chiếu */}
                    <td className="py-2 px-3 text-center">
                      {getStatusBadge(r.trangThaiDoiChieu)}
                    </td>

                    {/* Chi tiết lỗi & Phản hồi */}
                    <td className="py-2 px-3">
                      {r.trangThaiDoiChieu === 'MATCH_SUCCESS' ? (
                        <span className="text-emerald-700 font-medium text-[11px]">
                          Hoàn thành xử lý danh sách hồ sơ KSK
                        </span>
                      ) : r.chiTietLoi ? (
                        <div className="text-rose-700 font-medium text-[11px] line-clamp-2" title={r.chiTietLoi}>
                          {r.nhomLoi && (
                            <span className="font-bold underline mr-1">{r.nhomLoi}:</span>
                          )}
                          {r.chiTietLoi}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Thông tin khác: CCCD, SĐT */}
                    <td className="py-2 px-3 text-center">
                      {r.cccd ? (
                        <div className="font-mono text-[11px] text-slate-700" title={`CCCD: ${r.cccd}`}>
                          {r.cccd}
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">Chưa có CCCD</span>
                      )}
                      {r.sdt && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.sdt}
                        </div>
                      )}
                    </td>

                    {/* Nút Xem chi tiết */}
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(r);
                        }}
                        className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded transition-colors"
                        title="Xem đầy đủ hồ sơ song song"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {records.length > 0 && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Hiển thị từ dòng <strong>{startIndex + 1}</strong> đến{' '}
            <strong>{Math.min(startIndex + pageSize, records.length)}</strong> trên tổng số{' '}
            <strong>{records.length.toLocaleString()}</strong> hồ sơ
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>

            <span className="px-2">
              Trang <strong>{currentPage}</strong> / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
