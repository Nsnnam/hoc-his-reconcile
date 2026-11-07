import React from 'react';
import { FileSpreadsheet, X, Trash2, Layers, CheckCircle } from 'lucide-react';
import { UploadedFileRecord } from '../types';

interface FileListPillsProps {
  files: UploadedFileRecord[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
}

export const FileListPills: React.FC<FileListPillsProps> = ({
  files,
  onRemoveFile,
  onClearAll
}) => {
  if (files.length === 0) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'HOC_RESULT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HIS_RECEPTION':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'HIS_EXPORT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <h4 className="text-sm font-bold text-slate-800">
            Danh sách tệp đang đối chiếu ({files.length})
          </h4>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">
            Hệ thống tự động liên thông và hợp nhất dữ liệu chéo giữa các tệp này
          </span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1 hover:underline"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs transition-colors group"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getTypeBadge(
                file.fileType
              )}`}
            >
              {file.fileTypeLabel}
            </span>
            <span className="font-medium text-slate-700 max-w-[180px] sm:max-w-[240px] truncate" title={file.name}>
              {file.name}
            </span>
            <span className="text-slate-400 text-[11px]">
              ({file.rowCount.toLocaleString()} dòng • {formatBytes(file.size)})
            </span>
            <button
              type="button"
              onClick={() => onRemoveFile(file.id)}
              className="text-slate-400 hover:text-rose-500 rounded p-0.5 transition-colors"
              title="Gỡ file này ra khỏi đối chiếu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
