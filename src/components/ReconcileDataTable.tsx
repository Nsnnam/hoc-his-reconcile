import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { ReconciledRecord } from '../types';

interface ReconcileDataTableProps {
  records: ReconciledRecord[];
  onSelectRecord: (record: ReconciledRecord) => void;
}

export const ReconcileDataTable: React.FC<ReconcileDataTableProps> = ({
  records,
  onSelectRecord
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRecords = records.slice(startIndex, startIndex + pageSize);

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
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800">
            Bảng chi tiết đối chiếu ({records.length.toLocaleString()} hồ sơ)
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">
            Bấm vào hàng để xem chi tiết đối soát song song HIS ↔ HOC
          </span>
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
              <th className="py-2.5 px-3 w-12 text-center">STT</th>
              <th className="py-2.5 px-3 w-28">Mã BA (Mã BN)</th>
              <th className="py-2.5 px-3 w-40">Tên bệnh nhân</th>
              <th className="py-2.5 px-3 w-44">Nơi làm việc</th>
              <th className="py-2.5 px-3 w-36">Ngày tiếp nhận (HIS)</th>
              <th className="py-2.5 px-3 w-36">Thời gian đẩy (HOC)</th>
              <th className="py-2.5 px-3 w-44">Mã giao dịch (HIS)</th>
              <th className="py-2.5 px-3 w-32 text-center">Trạng thái HOC</th>
              <th className="py-2.5 px-3 w-60">Chi tiết lỗi & Phản hồi</th>
              <th className="py-2.5 px-3 w-28 text-center">Thông tin khác</th>
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
                        <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
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
