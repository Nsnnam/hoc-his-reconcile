import React from 'react';
import { AlertTriangle, Wrench, ArrowRight, ShieldAlert } from 'lucide-react';
import { ErrorGroupStat } from '../types';

interface ErrorAnalyticsTableProps {
  errorGroups: ErrorGroupStat[];
  onSelectErrorGroup: (errorGroupName: string) => void;
  selectedErrorGroup: string;
}

export const ErrorAnalyticsTable: React.FC<ErrorAnalyticsTableProps> = ({
  errorGroups,
  onSelectErrorGroup,
  selectedErrorGroup
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/40">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Phân tích nguyên nhân lỗi tiếp nhận HOC ({errorGroups.length} nhóm lỗi vi phạm)
            </h3>
            <p className="text-xs text-slate-500">
              Trích xuất tự động từ gói tin phản hồi của cổng HOC. Bấm vào lỗi để lọc ra danh sách bệnh nhân cần sửa trên HIS.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-2.5 px-4 w-12 text-center">STT</th>
              <th className="py-2.5 px-4 w-64">Nhóm lỗi vi phạm</th>
              <th className="py-2.5 px-3 text-right w-24">Số ca lỗi</th>
              <th className="py-2.5 px-3 text-right w-20">Tỷ lệ</th>
              <th className="py-2.5 px-4">Hướng dẫn khắc phục trên HIS</th>
              <th className="py-2.5 px-4 text-center w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {errorGroups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Không có hồ sơ nào bị báo lỗi tiếp nhận!
                </td>
              </tr>
            ) : (
              errorGroups.map((err, idx) => {
                const isSelected = selectedErrorGroup === err.nhomLoi;
                return (
                  <tr
                    key={err.nhomLoi}
                    onClick={() => onSelectErrorGroup(err.nhomLoi)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-rose-50/80 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{err.nhomLoi}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 text-sm">
                      {err.count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                      {err.tiLe}%
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      <div className="flex items-start space-x-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-[12px]">{err.huongDan}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectErrorGroup(err.nhomLoi);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-medium transition-colors shadow-xs"
                      >
                        <span>Lọc ca này</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
