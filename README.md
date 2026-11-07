# 🩺 HOC - HIS Reconcile Pro

> **Hệ thống Web Đối Chiếu & Giám Sát Liên Thông Hồ Sơ Khám Sức Khỏe (KSK 1551) giữa HIS và Cổng HOC**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://badge.fury.io/js/typescript.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-green.svg)](https://nsnnam.github.io/hoc-his-reconcile)

---

## 📖 Giới Thiệu

Trong quy trình liên thông dữ liệu Khám Sức Khỏe theo **Thông tư 32/2023/TT-BYT** và quy định giám sát liên thông cổng KSK 1551, các cơ sở y tế thường gặp phải bài toán:
1. File xuất danh sách tiếp nhận từ **HIS** chứa thông tin hành chính, nơi làm việc (công ty), phòng khám, nhưng chưa có mã giao dịch hoặc trạng thái gửi.
2. File xuất giám sát đẩy hồ sơ từ **HIS** chứa mã giao dịch (Transaction ID), kết quả gửi trên HIS, nhưng thiếu nơi làm việc và chưa biết kết quả phản hồi cuối cùng từ cổng HOC.
3. File xuất kết quả tiếp nhận từ **Cổng HOC (HOCRECEIVERSERVICE)** chứa Transaction ID, trạng thái Thành công / Thất bại và chuỗi JSON báo lỗi chi tiết, nhưng thiếu thông tin định danh bệnh nhân (Mã BA, Họ tên, Nơi làm việc).

**HOC - HIS Reconcile Pro** giải quyết triệt để vấn đề này bằng cơ chế **đối chiếu lũy kế liên tục đa tệp (Multi-file Continuous Reconciliation)** hoàn toàn trên Client-side, bảo mật tuyệt đối dữ liệu y tế người bệnh.

---

## ✨ Tính Năng Nổi Bật

### 1. Nạp Nhiều File Excel & Đối Chiếu Lũy Kế Liên Tục
- Hỗ trợ định dạng `.xlsx` và `.xls` (bao gồm file xuất HTML disguised as .xls từ HIS).
- Tự động nhận diện dòng tiêu đề (Header detector) và phân loại nguồn file:
  - **HIS - Danh sách đẩy hồ sơ KSK**
  - **HIS - Tiếp nhận KSK & Nơi làm việc**
  - **HOC - Kết quả tiếp nhận 1551**
- Cho phép người dùng tải thêm file bất kỳ lúc nào; hệ thống tự động tái đối chiếu và hợp nhất dữ liệu tức thì.

### 2. Nguyên Tắc Ghép Dữ Liệu & Ưu Tiên Mã Giao Dịch
- **Khóa liên kết đa cấp**: `Mã giao dịch (Transaction ID)` ↔ `Mã Bệnh Án (BAxxxx)` ↔ `Mã BN (BNxxxx)` ↔ `Số CCCD`.
- **Ưu tiên từ HIS**: Các mã giao dịch sinh ra từ HIS được ưu tiên tối đa để liên kết với giao dịch trên HOC.
- Hợp nhất thông tin hành chính đầy đủ: Họ tên, Ngày sinh, Giới tính, CCCD, SĐT, Địa chỉ, Nơi làm việc (công ty), Khoa/Phòng khám, Người tiếp nhận.

### 3. Phân Tích Thông Minh Gói Tin Lỗi HOC (Error Parser)
- Tự động giải mã chuỗi JSON phản hồi phức tạp từ cổng HOC thành thông báo lỗi tiếng Việt trực quan:
  - **Thiếu mã xã cư trú (`maxa_cu_tru`) [XML1]**: Tự động đưa ra giải pháp cập nhật mã xã trên HIS.
  - **Sai định dạng đối tượng KSK (`doi_tuong`) [XML2]**: Hướng dẫn mã hóa theo danh mục 1-16 của BYT.
  - **Thiếu hoặc sai Chữ ký số (CKS)**: Cảnh báo token bác sĩ kết luận hoặc chữ ký bệnh viện.
  - **Thiếu số CCCD (`so_cccd`) [XML1]**: Yêu cầu bổ sung định danh 12 số.
  - **Thiếu phân loại sức khỏe (`phan_loai_sk`) [XML12]**: Hướng dẫn hoàn thiện kết luận KSK.

