import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Sparkles, 
  Info, 
  CheckCircle,
  FileCheck2,
  Building,
  Server
} from 'lucide-react';

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
      <div className="bg-white p-4 rounded-xl border border-dashed border-sky-300 hover:border-sky-500 transition-colors shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Thêm file Excel đối chiếu bổ sung
              </p>
              <p className="text-xs text-slate-500">
                Hệ thống tự động ghép dữ liệu theo Mã BA, Mã giao dịch, Nơi làm việc
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              Chọn tệp từ máy tính
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* 3 Step Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-start space-x-3">
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

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-start space-x-3">
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

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-start space-x-3">
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
      </div>
    </div>
  );
};
