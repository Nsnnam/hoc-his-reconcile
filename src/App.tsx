import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  FileSpreadsheet, 
  Calendar, 
  Sparkles,
  Layers,
  ArrowUpDown,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  UploadedFileRecord, 
  ReconciledRecord, 
  SummaryStats, 
  WorkplaceStat, 
  ErrorGroupStat, 
  DateStat, 
  FilterCriteria 
} from './types';
import { parseExcelFile, parseDateToNumber, extractDateOnly } from './utils/fileParser';
import { performReconciliation, computeSummaryStats } from './utils/reconcileEngine';
import { Navbar } from './components/Navbar';
import { FileUploadArea } from './components/FileUploadArea';
import { FileListPills } from './components/FileListPills';
import { KpiSummaryCards } from './components/KpiSummaryCards';
import { FilterToolbar } from './components/FilterToolbar';
import { ReconcileDataTable } from './components/ReconcileDataTable';
import { WorkplaceSummaryTable } from './components/WorkplaceSummaryTable';
import { ErrorAnalyticsTable } from './components/ErrorAnalyticsTable';
import { DateSummaryTable } from './components/DateSummaryTable';
import { RecordDetailModal } from './components/RecordDetailModal';
import { ExportExcelModal } from './components/ExportExcelModal';

const INITIAL_FILTERS: FilterCriteria = {
  searchTerm: '',
  noiLamViec: 'ALL',
  danhSachNoiLamViec: [],
  phongKham: 'ALL',
  danhSachPhongKham: [],
  trangThaiDoiChieu: 'ALL',
  trangThaiHOC: 'ALL',
  trangThaiHIS: 'ALL',
  nhomLoi: 'ALL',
  tuNgayKham: '',
  denNgayKham: '',
  tuNgayDayHOC: '',
  denNgayDayHOC: '',
  chiLayHoSoHIS: true, // MẶC ĐỊNH BẬT: Chỉ rà & lấy thông tin hồ sơ thuộc file HIS (chưa đẩy + đã đẩy khớp mã GD cột K). Bỏ qua Transaction ID chỉ có trên HOC.
  columnFilters: {}
};

