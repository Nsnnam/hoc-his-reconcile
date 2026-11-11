export type FileType = 'HIS_EXPORT' | 'HIS_RECEPTION' | 'HOC_RESULT' | 'UNKNOWN';

export interface UploadedFileRecord {
  id: string;
  name: string;
  size: number;
  rowCount: number;
  fileType: FileType;
  fileTypeLabel: string;
  uploadTime: string;
  rawRows: Record<string, any>[];
}

export type ReconcileStatus = 
  | 'MATCH_SUCCESS'        // Khớp - Thành công trên HOC
  | 'MATCH_FAILED'         // Khớp - Thất bại trên HOC
  | 'HIS_NO_TRANS'         // HIS chưa có mã giao dịch (chưa đẩy)
  | 'HIS_TRANS_NOT_IN_HOC' // HIS đã có mã GD nhưng chưa tìm thấy KQ trên HOC (đang chờ)
  | 'HOC_ONLY';            // Chỉ có trên HOC (chưa tìm thấy HIS)

export interface ReconciledRecord {
  id: string; // Key ưu tiên: maBA hoặc maGiaoDich
  maBA: string; // Mã BA (BAxxxx) - Mã bệnh nhân / Bệnh án
  maBN: string; // Mã BN (BNxxxx)
  hoTen: string; // Họ và tên bệnh nhân
  ngaySinh: string; // Ngày sinh
  gioiTinh: string; // Giới tính (Nam / Nữ)
  cccd: string; // CCCD / CMT
  sdt: string; // Số điện thoại
  diaChi: string; // Địa chỉ
  noiLamViec: string; // Nơi làm việc / Công ty
  khoaPhong: string; // Khoa / Phòng khám
  nguoiTiepNhan: string; // Người tiếp nhận / Bác sĩ
  ngayKham: string; // Ngày tiếp nhận khám
  ngayDayHoSo: string; // Ngày đẩy hồ sơ / Thời điểm gửi
  
  // Thông tin HIS
  maGiaoDich: string; // Mã giao dịch (Transaction ID)
  nguoiGuiHIS: string; // Người gửi trên HIS
  maMsgHIS: string; // Mã MSG
  ketQuaGuiHIS: string; // Kết quả gửi trên HIS
  thoiGianKqHIS: string; // Thời gian kết quả HIS
  loaiGiay: string; // Loại giấy KSK
  coMaGiaoDichHIS: boolean;

  // Thông tin HOC
  trangThaiHOC: 'Thành công' | 'Thất bại' | 'Chưa đồng bộ' | 'Không xác định';
  thoiDiemXuLyHOC: string;
  maLienKetHOC: string;
  maCoSoKCB: string;
  ketQuaTiepNhanHOCRaw: string;
  chiTietLoi: string;
  nhomLoi: string;
  huongDanKhacPhuc: string;

  // Kết quả đối chiếu
  trangThaiDoiChieu: ReconcileStatus;
  nhanDoiChieu: string;
  sourceFiles: string[];
  isPrioritized: boolean; // Ưu tiên từ HIS
}

export interface SummaryStats {
  total: number;
  hocSuccess: number;
  hocFailed: number;
  hisHasTrans: number;
  hisNoTrans: number;
  pendingHoc: number;
  hocOnly: number;
  companiesCount: number;
}

export interface WorkplaceStat {
  noiLamViec: string;
  total: number;
  hisHasTrans: number;
  hisNoTrans: number;
  hocSuccess: number;
  hocFailed: number;
  pendingHoc: number;
  successRate: number;
}

export interface ErrorGroupStat {
  nhomLoi: string;
  tenLoi: string;
  count: number;
  huongDan: string;
  tiLe: number;
}

export interface DateStat {
  ngay: string; // dd/mm/yyyy
  total: number;
  hocSuccess: number;
  hocFailed: number;
  hisNoTrans: number;
  type?: 'NGAY_TIEP_NHAN' | 'NGAY_DAY_HOC';
}

export interface FilterCriteria {
  searchTerm: string; // BA, BN, Họ tên, CCCD, Mã GD
  noiLamViec: string;
  trangThaiDoiChieu: string; // 'ALL' | ReconcileStatus
  trangThaiHOC: string; // 'ALL' | 'Thành công' | 'Thất bại' | 'Chưa đồng bộ'
  trangThaiHIS: string; // 'ALL' | 'HAS_TRANS' | 'NO_TRANS'
  nhomLoi: string;
  tuNgayKham: string; // Ngày đăng ký / tiếp nhận khám (HIS)
  denNgayKham: string;
  tuNgayDayHOC: string; // Ngày đẩy lên cổng (HOC)
  denNgayDayHOC: string;
}

export interface PortalLink {
  id: string;
  title: string;
  shortTitle: string;
  url: string;
  description: string;
  fileType: string;
  sourceType: 'HOC' | 'HIS_RECEPTION' | 'HIS_EXPORT';
  badge: string;
  badgeColor: string;
}

export const EXTERNAL_PORTAL_LINKS: PortalLink[] = [
  {
    id: 'hoc_1551',
    title: 'Cổng Tra Cứu HOC 1551',
    shortTitle: 'Cổng HOC (1551)',
    url: 'https://moc.congdulieuyte.vn/hoc/tra-cuu/tra-cuu-tiep-nhan-1551',
    description: 'Tra cứu danh sách tiếp nhận và kết quả hồ sơ KSK 1551 từ Bộ Y Tế',
    fileType: 'File HOC Tiếp nhận 1551 (.xlsx)',
    sourceType: 'HOC',
    badge: 'Cổng HOC',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
  },
  {
    id: 'his_reception',
    title: 'Xuất Đăng Ký Tiếp Nhận',
    shortTitle: 'Đăng Ký Tiếp Nhận (HIS)',
    url: 'https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../ngoaitru/NGT01T001_tiepnhan_ngt',
    description: 'Xuất danh sách tiếp nhận người bệnh có Nơi làm việc (Cty), SĐT, Khoa phòng',
    fileType: 'File HIS Tiếp nhận & Cty (.xls)',
    sourceType: 'HIS_RECEPTION',
    badge: 'HIS Tiếp Nhận',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
  },
  {
    id: 'his_ksk',
    title: 'Quản Lý Hồ Sơ KSK',
    shortTitle: 'Quản Lý KSK (HIS)',
    url: 'https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../noitru/NTU_QuanLyHS_KSK',
    description: 'Quản lý và xuất danh sách hồ sơ khám sức khỏe đẩy liên thông cổng, có Mã giao dịch',
    fileType: 'File HIS Đẩy hồ sơ KSK (.xls)',
    sourceType: 'HIS_EXPORT',
    badge: 'HIS Giám Sát KSK',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
  }
];

