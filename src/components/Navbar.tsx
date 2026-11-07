import React from 'react';
import { 
  Activity, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  RotateCcw, 
  Sparkles,
  CheckCircle2,
  Building2
} from 'lucide-react';

interface NavbarProps {
  totalFiles: number;
  totalRecords: number;
  successCount: number;
  onOpenUpload: () => void;
  onLoadSamples: () => void;
  onExport: () => void;
  onReset: () => void;
  loadingSample: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalFiles,
  totalRecords,
  successCount,
  onOpenUpload,
  onLoadSamples,
  onExport,
  onReset,
  loadingSample
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-teal-400 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  HOC <span className="text-sky-400">⚡</span> HIS
                  <span className="bg-sky-500/20 text-sky-300 text-xs px-2 py-0.5 rounded-full font-medium border border-sky-500/30">
                    Reconcile Pro
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Hệ thống đối chiếu liên tục hồ sơ KSK & giám sát liên thông cổng 1551
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          {totalRecords > 0 && (
            <div className="hidden lg:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                <span><strong>{totalFiles}</strong> tệp</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span><strong>{totalRecords.toLocaleString()}</strong> hồ sơ</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đạt: <strong>{successCount.toLocaleString()}</strong> ({totalRecords > 0 ? Math.round((successCount / totalRecords) * 100) : 0}%)</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {totalRecords === 0 && (
              <button
                type="button"
                onClick={onLoadSamples}
                disabled={loadingSample}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-900/30 transition-all duration-200 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{loadingSample ? 'Đang nạp...' : 'Nạp dữ liệu mẫu (4 file)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>

            {totalRecords > 0 && (
              <>
                <button
                  type="button"
                  onClick={onExport}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                  title="Xuất kết quả đối chiếu ra file Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xuất Excel</span>
                </button>

                <button
                  type="button"
                  onClick={onReset}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Xóa dữ liệu để làm mới"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
