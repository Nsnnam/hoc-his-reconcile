import {
  DateStat,
  ErrorGroupStat,
  ReconciledRecord,
  ReconcileStatus,
  SummaryStats,
  UploadedFileRecord,
  WorkplaceStat
} from '../types';
import { formatCccd, formatDate, formatPhone, normalizeText } from './fileParser';

/**
 * Phân tích lỗi từ JSON hoặc text của HOC và trích xuất lỗi dễ hiểu kèm giải pháp
 */
export function parseHocError(rawError: any): { chiTietLoi: string; nhomLoi: string; huongDan: string } {
  if (!rawError) {
    return { chiTietLoi: '', nhomLoi: 'Không có lỗi', huongDan: '' };
  }

  const str = String(rawError).trim();
  if (!str || str === 'Hoàn thành xử lý danh sách hồ sơ KSK.') {
    return { chiTietLoi: 'Hoàn thành xử lý', nhomLoi: 'Thành công', huongDan: 'Hồ sơ đã được tiếp nhận hợp lệ trên HOC' };
  }

  // Thử parse JSON
  let msgs: string[] = [];
  let mainNhom = 'Lỗi dữ liệu KSK';
  let huongDan = 'Kiểm tra và cập nhật lại thông tin hồ sơ trên HIS rồi đẩy lại.';

  try {
    const data = JSON.parse(str);

    if (data.ket_qua && Array.isArray(data.ket_qua)) {
      for (const kq of data.ket_qua) {
        if (kq.error_list && Array.isArray(kq.error_list)) {
          for (const item of kq.error_list) {
            const file = item.file ? `[${item.file}]` : '';
            if (Array.isArray(item.errors)) {
              for (const e of item.errors) {
                msgs.push(`${e} ${file}`.trim());
              }
            }
          }
        }
      }
    }

    if (data.cks) {
      msgs.push(`Lỗi chữ ký số: ${data.cks}`);
    }

    if (msgs.length === 0 && data.message) {
      msgs.push(data.message);
    }
  } catch {
    // Không phải JSON, xử lý dạng chuỗi
    msgs.push(str);
  }

  const chiTietLoi = msgs.length > 0 ? msgs.join(' | ') : str;
  const lowerLoi = chiTietLoi.toLowerCase();

  // Phân loại nhóm lỗi phổ biến
  if (lowerLoi.includes('maxa_cu_tru') || lowerLoi.includes('mã xã')) {
    mainNhom = 'Thiếu mã xã cư trú (maxa_cu_tru)';
    huongDan = 'Bổ sung trường Mã Xã (maxa_cu_tru) trong thông tin hành chính người khám trên HIS.';
  } else if (lowerLoi.includes('doi_tuong') || lowerLoi.includes('đối tượng')) {
    mainNhom = 'Sai định dạng đối tượng KSK (doi_tuong)';
    huongDan = 'Kiểm tra mã hóa đối tượng KSK trên HIS theo danh mục quy chuẩn BYT (từ 1-16), không gửi chuỗi chữ tự do.';
  } else if (lowerLoi.includes('cks') || lowerLoi.includes('chữ ký số')) {
    mainNhom = 'Thiếu hoặc sai chữ ký số (CKS)';
    huongDan = 'Kiểm tra chứng thư số token của Bác sĩ kết luận hoặc Chữ ký số Bệnh viện.';
  } else if (lowerLoi.includes('so_cccd') || lowerLoi.includes('cccd')) {
    mainNhom = 'Thiếu số CCCD định danh';
    huongDan = 'Bổ sung số CCCD (12 số hợp lệ) của người khám trong XML1 hồ sơ KSK.';
  } else if (lowerLoi.includes('phan_loai_sk') || lowerLoi.includes('phân loại')) {
    mainNhom = 'Thiếu phân loại sức khỏe';
    huongDan = 'Hoàn thiện kết luận phân loại sức khỏe (Loại 1 đến 5) của người khám trên HIS.';
  } else {
    mainNhom = 'Lỗi hồ sơ KSK khác';
    huongDan = 'Mở chi tiết hồ sơ để xem nội dung báo lỗi cụ thể từ cổng tiếp nhận.';
  }

  return {
    chiTietLoi,
    nhomLoi: mainNhom,
    huongDan
  };
}

