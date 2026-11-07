import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { DateStat } from '../types';

interface DateSummaryTableProps {
  dateStats: DateStat[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const DateSummaryTable: React.FC<DateSummaryTableProps> = ({
  dateStats,
  onSelectDate,
  selectedDate
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Thống kê theo Ngày tiếp nhận / Ngày khám ({dateStats.length} ngày)
            </h3>
            <p className="text-xs text-slate-500">
              Bấm vào ngày để lọc các hồ sơ khám trong ngày đó
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-100/90 z-10 backdrop-blur-xs">
            <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-2.5 px-4 w-12 text-center">STT</th>
              <th className="py-2.5 px-4">Ngày khám / Tiếp nhận</th>
              <th className="py-2.5 px-3 text-right">Tổng hồ sơ</th>
              <th className="py-2.5 px-3 text-right text-emerald-700">Thành công</th>
              <th className="py-2.5 px-3 text-right text-rose-700">Thất bại</th>
              <th className="py-2.5 px-3 text-right text-amber-700">Chưa có mã GD</th>
              <th className="py-2.5 px-4 text-center">Tỷ lệ đạt</th>
              <th className="py-2.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dateStats.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Chưa có dữ liệu ngày khám
                </td>
              </tr>
            ) : (
              dateStats.map((item, idx) => {
                const isSelected = selectedDate === item.ngay;
                const rate = item.total > 0 ? Math.round((item.hocSuccess / item.total) * 100) : 0;
                return (
                  <tr
                    key={item.ngay}
                    onClick={() => onSelectDate(item.ngay)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-4 font-semibold text-slate-800 font-mono">
                      {item.ngay}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {item.total.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-semibold">
                      {item.hocSuccess.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-600 font-semibold">
                      {item.hocFailed.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-amber-600">
                      {item.hisNoTrans.toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 w-8 text-right">
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(item.ngay);
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition-colors"
                      >
                        <span>Lọc</span>
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
