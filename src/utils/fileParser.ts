import * as XLSX from 'xlsx';
import { FileType, UploadedFileRecord } from '../types';

/**
 * Chuẩn hóa chuỗi text (bỏ dấu tiếng Việt, chữ thường, bỏ khoảng trắng thừa)
 */
export function normalizeText(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

/**
 * Chuẩn hóa số CCCD (12 số có số 0 ở đầu)
 */
export function formatCccd(val: any): string {
  if (!val) return '';
  let str = String(val).trim();
  if (!str || str.toLowerCase() === 'nan' || str === '0') return '';
  // Nếu là số và thiếu số 0 ở đầu
  if (/^\d{8,11}$/.test(str)) {
    str = str.padStart(12, '0');
  }
  return str;
}

/**
 * Chuẩn hóa số điện thoại
 */
export function formatPhone(val: any): string {
  if (!val) return '';
  let str = String(val).trim();
  if (!str || str.toLowerCase() === 'nan' || str === '0') return '';
  if (/^\d{9}$/.test(str)) {
    str = '0' + str;
  }
  return str;
}

/**
 * Chuẩn hóa thời gian thành định dạng dd/mm/yyyy hh:mm:ss
 * Xử lý:
 * - Định dạng HOC: yyyy-mm-dd(T)hh:mm:ss(.xxxxxx) -> dd/mm/yyyy hh:mm:ss
 * - Định dạng HIS: dd/mm/yyyy hh:mm:ss -> dd/mm/yyyy hh:mm:ss
 * - Excel serial number
 */
export function formatDateTime(val: any): string {
  if (val === null || val === undefined || val === '') return '';

  if (typeof val === 'number') {
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) {
        const dd = String(d.d).padStart(2, '0');
        const mm = String(d.m).padStart(2, '0');
        const yyyy = d.y;
        if (d.H !== undefined && (d.H > 0 || d.M > 0 || d.S > 0)) {
          const hh = String(d.H).padStart(2, '0');
          const min = String(d.M).padStart(2, '0');
          const ss = String(Math.floor(d.S)).padStart(2, '0');
          return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
        }
        return `${dd}/${mm}/${yyyy}`;
      }
    } catch {
      // fallback
    }
  }

  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'nan') return '';

  // 1. Khớp định dạng ISO: yyyy-mm-dd(T)hh:mm:ss(.xxxxxx) từ HOC
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.\d+)?/);
  if (isoMatch) {
    const [, y, m, d, hh, mm, ss] = isoMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y} ${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`;
  }

  // 2. Khớp định dạng ngày ISO chỉ có yyyy-mm-dd
  const isoDateOnly = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDateOnly) {
    const [, y, m, d] = isoDateOnly;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // 3. Khớp định dạng ngày/tháng/năm của HIS: dd/mm/yyyy hh:mm:ss
  const vnMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?/);
  if (vnMatch) {
    const [, d, m, y, hh, mm, ss] = vnMatch;
    const datePart = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    if (hh !== undefined && mm !== undefined && ss !== undefined) {
      return `${datePart} ${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`;
    }
    return datePart;
  }

  return str;
}

/**
 * Lấy riêng phần ngày dd/mm/yyyy từ chuỗi ngày giờ
 */
export function extractDateOnly(val: any): string {
  const dt = formatDateTime(val);
  if (!dt) return '';
  return dt.split(' ')[0] || '';
}

/**
 * Chuẩn hóa chuỗi ngày tháng
 */
export function formatDate(val: any): string {
  return formatDateTime(val);
}

/**
 * Tự động tìm dòng tiêu đề trong sheet Excel
 */
function findHeaderRow(rows: any[][]): { headerIdx: number; headers: string[] } {
  const keyMarkers = [
    'mã ba', 'ma ba', 'maba',
    'mã bn', 'ma bn', 'mabn',
    'transaction id', 'mã giao dịch', 'ma giao dich',
    'tên bệnh nhân', 'ten benh nhan', 'họ tên', 'ho ten',
    'nơi làm việc', 'noi lam viec',
    'kết quả tiếp nhận', 'trạng thái', 'stt'
  ];

  const maxScan = Math.min(rows.length, 12);
  let bestIdx = -1;
  let maxScore = 0;

  for (let i = 0; i < maxScan; i++) {
    const row = rows[i];
    if (!Array.isArray(row) || row.length === 0) continue;

    let score = 0;
    for (const cell of row) {
      const cellNorm = normalizeText(cell);
      if (keyMarkers.some(k => cellNorm.includes(k))) {
        score++;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIdx = i;
    }
  }

  if (bestIdx !== -1 && maxScore >= 1) {
    const headers = rows[bestIdx].map(c => (c !== null && c !== undefined ? String(c).trim() : ''));
    return { headerIdx: bestIdx, headers };
  }

  // Fallback to row 0
  return {
    headerIdx: 0,
    headers: (rows[0] || []).map(c => (c !== null && c !== undefined ? String(c).trim() : ''))
  };
}

/**
 * Nhận diện loại file tự động dựa vào danh sách cột
 */
export function detectFileType(headers: string[]): { fileType: FileType; label: string } {
  const hNorm = headers.map(h => normalizeText(h));

  // Kiểm tra file HOC (Cổng tiếp nhận hồ sơ 1551)
  const isHoc = hNorm.some(h => h.includes('transaction id')) &&
    (hNorm.some(h => h.includes('trang thai') || h.includes('ket qua tiep nhan') || h.includes('ma co so kcb')));
  if (isHoc) {
    return { fileType: 'HOC_RESULT', label: 'HOC - Kết quả tiếp nhận 1551' };
  }

  // Kiểm tra file Tiếp nhận / KSK đơn vị có Nơi làm việc
  const isHisReception = hNorm.some(h => h.includes('noi lam viec') || h.includes('cong ty')) ||
    (hNorm.some(h => h.includes('ma ba')) && hNorm.some(h => h.includes('sdt bn') || h.includes('nguoi tn')));
  if (isHisReception) {
    return { fileType: 'HIS_RECEPTION', label: 'HIS - Tiếp nhận KSK & Nơi làm việc' };
  }

  // Kiểm tra file HIS xuất đẩy hồ sơ / giám sát
  const isHisExport = hNorm.some(h => h.includes('ma ba')) &&
    (hNorm.some(h => h.includes('ma giao dich') || hNorm.some(h => h.includes('nguoi gui')) || hNorm.some(h => h.includes('loai giay'))));
  if (isHisExport) {
    return { fileType: 'HIS_EXPORT', label: 'HIS - Danh sách đẩy hồ sơ KSK' };
  }

  // Fallback
  if (hNorm.some(h => h.includes('ma ba') || h.includes('ma bn'))) {
    return { fileType: 'HIS_EXPORT', label: 'HIS - Dữ liệu bệnh nhân' };
  }

  return { fileType: 'UNKNOWN', label: 'Dữ liệu Excel khác' };
}

/**
 * Đọc file Excel từ ArrayBuffer và chuyển đổi thành UploadedFileRecord
 */
export async function parseExcelFile(
  file: File | { name: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }
): Promise<UploadedFileRecord> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
  const firstSheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[firstSheetName];

  // Chuyển thành ma trận dòng
  const rawMatrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const { headerIdx, headers } = findHeaderRow(rawMatrix);
  const { fileType, label } = detectFileType(headers);

  // Chuyển các dòng dữ liệu thành mảng đối tượng
  const rawRows: Record<string, any>[] = [];
  for (let r = headerIdx + 1; r < rawMatrix.length; r++) {
    const row = rawMatrix[r];
    if (!row || row.length === 0) continue;

    // Bỏ qua dòng trống
    const hasData = row.some(c => c !== null && c !== undefined && String(c).trim() !== '');
    if (!hasData) continue;

    const rowObj: Record<string, any> = {};
    for (let c = 0; c < headers.length; c++) {
      const headerName = headers[c];
      if (!headerName) continue;
      rowObj[headerName] = row[c] !== undefined ? row[c] : '';
    }
    rawRows.push(rowObj);
  }

  return {
    id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: file.name,
    size: file.size,
    rowCount: rawRows.length,
    fileType,
    fileTypeLabel: label,
    uploadTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawRows
  };
}
