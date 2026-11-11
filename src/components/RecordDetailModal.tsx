import React from 'react';
import { 
  X, 
  User, 
  Building2, 
  Calendar, 
  Server, 
  FileCheck2, 
  AlertTriangle, 
  Wrench, 
  Layers, 
  Copy, 
  Check,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { ReconciledRecord } from '../types';

interface RecordDetailModalProps {
  record: ReconciledRecord | null;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!record) return null;

  const handleCopyTrans = () => {
    if (record.maGiaoDich) {
      navigator.clipboard.writeText(record.maGiaoDich);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-lg font-mono">
              BA
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  {record.hoTen || 'Hồ sơ bệnh nhân'}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {record.maBA || 'Chưa có Mã BA'}
                </span>
                {record.maBN && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono text-slate-300 bg-slate-800">
                    {record.maBN}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chi tiết đối soát hồ sơ khám sức khỏe liên thông giữa HIS và Cổng HOC
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              record.trangThaiDoiChieu === 'MATCH_SUCCESS'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : record.trangThaiDoiChieu === 'MATCH_FAILED'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : record.trangThaiDoiChieu === 'HIS_TRANS_NOT_IN_HOC'
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {record.trangThaiDoiChieu === 'MATCH_SUCCESS' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : record.trangThaiDoiChieu === 'MATCH_FAILED' ? (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  Trạng thái đối chiếu: {record.nhanDoiChieu}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase bg-white/80 border">
                  HOC: {record.trangThaiHOC}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-90">
                {record.chiTietLoi || 'Hồ sơ đã được đồng bộ hợp lệ lên cổng HOC.'}
              </p>
              {record.huongDanKhacPhuc && record.trangThaiDoiChieu === 'MATCH_FAILED' && (
                <div className="mt-2 p-2.5 bg-white/90 rounded-lg border border-rose-200 text-rose-800 flex items-start space-x-2">
                  <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hướng dẫn khắc phục: </span>
                    <span>{record.huongDanKhacPhuc}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2-Column Comparison Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Thông tin hành chính & Tiếp nhận */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-bold border-b pb-2">
                <User className="w-4 h-4 text-sky-600" />
                <span>1. Thông tin Hành chính & Tiếp nhận (HIS)</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã Bệnh Án:</span>
                  <span className="font-mono font-bold text-sky-700">{record.maBA || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã Bệnh Nhân:</span>
                  <span className="font-mono text-slate-800">{record.maBN || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-semibold text-slate-900">{record.hoTen || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày sinh / Giới tính:</span>
                  <span className="text-slate-800">
                    {record.ngaySinh || '—'} ({record.gioiTinh || 'Không rõ'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số CMT / CCCD:</span>
                  <span className="font-mono font-medium text-slate-800">{record.cccd || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono text-slate-800">{record.sdt || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nơi làm việc:</span>
                  <span className="font-semibold text-teal-800 text-right max-w-[200px]">
                    {record.noiLamViec || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Khoa / Phòng khám:</span>
                  <span className="text-slate-800 text-right">{record.khoaPhong || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bác sĩ / Người tiếp nhận:</span>
                  <span className="text-slate-800">{record.nguoiTiepNhan || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày đăng ký / tiếp nhận (HIS):</span>
                  <span className="font-mono font-semibold text-emerald-700">{record.ngayKham || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Địa chỉ:</span>
                  <span className="text-slate-800 text-right max-w-[220px]">{record.diaChi || '—'}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Thông tin giao dịch & Cổng HOC */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-bold border-b pb-2">
                <Server className="w-4 h-4 text-purple-600" />
                <span>2. Dữ liệu Giao dịch & Phản hồi Cổng HOC</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div>
                  <span className="text-slate-500 block mb-1">Mã giao dịch (Transaction ID):</span>
                  {record.maGiaoDich ? (
                    <div className="flex items-center space-x-1.5 p-2 bg-white rounded border border-slate-200">
                      <span className="font-mono text-[11px] text-slate-900 break-all select-all flex-1">
                        {record.maGiaoDich}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyTrans}
                        className="p-1 text-slate-500 hover:text-sky-600 rounded"
                        title="Sao chép"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-amber-600 italic">Chưa được sinh mã giao dịch trên HIS</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Người gửi từ HIS:</span>
                  <span className="text-slate-800 font-medium">{record.nguoiGuiHIS || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã MSG / Kết quả gửi HIS:</span>
                  <span className="text-slate-800">{record.ketQuaGuiHIS || record.maMsgHIS || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái trên HOC:</span>
                  <span className={`font-bold ${record.trangThaiHOC === 'Thành công' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {record.trangThaiHOC}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian đẩy / Xử lý (HOC):</span>
                  <span className="font-mono font-semibold text-purple-700">{record.thoiDiemXuLyHOC || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã liên kết HOC:</span>
                  <span className="font-mono text-slate-800">{record.maLienKetHOC || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã cơ sở KCB:</span>
                  <span className="font-mono text-slate-800">{record.maCoSoKCB || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loại giấy KSK:</span>
                  <span className="text-slate-800">{record.loaiGiay || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw HOC Response & JSON Viewer (if failed) */}
          {record.ketQuaTiepNhanHOCRaw && (
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">
                Nội dung phản hồi nguyên bản từ Cổng tiếp nhận HOC (Raw Payload):
              </span>
              <pre className="p-3 bg-slate-900 text-sky-300 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-40">
                {record.ketQuaTiepNhanHOCRaw}
              </pre>
            </div>
          )}

          {/* Source Files Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-slate-500">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Nguồn dữ liệu: <strong>{record.sourceFiles.join(', ')}</strong></span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
