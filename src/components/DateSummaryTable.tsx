import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, Building, Globe } from 'lucide-react';
import { DateStat } from '../types';

interface DateSummaryTableProps {
  hisDateStats: DateStat[];
  hocDateStats: DateStat[];
  onSelectDate: (date: string, type: 'HIS' | 'HOC') => void;
  selectedDate: string;
}

export const DateSummaryTable: React.FC<DateSummaryTableProps> = ({
  hisDateStats,
  hocDateStats,
  onSelectDate,
  selectedDate
}) => {
  const [activeDateTab, setActiveDateTab] = useState<'HIS' | 'HOC'>('HIS');

  const currentStats = activeDateTab === 'HIS' ? hisDateStats : hocDateStats;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Header & Sub-Tabs */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            {activeDateTab === 'HIS' ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5 text-purple-600" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Báo Cáo Thống Kê Theo Thời Gian</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                activeDateTab === 'HIS'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-purple-100 text-purple-800 border border-purple-200'
              }`}>
                {activeDateTab === 'HIS' ? 'Ngày Đăng Ký / Tiếp Nhận (HIS)' : 'Thời Gian Đẩy Hồ Sơ (HOC)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {activeDateTab === 'HIS'
                ? 'Thống kê theo ngày đăng ký khám thực tế từ phần tiếp nhận của bệnh viện (HIS)'
                : 'Thống kê theo thời gian hồ sơ được gửi và xử lý trên cổng HOC (định dạng dd/mm/yyyy)'}
            </p>
          </div>
        </div>

        {/* Toggle between HIS Reception Date and HOC Push Date */}
        <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveDateTab('HIS')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all ${
              activeDateTab === 'HIS'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ngày tiếp nhận (HIS)</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono">
              {hisDateStats.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDateTab('HOC')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all ${
              activeDateTab === 'HOC'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>Thời gian đẩy (HOC)</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono">
              {hocDateStats.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-100/90 z-10 backdrop-blur-xs">
            <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-2.5 px-4 w-12 text-center">STT</th>
              <th className="py-2.5 px-4">
                {activeDateTab === 'HIS' ? 'Ngày Tiếp Nhận Khám (HIS)' : 'Ngày Đẩy Lên Cổng (HOC)'}
              </th>
              <th className="py-2.5 px-3 text-right">Tổng hồ sơ</th>
              <th className="py-2.5 px-3 text-right text-emerald-700">Thành công</th>
              <th className="py-2.5 px-3 text-right text-rose-700">Thất bại</th>
              <th className="py-2.5 px-3 text-right text-amber-700">Chưa có mã GD</th>
              <th className="py-2.5 px-4 text-center">Tỷ lệ đạt</th>
              <th className="py-2.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentStats.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  {activeDateTab === 'HIS'
                    ? 'Chưa có thông tin ngày tiếp nhận khám từ HIS'
                    : 'Chưa có thông tin thời điểm xử lý từ cổng HOC'}
                </td>
              </tr>
            ) : (
              currentStats.map((item, idx) => {
                const isSelected = selectedDate === item.ngay;
                const rate = item.total > 0 ? Math.round((item.hocSuccess / item.total) * 100) : 0;
                return (
                  <tr
                    key={item.ngay}
                    onClick={() => onSelectDate(item.ngay, activeDateTab)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-4 font-semibold text-slate-800 font-mono">
                      <div className="flex items-center space-x-1.5">
                        {activeDateTab === 'HIS' ? (
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        <span>{item.ngay}</span>
                      </div>
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
                          onSelectDate(item.ngay, activeDateTab);
                        }}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 text-white rounded text-[11px] font-medium transition-colors ${
                          activeDateTab === 'HIS'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-purple-600 hover:bg-purple-500'
                        }`}
                      >
                        <span>Lọc ngày này</span>
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
