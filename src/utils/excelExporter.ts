import * as XLSX from 'xlsx';
import { ErrorGroupStat, ReconciledRecord, WorkplaceStat } from '../types';

export function exportReconciliationToExcel(
  records: ReconciledRecord[],
  workplaceStats: WorkplaceStat[],
  errorStats: ErrorGroupStat[],
  fileNamePrefix: string = 'KetQua_DoiChieu_HOC_HIS'
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Chi tiết đối chiếu
  const detailData = records.map((r, idx) => ({
    'STT': idx + 1,
    'Mã Bệnh Án (BA)': r.maBA || '',
    'Mã Bệnh Nhân (BN)': r.maBN || '',
    'Họ và Tên': r.hoTen || '',
    'Nơi Làm Việc (Công ty)': r.noiLamViec || '',
    'Ngày Đăng Ký / Tiếp Nhận (HIS)': r.ngayKham || '',
    'Thời Gian Đẩy Hồ Sơ (HOC)': r.thoiDiemXuLyHOC || '',
    'Mã Giao Dịch (Transaction ID)': r.maGiaoDich || '',
    'Trạng Thái HOC': r.trangThaiHOC,
    'Kết Quả Đối Chiếu': r.nhanDoiChieu,
    'Nhóm Lỗi': r.nhomLoi || '',
    'Chi Tiết Lỗi / Phản Hồi': r.chiTietLoi || '',
    'Hướng Dẫn Khắc Phục': r.huongDanKhacPhuc || '',
    'Người Gửi HIS': r.nguoiGuiHIS || '',
    'Kết Quả Gửi HIS': r.ketQuaGuiHIS || '',
    'Thời Gian KQ HIS': r.thoiGianKqHIS || '',
    'CCCD / CMT': r.cccd || '',
    'Ngày Sinh': r.ngaySinh || '',
    'Giới Tính': r.gioiTinh || '',
    'Số Điện Thoại': r.sdt || '',
    'Địa Chỉ': r.diaChi || '',
    'Khoa / Phòng': r.khoaPhong || '',
    'Bác Sĩ / Người TN': r.nguoiTiepNhan || '',
    'Mã Liên Kết HOC': r.maLienKetHOC || '',
    'Mã Cơ Sở KCB': r.maCoSoKCB || '',
    'Tệp Nguồn Đã Ghép': r.sourceFiles.join(', ')
  }));

  const wsDetail = XLSX.utils.json_to_sheet(detailData);
  // Cấu hình độ rộng cột
  wsDetail['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã BA
    { wch: 14 }, // Mã BN
    { wch: 24 }, // Họ tên
    { wch: 30 }, // Nơi làm việc
    { wch: 24 }, // Ngày tiếp nhận HIS
    { wch: 24 }, // Thời gian đẩy HOC
    { wch: 35 }, // Mã GD
    { wch: 15 }, // TT HOC
    { wch: 22 }, // KQ Đối chiếu
    { wch: 32 }, // Nhóm lỗi
    { wch: 45 }, // Chi tiết lỗi
    { wch: 45 }, // Hướng dẫn
    { wch: 20 }, // Người gửi
    { wch: 20 }, // KQ HIS
    { wch: 20 }, // TG KQ HIS
    { wch: 16 }, // CCCD
    { wch: 12 }, // Ngày sinh
    { wch: 10 }, // Giới tính
    { wch: 14 }, // SĐT
    { wch: 30 }, // Địa chỉ
    { wch: 25 }, // Phòng khám
    { wch: 22 }, // Người TN
    { wch: 14 }, // Mã liên kết
    { wch: 14 }, // Mã cơ sở
    { wch: 35 }  // Tệp nguồn
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi Tiết Đối Chiếu');

  // 2. Sheet Thống kê theo Nơi làm việc
  const wpData = workplaceStats.map((w, idx) => ({
    'STT': idx + 1,
    'Nơi Làm Việc (Doanh nghiệp / Đơn vị)': w.noiLamViec,
    'Tổng Số Hồ Sơ': w.total,
    'Đã Có Mã GD (HIS)': w.hisHasTrans,
    'Chưa Có Mã GD': w.hisNoTrans,
    'Tiếp Nhận Thành Công (HOC)': w.hocSuccess,
    'Báo Lỗi / Thất Bại (HOC)': w.hocFailed,
    'Đang Chờ Xử Lý / Treo': w.pendingHoc,
    'Tỷ Lệ Thành Công (%)': `${w.successRate}%`
  }));
  const wsWp = XLSX.utils.json_to_sheet(wpData);
  wsWp['!cols'] = [
    { wch: 6 },
    { wch: 35 },
    { wch: 15 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsWp, 'Tổng Hợp Theo Nơi Làm Việc');

  // 3. Sheet Phân tích lỗi HOC
  const errData = errorStats.map((e, idx) => ({
    'STT': idx + 1,
    'Nhóm Lỗi Vi Phạm': e.nhomLoi,
    'Số Ca Mắc Phải': e.count,
    'Tỷ Lệ Trên Tổng Lỗi (%)': `${e.tiLe}%`,
    'Hướng Dẫn Khắc Phục Dữ Liệu': e.huongDan,
    'Ví Dụ Trích Xuất Báo Lỗi': e.tenLoi
  }));
  const wsErr = XLSX.utils.json_to_sheet(errData);
  wsErr['!cols'] = [
    { wch: 6 },
    { wch: 35 },
    { wch: 16 },
    { wch: 22 },
    { wch: 50 },
    { wch: 60 }
  ];
  XLSX.utils.book_append_sheet(wb, wsErr, 'Phân Tích Lỗi HOC');

  // Xuất file
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `${fileNamePrefix}_${timestamp}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