/**
 * Tìm giá trị của cột trong một hàng dựa trên danh sách các tên cột tương đương
 */
function getVal(row: Record<string, any>, possibleKeys: string[]): any {
  for (const key of Object.keys(row)) {
    const kNorm = normalizeText(key);
    for (const p of possibleKeys) {
      if (kNorm === p || kNorm.includes(p)) {
        const val = row[key];
        if (val !== undefined && val !== null && String(val).trim() !== '' && String(val).toLowerCase() !== 'nan') {
          return val;
        }
      }
    }
  }
  return '';
}

/**
 * Động cơ đối chiếu liên tục đa tệp (Multi-file Continuous Reconciliation)
 */
export function performReconciliation(files: UploadedFileRecord[]): {
  records: ReconciledRecord[];
  summary: SummaryStats;
  workplaceStats: WorkplaceStat[];
  errorGroupStats: ErrorGroupStat[];
  dateStats: DateStat[];
} {
  // Bản đồ lưu trữ các bản ghi duy nhất
  const masterMap = new Map<string, ReconciledRecord>();
  const transMap = new Map<string, string>(); // Transaction ID -> Master Key
  const baMap = new Map<string, string>();    // Mã BA -> Master Key
  const bnMap = new Map<string, string>();    // Mã BN -> Master Key
  const cccdMap = new Map<string, string>();  // CCCD -> Master Key

  // Tách các file HOC và HIS để xử lý theo thứ tự ưu tiên
  // Ưu tiên:
  // 1. Files HIS Export (chứa Mã giao dịch & Mã BA)
  // 2. Files HIS Reception (chứa Nơi làm việc & Mã BA)
  // 3. Files HOC Result (chứa Transaction ID & Trạng thái & Kết quả tiếp nhận)
  const sortedFiles = [...files].sort((a, b) => {
    const score = (t: string) => (t === 'HIS_EXPORT' ? 1 : t === 'HIS_RECEPTION' ? 2 : 3);
    return score(a.fileType) - score(b.fileType);
  });

  // Tạm lưu thông tin HOC riêng để ánh xạ sau nếu file HOC được nạp trước hoặc sau
  const hocResultsMap = new Map<string, {
    trangThai: string;
    thoiDiemXuLy: string;
    maLienKet: string;
    maCoSoKCB: string;
    ketQuaRaw: string;
    chiTietLoi: string;
    nhomLoi: string;
    huongDan: string;
    fileName: string;
  }>();

  // Duyệt qua tất cả các file
  for (const file of sortedFiles) {
    for (const row of file.rawRows) {
      if (file.fileType === 'HOC_RESULT') {
        const transId = String(getVal(row, ['transaction id', 'ma giao dich', 'magiaodich'])).trim();
        if (!transId) continue;

        const rawTrangThai = String(getVal(row, ['trang thai', 'trangthai', 'ket qua'])).trim();
        const ketQuaRaw = String(getVal(row, ['ket qua tiep nhan', 'ketquatiepnhan', 'noi dung'])).trim();
        const thoiDiemXuLy = formatDate(getVal(row, ['thoi diem xu ly', 'ngay xu ly', 'thoidiemxuly']));
        const maLienKet = String(getVal(row, ['ma lien ket', 'malienket'])).trim();
        const maCoSoKCB = String(getVal(row, ['ma co so kcb', 'macoso'])).trim();

        const { chiTietLoi, nhomLoi, huongDan } = parseHocError(ketQuaRaw);

        let trangThaiHocFormatted: 'Thành công' | 'Thất bại' = 'Thất bại';
        if (rawTrangThai.toLowerCase().includes('thanh cong') || ketQuaRaw.includes('Hoàn thành xử lý danh sách')) {
          trangThaiHocFormatted = 'Thành công';
        }

        hocResultsMap.set(transId, {
          trangThai: trangThaiHocFormatted,
          thoiDiemXuLy,
          maLienKet,
          maCoSoKCB,
          ketQuaRaw,
          chiTietLoi,
          nhomLoi,
          huongDan,
          fileName: file.name
        });
        continue;
      }

      // Xử lý file HIS (HIS_EXPORT hoặc HIS_RECEPTION hoặc UNKNOWN)
      const maBA = String(getVal(row, ['ma ba', 'maba', 'benh an', 'so ba'])).trim().toUpperCase();
      const maBN = String(getVal(row, ['ma bn', 'mabn', 'ma nguoi benh'])).trim().toUpperCase();
      const maGiaoDich = String(getVal(row, ['ma giao dich', 'transaction id', 'magiaodich'])).trim();
      const rawCccd = getVal(row, ['cccd', 'cmt', 'cmt/cccd', 'so cccd', 'cmnd']);
      const cccd = formatCccd(rawCccd);

      // Tìm bản ghi hiện có
      let recordKey = '';
      if (maBA && baMap.has(maBA)) {
        recordKey = baMap.get(maBA)!;
      } else if (maGiaoDich && transMap.has(maGiaoDich)) {
        recordKey = transMap.get(maGiaoDich)!;
      } else if (maBN && bnMap.has(maBN)) {
        recordKey = bnMap.get(maBN)!;
      } else if (cccd && cccd.length >= 9 && cccdMap.has(cccd)) {
        recordKey = cccdMap.get(cccd)!;
      }

      // Lấy hoặc tạo bản ghi mới
      let record: ReconciledRecord;
      if (recordKey && masterMap.has(recordKey)) {
        record = masterMap.get(recordKey)!;
      } else {
        recordKey = maBA || maGiaoDich || maBN || `REC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        record = {
          id: recordKey,
          maBA: '',
          maBN: '',
          hoTen: '',
          ngaySinh: '',
          gioiTinh: '',
          cccd: '',
          sdt: '',
          diaChi: '',
          noiLamViec: '',
          khoaPhong: '',
          nguoiTiepNhan: '',
          ngayKham: '',
          ngayDayHoSo: '',
          maGiaoDich: '',
          nguoiGuiHIS: '',
          maMsgHIS: '',
          ketQuaGuiHIS: '',
          thoiGianKqHIS: '',
          loaiGiay: '',
          coMaGiaoDichHIS: false,
          trangThaiHOC: 'Chưa đồng bộ',
          thoiDiemXuLyHOC: '',
          maLienKetHOC: '',
          maCoSoKCB: '',
          ketQuaTiepNhanHOCRaw: '',
          chiTietLoi: '',
          nhomLoi: '',
          huongDanKhacPhuc: '',
          trangThaiDoiChieu: 'HIS_NO_TRANS',
          nhanDoiChieu: 'Chưa có mã giao dịch',
          sourceFiles: [],
          isPrioritized: false
        };
        masterMap.set(recordKey, record);
      }

      // Cập nhật các trường cơ bản từ hàng hiện tại (nếu bản ghi chưa có hoặc có dữ liệu mới)
      if (maBA && !record.maBA) {
        record.maBA = maBA;
        baMap.set(maBA, recordKey);
      }

      if (maBN && !record.maBN) {
        record.maBN = maBN;
        bnMap.set(maBN, recordKey);
      }

      if (cccd && !record.cccd) {
        record.cccd = cccd;
        cccdMap.set(cccd, recordKey);
      }

      const hoTen = String(getVal(row, ['ho ten', 'ten benh nhan', 'hoten', 'ten bn'])).trim();
      if (hoTen && (!record.hoTen || record.hoTen.length < hoTen.length)) {
        record.hoTen = hoTen;
      }

      const ngaySinh = formatDate(getVal(row, ['ngay sinh', 'ngaysinh', 'nam sinh']));
      if (ngaySinh && !record.ngaySinh) record.ngaySinh = ngaySinh;

      const gioiTinh = String(getVal(row, ['gioi tinh', 'gioitinh', 'phai'])).trim();
      if (gioiTinh && !record.gioiTinh) record.gioiTinh = gioiTinh;

      const sdt = formatPhone(getVal(row, ['sdt', 'sdt bn', 'dien thoai', 'phone']));
      if (sdt && !record.sdt) record.sdt = sdt;

      const diaChi = String(getVal(row, ['dia chi', 'd/c bn', 'diachi', 'dia chi bn'])).trim();
      if (diaChi && !record.diaChi) record.diaChi = diaChi;

      // NƠI LÀM VIỆC (Ưu tiên cập nhật nếu có)
      const noiLamViec = String(getVal(row, ['noi lam viec', 'cong ty', 'don vi', 'doanh nghiep', 'co quan'])).trim();
      if (noiLamViec && (!record.noiLamViec || record.noiLamViec === 'Chưa cập nhật')) {
        record.noiLamViec = noiLamViec;
      }

      const khoaPhong = String(getVal(row, ['phong kham', 'phong', 'khoa', 'noi kham'])).trim();
      if (khoaPhong && !record.khoaPhong) record.khoaPhong = khoaPhong;

      const nguoiTN = String(getVal(row, ['nguoi tn', 'nguoi tiep nhan', 'bac si', 'bs'])).trim();
      if (nguoiTN && !record.nguoiTiepNhan) record.nguoiTiepNhan = nguoiTN;

      const ngayKham = formatDate(getVal(row, ['ngay tiep nhan', 'ngay kham', 'ngaytn', 'ngay']));
      if (ngayKham && !record.ngayKham) record.ngayKham = ngayKham;

      const loaiGiay = String(getVal(row, ['loai giay', 'loaigiay'])).trim();
      if (loaiGiay && !record.loaiGiay) record.loaiGiay = loaiGiay;

      // ƯU TIÊN MÃ GIAO DỊCH TỪ HIS
      if (maGiaoDich) {
        record.maGiaoDich = maGiaoDich;
        record.coMaGiaoDichHIS = true;
        record.isPrioritized = true;
        transMap.set(maGiaoDich, recordKey);

        const nguoiGui = String(getVal(row, ['nguoi gui', 'nguoigui'])).trim();
        if (nguoiGui) record.nguoiGuiHIS = nguoiGui;

        const maMsg = String(getVal(row, ['ma msg', 'mamsg'])).trim();
        if (maMsg) record.maMsgHIS = maMsg;

        const ketQuaGui = String(getVal(row, ['ket qua gui', 'ketquagui'])).trim();
        if (ketQuaGui) record.ketQuaGuiHIS = ketQuaGui;

        const thoiGianKq = formatDate(getVal(row, ['thoi gian kq', 'thoigiankq']));
        if (thoiGianKq) record.thoiGianKqHIS = thoiGianKq;
      }

      if (!record.sourceFiles.includes(file.name)) {
        record.sourceFiles.push(file.name);
      }
    }
  }

  // Bây giờ gắn kết quả từ HOC vào các bản ghi master
  const matchedHocTrans = new Set<string>();

  masterMap.forEach(record => {
    // Điền mặc định nếu thiếu nơi làm việc
    if (!record.noiLamViec) {
      record.noiLamViec = 'Khám tự do / Khác';
    }

    if (record.maGiaoDich && hocResultsMap.has(record.maGiaoDich)) {
      const hoc = hocResultsMap.get(record.maGiaoDich)!;
      matchedHocTrans.add(record.maGiaoDich);

      record.trangThaiHOC = hoc.trangThai as any;
      record.thoiDiemXuLyHOC = hoc.thoiDiemXuLy;
      record.maLienKetHOC = hoc.maLienKet;
      record.maCoSoKCB = hoc.maCoSoKCB;
      record.ketQuaTiepNhanHOCRaw = hoc.ketQuaRaw;
      record.chiTietLoi = hoc.chiTietLoi;
      record.nhomLoi = hoc.nhomLoi;
      record.huongDanKhacPhuc = hoc.huongDan;

      if (!record.sourceFiles.includes(hoc.fileName)) {
        record.sourceFiles.push(hoc.fileName);
      }

      if (hoc.trangThai === 'Thành công') {
        record.trangThaiDoiChieu = 'MATCH_SUCCESS';
        record.nhanDoiChieu = 'Thành công';
      } else {
        record.trangThaiDoiChieu = 'MATCH_FAILED';
        record.nhanDoiChieu = 'Thất bại trên HOC';
      }
    } else if (record.maGiaoDich) {
      // Có mã giao dịch HIS nhưng chưa có kết quả trên HOC
      record.trangThaiHOC = 'Chưa đồng bộ';
      record.trangThaiDoiChieu = 'HIS_TRANS_NOT_IN_HOC';
      record.nhanDoiChieu = 'Đã đẩy, chờ KQ trên HOC';
      record.chiTietLoi = 'Chưa tìm thấy phản hồi từ cổng HOC cho mã giao dịch này.';
      record.nhomLoi = 'Đang chờ xử lý / Treo';
      record.huongDanKhacPhuc = 'Chờ cổng HOC xử lý đợt giao dịch hoặc xuất lại file tiếp nhận mới nhất từ HOC.';
    } else {
      // Chưa có mã giao dịch trên HIS
      record.trangThaiHOC = 'Chưa đồng bộ';
      record.trangThaiDoiChieu = 'HIS_NO_TRANS';
      record.nhanDoiChieu = 'Chưa có mã GD HIS';
      record.chiTietLoi = 'Hồ sơ chưa được tạo mã giao dịch hoặc chưa thực hiện đẩy liên thông từ HIS.';
      record.nhomLoi = 'Chưa đẩy liên thông';
      record.huongDanKhacPhuc = 'Vào phần mềm HIS thực hiện đẩy hồ sơ KSK lên cổng giám sát.';
    }
  });

  // Xử lý các giao dịch trên HOC nhưng chưa có trong các file HIS đã nạp
  hocResultsMap.forEach((hoc, transId) => {
    if (!matchedHocTrans.has(transId)) {
      const hocKey = `HOC-${transId}`;
      const hocOnlyRecord: ReconciledRecord = {
        id: hocKey,
        maBA: 'Chưa map BA',
        maBN: '',
        hoTen: `Hồ sơ ${transId.substring(0, 16)}...`,
        ngaySinh: '',
        gioiTinh: '',
        cccd: '',
        sdt: '',
        diaChi: '',
        noiLamViec: 'Chưa xác định trên HIS',
        khoaPhong: '',
        nguoiTiepNhan: '',
        ngayKham: hoc.thoiDiemXuLy ? hoc.thoiDiemXuLy.split(' ')[0] : '',
        ngayDayHoSo: hoc.thoiDiemXuLy,
        maGiaoDich: transId,
        nguoiGuiHIS: '',
        maMsgHIS: '',
        ketQuaGuiHIS: '',
        thoiGianKqHIS: '',
        loaiGiay: '',
        coMaGiaoDichHIS: true,
        trangThaiHOC: hoc.trangThai as any,
        thoiDiemXuLyHOC: hoc.thoiDiemXuLy,
        maLienKetHOC: hoc.maLienKet,
        maCoSoKCB: hoc.maCoSoKCB,
        ketQuaTiepNhanHOCRaw: hoc.ketQuaRaw,
        chiTietLoi: hoc.chiTietLoi,
        nhomLoi: hoc.nhomLoi,
        huongDanKhacPhuc: hoc.huongDan,
        trangThaiDoiChieu: 'HOC_ONLY',
        nhanDoiChieu: 'Chỉ có trên HOC',
        sourceFiles: [hoc.fileName],
        isPrioritized: false
      };
      masterMap.set(hocKey, hocOnlyRecord);
    }
  });

  // Chuyển thành danh sách bản ghi
  const records = Array.from(masterMap.values());

  // Sắp xếp: Ưu tiên hồ sơ Thất bại cần sửa lên trước, sau đó hồ sơ có mã giao dịch, theo ngày khám mới nhất
  records.sort((a, b) => {
    const priority = (s: ReconcileStatus) => {
      switch (s) {
        case 'MATCH_FAILED': return 1;
        case 'HIS_TRANS_NOT_IN_HOC': return 2;
        case 'HIS_NO_TRANS': return 3;
        case 'MATCH_SUCCESS': return 4;
        case 'HOC_ONLY': return 5;
        default: return 6;
      }
    };
    const pA = priority(a.trangThaiDoiChieu);
    const pB = priority(b.trangThaiDoiChieu);
    if (pA !== pB) return pA - pB;
    return (b.ngayKham || '').localeCompare(a.ngayKham || '');
  });

  // Tính toán thống kê tổng hợp (Summary KPIs)
  const summary: SummaryStats = {
    total: records.length,
    hocSuccess: records.filter(r => r.trangThaiHOC === 'Thành công').length,
    hocFailed: records.filter(r => r.trangThaiHOC === 'Thất bại').length,
    hisHasTrans: records.filter(r => r.coMaGiaoDichHIS).length,
    hisNoTrans: records.filter(r => !r.coMaGiaoDichHIS).length,
    pendingHoc: records.filter(r => r.trangThaiDoiChieu === 'HIS_TRANS_NOT_IN_HOC').length,
    hocOnly: records.filter(r => r.trangThaiDoiChieu === 'HOC_ONLY').length,
    companiesCount: new Set(records.map(r => r.noiLamViec).filter(w => w && w !== 'Khám tự do / Khác' && w !== 'Chưa xác định trên HIS')).size
  };

  // Thống kê theo Nơi làm việc (Workplace Stats)
  const wpMap = new Map<string, { total: number; hisHasTrans: number; hisNoTrans: number; hocSuccess: number; hocFailed: number; pendingHoc: number }>();
  for (const r of records) {
    const wp = r.noiLamViec || 'Khám tự do / Khác';
    if (!wpMap.has(wp)) {
      wpMap.set(wp, { total: 0, hisHasTrans: 0, hisNoTrans: 0, hocSuccess: 0, hocFailed: 0, pendingHoc: 0 });
    }
    const stat = wpMap.get(wp)!;
    stat.total++;
    if (r.coMaGiaoDichHIS) stat.hisHasTrans++;
    else stat.hisNoTrans++;

    if (r.trangThaiHOC === 'Thành công') stat.hocSuccess++;
    else if (r.trangThaiHOC === 'Thất bại') stat.hocFailed++;
    else if (r.trangThaiDoiChieu === 'HIS_TRANS_NOT_IN_HOC') stat.pendingHoc++;
  }

  const workplaceStats: WorkplaceStat[] = Array.from(wpMap.entries()).map(([noiLamViec, stat]) => ({
    noiLamViec,
    total: stat.total,
    hisHasTrans: stat.hisHasTrans,
    hisNoTrans: stat.hisNoTrans,
    hocSuccess: stat.hocSuccess,
    hocFailed: stat.hocFailed,
    pendingHoc: stat.pendingHoc,
    successRate: stat.total > 0 ? Math.round((stat.hocSuccess / stat.total) * 100) : 0
  })).sort((a, b) => b.total - a.total);

  // Thống kê phân tích lỗi (Error Group Stats)
  const errMap = new Map<string, { count: number; huongDan: string; tenLoi: string }>();
  for (const r of records) {
    if (r.trangThaiHOC === 'Thất bại' && r.nhomLoi) {
      if (!errMap.has(r.nhomLoi)) {
        errMap.set(r.nhomLoi, { count: 0, huongDan: r.huongDanKhacPhuc, tenLoi: r.chiTietLoi.substring(0, 120) });
      }
      errMap.get(r.nhomLoi)!.count++;
    }
  }

  const errorGroupStats: ErrorGroupStat[] = Array.from(errMap.entries()).map(([nhomLoi, stat]) => ({
    nhomLoi,
    tenLoi: stat.tenLoi,
    count: stat.count,
    huongDan: stat.huongDan,
    tiLe: summary.hocFailed > 0 ? Math.round((stat.count / summary.hocFailed) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Thống kê theo ngày khám
  const dMap = new Map<string, { total: number; hocSuccess: number; hocFailed: number; hisNoTrans: number }>();
  for (const r of records) {
    const rawD = r.ngayKham ? r.ngayKham.split(' ')[0] : 'Không rõ';
    if (!dMap.has(rawD)) {
      dMap.set(rawD, { total: 0, hocSuccess: 0, hocFailed: 0, hisNoTrans: 0 });
    }
    const stat = dMap.get(rawD)!;
    stat.total++;
    if (r.trangThaiHOC === 'Thành công') stat.hocSuccess++;
    else if (r.trangThaiHOC === 'Thất bại') stat.hocFailed++;
    if (!r.coMaGiaoDichHIS) stat.hisNoTrans++;
  }

  const dateStats: DateStat[] = Array.from(dMap.entries()).map(([ngay, stat]) => ({
    ngay,
    total: stat.total,
    hocSuccess: stat.hocSuccess,
    hocFailed: stat.hocFailed,
    hisNoTrans: stat.hisNoTrans
  })).sort((a, b) => b.ngay.localeCompare(a.ngay));

  return {
    records,
    summary,
    workplaceStats,
    errorGroupStats,
    dateStats
  };
}
