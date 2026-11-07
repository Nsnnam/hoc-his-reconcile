import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  RotateCcw, 
  Sparkles,
  CheckCircle2,
  Building2,
  ExternalLink,
  ChevronDown,
  Globe,
  FileCheck2,
  Server
} from 'lucide-react';
import { EXTERNAL_PORTAL_LINKS } from '../types';

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
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPortalMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPortalIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'HOC':
        return <Globe className="w-4 h-4 text-purple-400" />;
      case 'HIS_RECEPTION':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'HIS_EXPORT':
        return <Server className="w-4 h-4 text-blue-400" />;
      default:
        return <ExternalLink className="w-4 h-4 text-sky-400" />;
    }
  };

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
            <div className="hidden xl:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
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

          {/* Action Buttons & Portal Dropdown */}
          <div className="flex items-center space-x-2">
            {/* 3 Direct Export Links Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setPortalMenuOpen(prev => !prev)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-colors"
                title="Mở cổng HIS và Cổng HOC để xuất file đầu vào"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline font-semibold">Cổng xuất file</span>
                <span className="sm:hidden font-semibold">Cổng HIS/HOC</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {portalMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 p-2 z-50 text-xs divide-y divide-slate-700/60 animate-fade-in">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Truy cập nhanh cổng xuất dữ liệu đầu vào:
                  </div>

                  <div className="py-1 space-y-1">
                    {EXTERNAL_PORTAL_LINKS.map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-slate-700/70 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 shrink-0 mt-0.5 group-hover:border-sky-500/50">
                          {getPortalIcon(link.sourceType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white group-hover:text-sky-300 flex items-center gap-1.5">
                              {link.title}
                              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-900 border border-slate-700 text-slate-300">
                              {link.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {link.description}
                          </p>
                          <span className="text-[10px] text-sky-400 font-medium inline-block mt-1">
                            Đầu ra: {link.fileType}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="px-3 py-2 bg-slate-900/60 rounded-b-lg text-[11px] text-slate-400">
                    💡 <em>Xuất file từ 3 cổng trên rồi kéo thả vào đây để hệ thống tự động đối chiếu chéo.</em>
                  </div>
                </div>
              )}
            </div>

            {totalRecords === 0 && (
              <button
                type="button"
                onClick={onLoadSamples}
                disabled={loadingSample}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-900/30 transition-all duration-200 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{loadingSample ? 'Đang nạp...' : 'Nạp mẫu (4 file)'}</span>
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