### 4. Thống Kê Tổng Hợp & Lọc Tương Tác 1-Click
- **KPI Summary Cards**: Tổng số hồ sơ, HOC Thành công, HOC Báo lỗi, Chưa có mã GD HIS, Đang chờ phản hồi HOC.
  - **Bấm vào bất kỳ thẻ nào** để lập tức lọc ra danh sách chi tiết các hồ sơ đó.
- **Bảng Tổng hợp theo Nơi làm việc (Doanh nghiệp)**:
  - Thống kê tỷ lệ đạt/hỏng của từng công ty (GETECH, v.v.).
  - Bấm **"Lọc chi tiết"** để chuyển ngay sang xem từng ca bệnh của công ty đó.
- **Bảng Phân tích lỗi HOC**:
  - Xếp hạng tần suất vi phạm theo nhóm lỗi.
  - Bấm **"Lọc ca này"** để kỹ thuật viên / KHTH sửa hàng loạt trên HIS.
- **Bảng Theo Ngày khám**:
  - Giám sát tiến độ tiếp nhận và đẩy hồ sơ theo từng ngày.

### 5. Xem Chi Tiết Đối Soát Song Song (Side-by-Side Modal)
- Đối chiếu song song 2 cột: **Dữ liệu Hành chính & Tiếp nhận (HIS)** ↔ **Dữ liệu Giao dịch & Phản hồi Cổng HOC**.
- Hiển thị đầy đủ Raw JSON Payload từ cổng HOC.
- Nút 1-click sao chép Mã giao dịch (Transaction ID).

### 6. Xuất Báo Cáo Excel Đa Năng (.xlsx)
Hỗ trợ 3 tùy chọn xuất:
1. **Danh sách đang lọc** (theo bộ lọc hiện tại).
2. **Toàn bộ kết quả đối chiếu** (tất cả các file).
3. **Chỉ danh sách HOC Báo lỗi** (kèm hướng dẫn sửa để chuyển phòng KHTH/IT).
File Excel xuất ra chuẩn tiếng Việt, có màu sắc, định dạng độ rộng cột và phân chia làm **3 sheet**:
- `Chi Tiết Đối Chiếu`
- `Tổng Hợp Theo Nơi Làm Việc`
- `Phân Tích Lỗi HOC`

### 7. Bảo Mật 100% Client-Side
- Mọi thao tác xử lý, đọc file, ghép dữ liệu và xuất Excel đều thực hiện trực tiếp trong trình duyệt bằng JavaScript / Web Workers.
- Tuyệt đối không gửi dữ liệu bệnh nhân hay thông tin y tế nhạy cảm lên bất kỳ máy chủ bên thứ ba nào.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu cầu môi trường
- **Node.js**: v18 trở lên (đã kiểm thử mượt mà trên v22/v26)
- **npm** hoặc **yarn** / **pnpm**

### Các bước thực hiện:

```bash
# 1. Di chuyển vào thư mục dự án
cd C:\Users\Admin\hoc-his-reconcile

# 2. Cài đặt các thư viện phụ thuộc (nếu chưa cài)
npm install

# 3. Khởi động môi trường phát triển (Dev server)
npm run dev

# Mở trình duyệt và truy cập: http://localhost:5173
```

Để chạy bản Preview sản phẩm đã build:
```bash
npm run build
npm run preview
# Mở trình duyệt: http://localhost:4173
```

---

## 🌐 Hướng Dẫn Deploy Lên GitHub Pages

Dự án đã được cấu hình sẵn GitHub Actions tự động build và deploy lên GitHub Pages (`.github/workflows/deploy.yml`).

### Các bước đẩy code lên GitHub:

