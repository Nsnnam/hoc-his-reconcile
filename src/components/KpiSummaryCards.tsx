import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Building2, 
  ArrowUpRight 
} from 'lucide-react';
import { SummaryStats } from '../types';

interface KpiSummaryCardsProps {
  summary: SummaryStats;
  activeStatusFilter: string;
  onFilterByStatus: (status: string) => void;
  onSelectWorkplaceTab: () => void;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({
  summary,
  activeStatusFilter,
  onFilterByStatus,
  onSelectWorkplaceTab
}) => {
  const successRate = summary.total > 0 ? Math.round((summary.hocSuccess / summary.total) * 100) : 0;
  const failureRate = summary.total > 0 ? Math.round((summary.hocFailed / summary.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Tổng số hồ sơ */}
      <div
        onClick={() => onFilterByStatus('ALL')}
        className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-md ${
          activeStatusFilter === 'ALL'
            ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/20'
            : 'border-slate-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Tổng hồ sơ</span>
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {summary.total.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>Ưu tiên mã HIS</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      {/* 2. HOC Tiếp nhận Thành công */}
      <div
        onClick={() => onFilterByStatus('MATCH_SUCCESS')}
        className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-md ${
          activeStatusFilter === 'MATCH_SUCCESS'
            ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-600 mb-1">
          <span className="text-xs font-medium">HOC Thành công</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
          {summary.hocSuccess.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-600 font-medium">
          <span>Đạt {successRate}%</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">Hợp lệ</span>
        </div>
      </div>

      {/* 3. HOC Thất bại / Lỗi */}
      <div
        onClick={() => onFilterByStatus('MATCH_FAILED')}
        className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-md ${
          activeStatusFilter === 'MATCH_FAILED'
            ? 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/20'
            : 'border-slate-200 hover:border-rose-300'
        }`}
      >
        <div className="flex items-center justify-between text-rose-600 mb-1">
          <span className="text-xs font-medium">HOC Báo lỗi</span>
          <XCircle className="w-4 h-4 text-rose-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-rose-700 tracking-tight">
          {summary.hocFailed.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-rose-600 font-medium">
          <span>Chiếm {failureRate}%</span>
          <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded">Cần sửa</span>
        </div>
      </div>

      {/* 4. HIS Chưa có mã GD */}
      <div
        onClick={() => onFilterByStatus('HIS_NO_TRANS')}
        className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-md ${
          activeStatusFilter === 'HIS_NO_TRANS'
            ? 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/20'
            : 'border-slate-200 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between text-amber-600 mb-1">
          <span className="text-xs font-medium">Chưa có mã GD</span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
          {summary.hisNoTrans.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-amber-700">
          <span>Chưa đẩy cổng</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">HIS</span>
        </div>
      </div>

      {/* 5. Chờ phản hồi HOC */}
      <div
        onClick={() => onFilterByStatus('HIS_TRANS_NOT_IN_HOC')}
        className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-md ${
          activeStatusFilter === 'HIS_TRANS_NOT_IN_HOC'
            ? 'ring-2 ring-sky-500 border-sky-400 bg-sky-50/20'
            : 'border-slate-200 hover:border-sky-300'
        }`}
      >
        <div className="flex items-center justify-between text-sky-600 mb-1">
          <span className="text-xs font-medium">Chờ kết quả HOC</span>
          <AlertCircle className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-sky-700 tracking-tight">
          {summary.pendingHoc.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-sky-700">
          <span>Đã gửi từ HIS</span>
          <span className="text-[10px] bg-sky-100 text-sky-800 px-1 rounded">Chờ HOC</span>
        </div>
      </div>

      {/* 6. Nơi làm việc / Doanh nghiệp */}
      <div
        onClick={onSelectWorkplaceTab}
        className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-teal-300 transition-all cursor-pointer hover:shadow-md group"
      >
        <div className="flex items-center justify-between text-teal-600 mb-1">
          <span className="text-xs font-medium">Đơn vị / Cty</span>
          <Building2 className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-teal-700 tracking-tight">
          {summary.companiesCount.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-teal-700">
          <span>Xem phân tích</span>
          <ArrowUpRight className="w-3 h-3 text-teal-500" />
        </div>
      </div>
    </div>
  );
};