export function App() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRecord[]>([]);
  const [reconciledRecords, setReconciledRecords] = useState<ReconciledRecord[]>([]);

  const [filters, setFilters] = useState<FilterCriteria>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState<'reconcile' | 'workplaces' | 'errors' | 'dates'>('reconcile');
  const [selectedRecord, setSelectedRecord] = useState<ReconciledRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // Thực hiện đối chiếu liên tục mỗi khi danh sách file thay đổi
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setReconciledRecords([]);
      return;
    }

    setIsProcessing(true);
    // Sử dụng setTimeout để không block UI render
    const timer = setTimeout(() => {
      const result = performReconciliation(uploadedFiles);
      setReconciledRecords(result.records);
      setIsProcessing(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [uploadedFiles]);

  // Xử lý nạp file do người dùng chọn
  const handleFilesSelected = async (newFiles: File[]) => {
    setIsProcessing(true);
    try {
      const parsedRecords: UploadedFileRecord[] = [];
      for (const file of newFiles) {
        // Tránh trùng tên file đã nạp
        const exists = uploadedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!exists) {
          const parsed = await parseExcelFile(file);
          parsedRecords.push(parsed);
        }
      }

      if (parsedRecords.length > 0) {
        setUploadedFiles(prev => [...prev, ...parsedRecords]);
      }
    } catch (err) {
      console.error('Lỗi khi đọc file Excel:', err);
      alert('Có lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng tệp!');
    } finally {
      setIsProcessing(false);
    }
  };

  // Nạp 4 file mẫu có sẵn trong thư mục public/sample-data
  const handleLoadSamples = async () => {
    setLoadingSample(true);
    setIsProcessing(true);
    try {
      const sampleFilePaths = [
        { name: '16f793e7-6b1f-44f2-bc58-3cf5e7cb41de.xls', path: './sample-data/16f793e7-6b1f-44f2-bc58-3cf5e7cb41de.xls' },
        { name: '2105a102-3f8d-45dc-b130-9e4fe3406ccb.xls', path: './sample-data/2105a102-3f8d-45dc-b130-9e4fe3406ccb.xls' },
        { name: '4b1c4170-2144-42a8-bc76-6383e81e0e15.xls', path: './sample-data/4b1c4170-2144-42a8-bc76-6383e81e0e15.xls' },
        { name: 'TiepNhan1551_GopTrang_3trang_2978dong_20261107094101.xlsx', path: './sample-data/TiepNhan1551_GopTrang_3trang_2978dong_20261107094101.xlsx' }
      ];

      const parsedSamples: UploadedFileRecord[] = [];

      for (const item of sampleFilePaths) {
        const resp = await fetch(item.path);
        if (!resp.ok) {
          throw new Error(`Không thể tải ${item.name}`);
        }
        const blob = await resp.blob();
        const fakeFile = {
          name: item.name,
          size: blob.size,
          arrayBuffer: () => blob.arrayBuffer()
        };
        const parsed = await parseExcelFile(fakeFile);
        parsedSamples.push(parsed);
      }

      setUploadedFiles(parsedSamples);
    } catch (err) {
      console.error('Lỗi khi nạp mẫu:', err);
      alert('Không thể tải các tệp mẫu từ thư mục. Vui lòng kéo thả trực tiếp các file từ thư mục máy tính!');
    } finally {
      setLoadingSample(false);
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đang đối chiếu để làm mới?')) {
      setUploadedFiles([]);
      setFilters(INITIAL_FILTERS);
    }
  };

  // 1. Tập hồ sơ cơ sở: Lọc theo tùy chọn "Chỉ rà soát hồ sơ thuộc tệp HIS" (Mặc định: BẬT)
  const baseRecords = useMemo(() => {
    if (filters.chiLayHoSoHIS) {
      // Chỉ lấy hồ sơ chưa đẩy HOC hoặc đã đẩy có Transaction ID trùng khớp với cột K Mã giao dịch trong file xuất HIS
      // Bỏ qua các Transaction ID chỉ có trên HOC mà không có trong tệp HIS đính kèm
      return reconciledRecords.filter(r => r.trangThaiDoiChieu !== 'HOC_ONLY');
    }
    return reconciledRecords;
  }, [reconciledRecords, filters.chiLayHoSoHIS]);

  // 2. Thống kê KPI, Nơi làm việc, Nhóm lỗi, Thời gian được tính toán tự động dựa trên baseRecords
  const stats = useMemo(() => {
    return computeSummaryStats(baseRecords);
  }, [baseRecords]);

  // 3. Lọc dữ liệu hiển thị theo bộ lọc
  const filteredRecords = useMemo(() => {
    return baseRecords.filter(r => {
      // 1. Tìm kiếm chung (Mã BA, Mã BN, Họ tên, CCCD, Mã GD)
      if (filters.searchTerm) {
        const term = filters.searchTerm.trim().toLowerCase();
        const matchBA = r.maBA.toLowerCase().includes(term);
        const matchBN = r.maBN.toLowerCase().includes(term);
        const matchHoTen = r.hoTen.toLowerCase().includes(term);
        const matchCccd = r.cccd.toLowerCase().includes(term);
        const matchTrans = r.maGiaoDich.toLowerCase().includes(term);
        const matchWp = r.noiLamViec.toLowerCase().includes(term);

        if (!matchBA && !matchBN && !matchHoTen && !matchCccd && !matchTrans && !matchWp) {
          return false;
        }
      }

      // 2. Nơi làm việc / Doanh nghiệp (Đa chọn danhSachNoiLamViec hoặc noiLamViec đơn)
      if (filters.danhSachNoiLamViec && filters.danhSachNoiLamViec.length > 0) {
        if (!filters.danhSachNoiLamViec.includes(r.noiLamViec)) return false;
      } else if (filters.noiLamViec && filters.noiLamViec !== 'ALL') {
        if (r.noiLamViec !== filters.noiLamViec) return false;
      }

      // 2b. Phòng khám tiếp nhận (Đa chọn danhSachPhongKham hoặc phongKham đơn)
      if (filters.danhSachPhongKham && filters.danhSachPhongKham.length > 0) {
        if (!filters.danhSachPhongKham.includes(r.khoaPhong)) return false;
      } else if (filters.phongKham && filters.phongKham !== 'ALL') {
        if (r.khoaPhong !== filters.phongKham) return false;
      }

      // 3. Trạng thái đối chiếu
      if (filters.trangThaiDoiChieu !== 'ALL') {
        if (r.trangThaiDoiChieu !== filters.trangThaiDoiChieu) return false;
      }

      // 4. Nhóm lỗi
      if (filters.nhomLoi !== 'ALL') {
        if (r.nhomLoi !== filters.nhomLoi) return false;
      }

      // 5. Ngày đăng ký / tiếp nhận khám (HIS) - Hỗ trợ lọc theo khoảng thời gian từ ngày - đến ngày
      if (filters.tuNgayKham || filters.denNgayKham) {
        const rDateNum = parseDateToNumber(r.ngayKham);
        if (!rDateNum) return false;
        const tuNum = parseDateToNumber(filters.tuNgayKham);
        const denNum = parseDateToNumber(filters.denNgayKham);
        if (tuNum && rDateNum < tuNum) return false;
        if (denNum && rDateNum > denNum) return false;
      }

      // 6. Thời gian hồ sơ được đẩy lên cổng (HOC) - Hỗ trợ lọc theo khoảng thời gian từ ngày - đến ngày
      if (filters.tuNgayDayHOC || filters.denNgayDayHOC) {
        const rHocNum = parseDateToNumber(r.thoiDiemXuLyHOC);
        if (!rHocNum) return false;
        const tuNum = parseDateToNumber(filters.tuNgayDayHOC);
        const denNum = parseDateToNumber(filters.denNgayDayHOC);
        if (tuNum && rHocNum < tuNum) return false;
        if (denNum && rHocNum > denNum) return false;
      }

      // 7. Bộ lọc theo từng cột tiêu đề của bảng chi tiết (Column Filters)
      if (filters.columnFilters) {
        for (const [colKey, selected] of Object.entries(filters.columnFilters)) {
          if (!selected || selected.length === 0) continue;

          if (colKey === 'maBA') {
            const val = r.maBA || 'Chưa có BA';
            if (!selected.includes(val)) return false;
          } else if (colKey === 'hoTen') {
            const val = r.hoTen || 'Chưa cập nhật tên';
            if (!selected.includes(val)) return false;
          } else if (colKey === 'noiLamViec') {
            const val = r.noiLamViec || 'Khám tự do / Khác';
            if (!selected.includes(val)) return false;
          } else if (colKey === 'ngayKham') {
            const d = extractDateOnly(r.ngayKham) || 'Chưa rõ ngày';
            if (!selected.includes(d)) return false;
          } else if (colKey === 'thoiDiemXuLyHOC') {
            const d = extractDateOnly(r.thoiDiemXuLyHOC) || 'Chưa đẩy cổng';
            if (!selected.includes(d)) return false;
          } else if (colKey === 'maGiaoDich') {
            const hasTrans = Boolean(r.maGiaoDich);
            const isSelectedCo = selected.includes('CO_MA_GD');
            const isSelectedChua = selected.includes('CHUA_CO_MA_GD');
            if (isSelectedCo && !isSelectedChua && !hasTrans) return false;
            if (isSelectedChua && !isSelectedCo && hasTrans) return false;
          } else if (colKey === 'trangThaiHOC') {
            if (!selected.includes(r.trangThaiDoiChieu) && !selected.includes(r.trangThaiHOC)) return false;
          } else if (colKey === 'nhomLoi') {
            const val = r.nhomLoi || (r.trangThaiHOC === 'Thành công' ? 'Hoàn thành (Không lỗi)' : 'Khác / Chưa có thông tin lỗi');
            if (!selected.includes(val)) return false;
          } else if (colKey === 'thongTinKhac') {
            for (const crit of selected) {
              if (crit === 'NAM' && r.gioiTinh !== 'Nam') return false;
              if (crit === 'NU' && r.gioiTinh !== 'Nữ') return false;
              if (crit === 'CO_CCCD' && !r.cccd) return false;
              if (crit === 'CHUA_CCCD' && Boolean(r.cccd)) return false;
              if (crit === 'CO_SDT' && !r.sdt) return false;
              if (crit === 'CHUA_SDT' && Boolean(r.sdt)) return false;
              if (crit.startsWith('PK:') && r.khoaPhong !== crit.replace('PK:', '')) return false;
            }
          }
        }
      }

      return true;
    });
  }, [baseRecords, filters]);

  // Handler khi click chọn vào các card tổng hợp
  const handleFilterByStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      trangThaiDoiChieu: status,
      nhomLoi: 'ALL'
    }));
    setActiveTab('reconcile');
  };

  // Handler khi click chọn nơi làm việc từ bảng tổng hợp
  const handleSelectWorkplace = (wpName: string) => {
    setFilters(prev => ({
      ...prev,
      noiLamViec: wpName
    }));
    setActiveTab('reconcile');
  };

  // Handler khi click chọn nhóm lỗi từ bảng phân tích lỗi
  const handleSelectErrorGroup = (errorGroupName: string) => {
    setFilters(prev => ({
      ...prev,
      trangThaiDoiChieu: 'MATCH_FAILED',
      nhomLoi: errorGroupName
    }));
    setActiveTab('reconcile');
  };

  // Handler khi click chọn ngày từ bảng thống kê thời gian
  const handleSelectDate = (dateStr: string, type: 'HIS' | 'HOC') => {
    if (type === 'HIS') {
      setFilters(prev => ({
        ...prev,
        tuNgayKham: dateStr,
        denNgayKham: dateStr,
        tuNgayDayHOC: '',
        denNgayDayHOC: '',
        searchTerm: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        tuNgayDayHOC: dateStr,
        denNgayDayHOC: dateStr,
        tuNgayKham: '',
        denNgayKham: '',
        searchTerm: ''
      }));
    }
    setActiveTab('reconcile');
  };

  // Handler khi thay đổi bộ lọc trên từng cột tiêu đề của bảng
  const handleColumnFilterChange = (colKey: string, selected: string[]) => {
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...(prev.columnFilters || {}),
        [colKey]: selected
      }
    }));
  };

  // Handler xóa toàn bộ các bộ lọc cột bảng
  const handleClearAllColumnFilters = () => {
    setFilters(prev => ({
      ...prev,
      columnFilters: {}
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        totalFiles={uploadedFiles.length}
        totalRecords={stats.summary.total}
        successCount={stats.summary.hocSuccess}
        onOpenUpload={() => uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onLoadSamples={handleLoadSamples}
        onExport={() => setIsExportModalOpen(true)}
        onReset={handleClearAll}
        loadingSample={loadingSample}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Upload Area (Full when empty, Compact when has files) */}
        <div ref={uploadSectionRef}>
          {uploadedFiles.length === 0 ? (
            <FileUploadArea
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              loadingSample={loadingSample}
            />
          ) : (
            <div className="space-y-4">
              <FileListPills
                files={uploadedFiles}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
              />
              <FileUploadArea
                onFilesSelected={handleFilesSelected}
                onLoadSamples={handleLoadSamples}
                loadingSample={loadingSample}
                compactMode={true}
              />
            </div>
          )}
        </div>

        {/* Dashboard Content (Only when data is present) */}
        {reconciledRecords.length > 0 && (
          <div className="space-y-6">
            {/* Top KPI Cards (Click to filter!) */}
            <KpiSummaryCards
              summary={stats.summary}
              activeStatusFilter={filters.trangThaiDoiChieu}
              onFilterByStatus={handleFilterByStatus}
              onSelectWorkplaceTab={() => setActiveTab('workplaces')}
            />

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('reconcile')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'reconcile'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Danh sách hồ sơ chi tiết</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 font-mono">
                    {filteredRecords.length.toLocaleString()}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('workplaces')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'workplaces'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Tổng hợp theo Nơi làm việc</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-mono">
                    {stats.workplaceStats.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('errors')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'errors'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Phân tích nguyên nhân lỗi HOC</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-mono">
                    {stats.errorGroupStats.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dates')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
                    activeTab === 'dates'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Báo cáo Ngày tiếp nhận & Đẩy cổng</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
                    {stats.dateStats.length} HIS / {stats.hocDateStats.length} HOC
                  </span>
                </button>
              </div>

              {/* Status Indicator */}
              {isProcessing && (
                <div className="flex items-center space-x-2 text-xs text-sky-600 font-medium animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tính toán đối chiếu liên tục...</span>
                </div>
              )}
            </div>

            {/* Active Tab Views */}
            {activeTab === 'reconcile' && (
              <div className="space-y-4">
                <FilterToolbar
                  filters={filters}
                  onFilterChange={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
                  onResetFilters={() => setFilters(INITIAL_FILTERS)}
                  workplaces={stats.workplaceStats}
                  clinics={stats.clinicStats}
                  errorGroups={stats.errorGroupStats}
                  totalRecords={baseRecords.length}
                  filteredCount={filteredRecords.length}
                  onClearAllColumnFilters={handleClearAllColumnFilters}
                />

                <ReconcileDataTable
                  records={filteredRecords}
                  baseRecords={baseRecords}
                  columnFilters={filters.columnFilters}
                  onColumnFilterChange={handleColumnFilterChange}
                  onClearAllColumnFilters={handleClearAllColumnFilters}
                  onSelectRecord={(rec) => setSelectedRecord(rec)}
                />
              </div>
            )}

            {activeTab === 'workplaces' && (
              <WorkplaceSummaryTable
                workplaces={stats.workplaceStats}
                selectedWorkplace={filters.noiLamViec}
                onSelectWorkplace={handleSelectWorkplace}
              />
            )}

            {activeTab === 'errors' && (
              <ErrorAnalyticsTable
                errorGroups={stats.errorGroupStats}
                selectedErrorGroup={filters.nhomLoi}
                onSelectErrorGroup={handleSelectErrorGroup}
              />
            )}

            {activeTab === 'dates' && (
              <DateSummaryTable
                hisDateStats={stats.dateStats}
                hocDateStats={stats.hocDateStats}
                selectedDate={filters.tuNgayKham || filters.tuNgayDayHOC}
                onSelectDate={handleSelectDate}
              />
            )}
          </div>
        )}
      </main>

      {/* Record Comparison Modal */}
      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Export to Excel Modal */}
      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allRecords={baseRecords}
        filteredRecords={filteredRecords}
        workplaces={stats.workplaceStats}
        errorGroups={stats.errorGroupStats}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Quick links row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="font-semibold text-slate-700">
              🔗 Cổng xuất file đầu vào:
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://moc.congdulieuyte.vn/hoc/tra-cuu/tra-cuu-tiep-nhan-1551"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 hover:underline flex items-center gap-1 text-slate-600"
              >
                <span>Cổng HOC (1551)</span>
                <span className="text-[10px]">↗</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../ngoaitru/NGT01T001_tiepnhan_ngt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 hover:underline flex items-center gap-1 text-slate-600"
              >
                <span>Xuất đăng ký tiếp nhận (HIS)</span>
                <span className="text-[10px]">↗</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://bvlacviet.vncare.vn/vnpthis/main/manager.jsp?func=../noitru/NTU_QuanLyHS_KSK"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 hover:underline flex items-center gap-1 text-slate-600"
              >
                <span>Quản lý hồ sơ KSK (HIS)</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong>HOC - HIS Reconcile Pro</strong> • Giám sát & Đối chiếu liên thông hồ sơ khám sức khỏe
            </div>
            <div className="text-slate-400">
              Xử lý an toàn 100% trong trình duyệt • Không gửi dữ liệu bệnh nhân ra ngoài
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
