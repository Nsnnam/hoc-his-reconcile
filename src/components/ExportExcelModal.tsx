import React, { useState } from 'react';
import { Download, FileSpreadsheet, X, CheckCircle, ShieldAlert, Building2, Sparkles } from 'lucide-react';
import { ErrorGroupStat, ReconciledRecord, WorkplaceStat } from '../types';
import { exportReconciliationToExcel } from '../utils/excelExporter';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRecords: ReconciledRecord[];
  filteredRecords: ReconciledRecord[];
  workplaces: WorkplaceStat[];
  errorGroups: ErrorGroupStat[];
}

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
  isOpen,
  onClose,
  allRecords,
  filteredRecords,
  workplaces,
  errorGroups
}) => {
  const [exportMode, setExportMode] = useState<'all' | 'filtered' | 'failedOnly'>('filtered');

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    let targetRecords: ReconciledRecord[] = [];
    let prefix = 'KetQua_DoiChieu_HOC_HIS';

    if (exportMode === 'all') {
      targetRecords = allRecords;
      prefix = 'ToanBo_DoiChieu_HOC_HIS';
    } else if (exportMode === 'filtered') {
      targetRecords = filteredRecords;
      prefix = 'DanhSachLoc_DoiChieu_HOC_HIS';
    } else {
      targetRecords = allRecords.filter(r => r.trangThaiHOC === 'Thất bại');
      prefix = 'DanhSachLoi_HOC_CanSua';
    }

    exportReconciliationToExcel(targetRecords, workplaces, errorGroups, prefix);
    onClose();
  };

  const failedCount = allRecords.filter(r => r.trangThaiHOC === 'Thất bại').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Xuất Báo Cáo Excel</h3>
              <p className="text-xs text-slate-400">Xuất file chuẩn .xlsx kèm 3 sheet tổng hợp và chi tiết</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 font-medium">
            Chọn phạm vi dữ liệu bạn muốn xuất ra file Excel:
          </p>

          <div className="space-y-3">
            {/* Option 1: Filtered */}
            <label
              onClick={() => setExportMode('filtered')}
              className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportMode === 'filtered'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'filtered'}
                onChange={() => setExportMode('filtered')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Danh sách đang lọc</span>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-semibold text-[11px]">
                    {filteredRecords.length.toLocaleString()} hồ sơ
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  Xuất đúng danh sách đang hiển thị theo bộ lọc tìm kiếm, nơi làm việc, ngày khám hiện tại.
                </p>
              </div>
            </label>

            {/* Option 2: All */}
            <label
              onClick={() => setExportMode('all')}
              className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportMode === 'all'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'all'}
                onChange={() => setExportMode('all')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Toàn bộ dữ liệu đối chiếu</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                    {allRecords.length.toLocaleString()} hồ sơ
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  Xuất tất cả hồ sơ đã được đối chiếu liên tục từ tất cả các file tải lên.
                </p>
              </div>
            </label>

            {/* Option 3: Failed Only */}
            <label
              onClick={() => setExportMode('failedOnly')}
              className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportMode === 'failedOnly'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'failedOnly'}
                onChange={() => setExportMode('failedOnly')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-800 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Chỉ danh sách HOC Báo lỗi (Cần sửa)</span>
                  </span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[11px]">
                    {failedCount.toLocaleString()} hồ sơ
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  Xuất danh sách các ca thất bại kèm cột nhóm lỗi và hướng dẫn khắc phục cụ thể để gửi cho KHTH/IT xử lý lại.
                </p>
              </div>
            </label>
          </div>

          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 text-sky-950 text-[11px] space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-sky-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Tiêu chuẩn rà soát & lọc báo cáo:</span>
            </div>
            <p className="text-slate-600 pl-5">
              Hệ thống mặc định chỉ rà và xuất các hồ sơ thuộc tệp HIS (hồ sơ chưa đẩy HOC và hồ sơ đã đẩy có Transaction ID trùng khớp với cột K Mã giao dịch trong tệp xuất HIS); các Transaction ID dư trên HOC đã được tự động bỏ qua.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
            <span className="font-bold text-slate-800">File Excel đầu ra bao gồm 3 sheet:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
              <li>Sheet 1: <strong className="text-slate-700">Chi Tiết Đối Chiếu</strong> (Đầy đủ mã BA, Họ tên, Nơi làm việc, Mã GD, Lỗi...)</li>
              <li>Sheet 2: <strong className="text-slate-700">Tổng Hợp Theo Nơi Làm Việc</strong> (Thống kê theo đơn vị)</li>
              <li>Sheet 3: <strong className="text-slate-700">Phân Tích Lỗi HOC</strong> (Thống kê và hướng dẫn xử lý)</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors text-xs"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleExecuteExport}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-1.5 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Excel ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
