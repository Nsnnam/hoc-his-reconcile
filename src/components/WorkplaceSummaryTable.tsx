import React, { useState } from 'react';
import { Building2, Search, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { WorkplaceStat } from '../types';

interface WorkplaceSummaryTableProps {
  workplaces: WorkplaceStat[];
  onSelectWorkplace: (workplaceName: string) => void;
  selectedWorkplace: string;
}

export const WorkplaceSummaryTable: React.FC<WorkplaceSummaryTableProps> = ({
  workplaces,
  onSelectWorkplace,
  selectedWorkplace
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = workplaces.filter(w =>
    w.noiLamViec.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Thống kê tổng hợp theo Nơi làm việc ({workplaces.length} đơn vị)
            </h3>
            <p className="text-xs text-slate-500">
              Bấm vào từng đơn vị để xem danh sách chi tiết các hồ sơ và mã BA tương ứng
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm tên công ty, đơn vị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-2.5 px-4 w-12 text-center">STT</th>
              <th className="py-2.5 px-4">Nơi làm việc / Doanh nghiệp</th>
              <th className="py-2.5 px-3 text-right">Tổng hồ sơ</th>
              <th className="py-2.5 px-3 text-right">Có mã GD</th>
              <th className="py-2.5 px-3 text-right text-emerald-700">Thành công</th>
              <th className="py-2.5 px-3 text-right text-rose-700">Thất bại</th>
              <th className="py-2.5 px-3 text-right text-sky-700">Chờ KQ</th>
              <th className="py-2.5 px-4 text-center">Tỷ lệ đạt</th>
              <th className="py-2.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Không tìm thấy đơn vị nào phù hợp
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = selectedWorkplace === item.noiLamViec;
                return (
                  <tr
                    key={item.noiLamViec}
                    onClick={() => onSelectWorkplace(item.noiLamViec)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-50/80 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center space-x-2">
                        <span>{item.noiLamViec}</span>
                        {item.noiLamViec.includes('GETECH') && (
                          <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] rounded font-mono font-medium">
                            Đã đối chiếu
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {item.total.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {item.hisHasTrans.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">
                      {item.hocSuccess.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">
                      {item.hocFailed.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-sky-600">
                      {item.pendingHoc.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${item.successRate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 w-8 text-right">
                          {item.successRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWorkplace(item.noiLamViec);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-medium transition-colors shadow-xs"
                      >
                        <span>Lọc chi tiết</span>
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
