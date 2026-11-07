import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  FileCheck2, 
  Building, 
  Server, 
  ExternalLink,
  Globe,
  ArrowRight
} from 'lucide-react';
import { EXTERNAL_PORTAL_LINKS } from '../types';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  loadingSample: boolean;
  compactMode?: boolean;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFilesSelected,
  onLoadSamples,
  loadingSample,
  compactMode = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(
        f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
      );
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = ''; // Reset input
    }
  };

  if (compactMode) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Compact Drag & Add Bar */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left p-3 rounded-lg border border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Thêm file Excel đối chiếu bổ sung
              </p>
              <p className="text-[11px] text-slate-500">
                Kéo thả file vào đây hoặc chọn từ máy tính để đối chiếu liên tục
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Chọn thêm tệp Excel
          </button>
        </div>

        {/* Quick Portal Links Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <ExternalLink className="w-3 h-3 text-sky-500" />
            <span>Cổng xuất dữ liệu đầu vào:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {EXTERNAL_PORTAL_LINKS.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors group"
                title={link.description}
              >
                <span>{link.shortTitle}</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-sky-600" />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3 Direct Portal Access Cards (Prominent Banner) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-slate-700/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              🔗
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Cổng Xuất File Đầu Vào (03 Đường Link Nhanh)
              </h3>
              <p className="text-[11px] text-slate-400">
                Bấm vào các link dưới đây để mở trực tiếp màn hình xuất file từ HIS và Cổng HOC:
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Link 1: Cổng HOC */}
          <a
            href="https://moc.congdulieuyte.vn/hoc/tra-cuu/tra-cuu-tiep-nhan-1551"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/50 transition-all group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  1. Cổng HOC (1551)
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                Tra cứu tiếp nhận 1551
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Xuất file Excel kết quả tiếp nhận cổng 1551 (có Transaction ID, trạng thái & chi tiết lỗi JSON).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-medium text-purple-300">
              <span className="truncate">moc.congdulieuyte.vn</span>
              <span className="inline-flex items-center gap-1 text-[10px] underline">Mở cổng ↗</span>
            </div>
          </a>

          {/* Link 2: Xuất Đăng Ký Tiếp Nhận */}
          <a
            href="https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../ngoaitru/NGT01T001_tiepnhan_ngt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/50 transition-all group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  2. HIS Tiếp Nhận
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Xuất đăng ký tiếp nhận
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Xuất danh sách tiếp nhận người bệnh có thông tin <strong>Nơi làm việc (Cty)</strong>, CCCD, SĐT, Khoa phòng.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-medium text-emerald-300">
              <span className="truncate">NGT01T001_tiepnhan_ngt</span>
              <span className="inline-flex items-center gap-1 text-[10px] underline">Mở cổng ↗</span>
            </div>
          </a>

          {/* Link 3: Quản Lý KSK */}
          <a
            href="https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../noitru/NTU_QuanLyHS_KSK"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/50 transition-all group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  3. HIS Giám Sát KSK
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                Quản lý hồ sơ KSK
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Quản lý và xuất danh sách hồ sơ KSK đẩy liên thông, chứa <strong>Mã giao dịch (HIS)</strong> và Người gửi.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-medium text-blue-300">
              <span className="truncate">NTU_QuanLyHS_KSK</span>
              <span className="inline-flex items-center gap-1 text-[10px] underline">Mở cổng ↗</span>
            </div>
          </a>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
          isDragging 
            ? 'border-sky-500 bg-sky-50/80 scale-[1.01]' 
            : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/50 shadow-sm'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
            Kéo thả hoặc Bấm để tải lên nhiều file Excel
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Hỗ trợ định dạng <span className="font-semibold text-slate-700">.xlsx</span> và <span className="font-semibold text-slate-700">.xls</span> (bao gồm file xuất HTML từ HIS). Hệ thống sẽ tự động phân loại và đối chiếu chéo liên tục.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-600/20 transition-all"
            >
              Chọn tệp từ máy tính
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSamples();
              }}
              disabled={loadingSample}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>{loadingSample ? 'Đang nạp dữ liệu mẫu...' : 'Nạp nhanh 4 file mẫu có sẵn'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Step Explanation Cards with Direct Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: File HIS - Quản lý KSK */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>File HIS - Đẩy hồ sơ KSK</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-medium">.xls</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Chứa Mã BA (BAxxxx), Mã BN, Họ tên, Mã giao dịch, Ngày tiếp nhận, Người gửi, Kết quả gửi.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Xuất tại: Quản lý KSK</span>
            <a
              href="https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../noitru/NTU_QuanLyHS_KSK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span>Mở cổng xuất</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 2: File HIS - Đăng ký tiếp nhận */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>File HIS - Tiếp nhận & Cty</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-medium">.xls</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Bổ sung trường <strong>Nơi làm việc</strong> (Công ty GETECH, v.v.), CCCD, SĐT, Phòng khám, Bác sĩ tiếp nhận.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Xuất tại: Đăng ký tiếp nhận</span>
            <a
              href="https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../ngoaitru/NGT01T001_tiepnhan_ngt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <span>Mở cổng xuất</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 3: File HOC - Kết quả tiếp nhận 1551 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>File HOC - Kết quả 1551</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono font-medium">.xlsx</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Chứa Transaction ID, Trạng thái (Thành công / Thất bại), Thời điểm xử lý, và chi tiết lỗi JSON.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Xuất tại: Cổng HOC 1551</span>
            <a
              href="https://moc.congdulieuyte.vn/hoc/tra-cuu/tra-cuu-tiep-nhan-1551"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <span>Mở cổng xuất</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