```bash
# 1. Thêm commit code
git add .
git commit -m "feat: khoi tao he thong doi chieu HOC - HIS reconcile pro"

# 2. Tạo repository mới trên GitHub (ví dụ: https://github.com/nsnnam/hoc-his-reconcile)

# 3. Thêm remote origin và push lên nhánh main
git remote add origin https://github.com/nsnnam/hoc-his-reconcile.git
git push -u origin main
```

Sau khi push, GitHub Actions sẽ tự động kích hoạt workflow `deploy.yml`. Truy cập mục **Settings** -> **Pages** trên repository GitHub và chọn nguồn là **GitHub Actions**. Web app sẽ hoạt động tại địa chỉ:
`https://nsnnam.github.io/hoc-his-reconcile`

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
hoc-his-reconcile/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD tự động deploy lên GitHub Pages
├── public/
│   └── sample-data/                # 4 file dữ liệu mẫu kiểm thử thực tế
│       ├── 16f793e7-...xls         # HIS - Tiếp nhận KSK đơn vị & Nơi làm việc
│       ├── 2105a102-...xls         # HIS - Giám sát đẩy hồ sơ KSK (305 dòng)
│       ├── 4b1c4170-...xls         # HIS - Giám sát đẩy hồ sơ KSK (5.000 dòng)
│       └── TiepNhan1551-...xlsx    # HOC - Tiếp nhận KSK 1551 (2.978 dòng)
├── src/
│   ├── types/
│   │   └── index.ts                # Định nghĩa kiểu dữ liệu & schema chuẩn hóa
│   ├── utils/
│   │   ├── fileParser.ts           # Trình đọc & phân loại file Excel/HTML thông minh
│   │   ├── reconcileEngine.ts      # Động cơ đối chiếu liên tục đa tệp & phân tích lỗi HOC
│   │   └── excelExporter.ts        # Xuất file báo cáo Excel đa sheet chuyên nghiệp
│   ├── components/
│   │   ├── Navbar.tsx              # Thanh điều hướng, chỉ số nhanh & nút tác vụ
│   │   ├── FileUploadArea.tsx      # Vùng kéo thả file & nạp mẫu 1-click
│   │   ├── FileListPills.tsx       # Quản lý danh sách các file đang tham gia đối chiếu
│   │   ├── KpiSummaryCards.tsx     # 6 thẻ KPI tổng hợp (click để lọc chi tiết)
│   │   ├── WorkplaceSummaryTable.tsx # Bảng thống kê theo nơi làm việc / doanh nghiệp
│   │   ├── ErrorAnalyticsTable.tsx # Bảng phân tích nguyên nhân lỗi & hướng dẫn khắc phục
│   │   ├── DateSummaryTable.tsx    # Bảng thống kê theo ngày khám
│   │   ├── FilterToolbar.tsx       # Thanh bộ lọc đa năng (tìm kiếm, công ty, trạng thái, ngày)
│   │   ├── ReconcileDataTable.tsx  # Bảng dữ liệu đối chiếu chi tiết (phân trang, copy mã)
│   │   ├── RecordDetailModal.tsx   # Modal xem đối soát song song HIS ↔ HOC
│   │   └── ExportExcelModal.tsx    # Modal tùy chọn xuất file Excel
│   ├── App.tsx                     # Component trung tâm quản lý luồng dữ liệu
│   ├── main.tsx                    # Điểm khởi chạy ứng dụng
│   └── index.css                   # Định kiểu Tailwind CSS & animation
├── package.json                    # Cấu hình dự án & dependencies
├── vite.config.ts                  # Cấu hình Vite bundler (base path relative)
└── tailwind.config.js              # Cấu hình bảng màu & typography
```

---

## 🛠️ Công Nghệ Sử Dụng

- **React 19** & **TypeScript**
- **Vite 8**
- **Tailwind CSS 3.4**
- **SheetJS (xlsx)**
- **Lucide React**

---

© 2026 **HOC - HIS Reconcile Pro** • Phát triển phục vụ công tác giám định, đối chiếu và liên thông dữ liệu y tế.
