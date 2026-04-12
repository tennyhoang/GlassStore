# GlassStore — Frontend

Giao diện người dùng cho hệ thống bán kính mắt cao cấp GlassStore, xây dựng bằng React + Vite.

## Tech Stack

- **React 18** + **Vite**
- **React Router v6** (routing)
- **Axios** (HTTP client + auto JWT refresh)
- **Cloudinary** (upload ảnh sản phẩm)
- **react-hot-toast** (thông báo)
- **lucide-react** (icon)
- **CSS Modules** (styling)

## Yêu cầu hệ thống

- Node.js 18+
- npm 9+
- Backend GlassStore đang chạy tại `http://localhost:8080`

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone https://github.com/tennyhoang/GlassStore.git
cd GlassStore
git checkout frontend
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình Cloudinary (để upload ảnh sản phẩm)

Mở file `src/components/ui/ImageUpload.jsx`, điền Cloud Name và Upload Preset:

```js
const CLOUD_NAME    = 'your-cloud-name'      // Lấy từ Cloudinary Dashboard
const UPLOAD_PRESET = 'glassstore_unsigned'  // Upload preset mode Unsigned
```

Hướng dẫn tạo Upload Preset:
1. Đăng ký tại [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → Upload → Upload Presets
3. Tạo preset mới, chọn **Signing Mode = Unsigned**
4. Điền tên preset vào `UPLOAD_PRESET`

### 4. Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

> Vite sẽ tự động proxy `/api` requests sang `http://localhost:8080` (đã cấu hình trong `vite.config.js`)

### 5. Build production

```bash
npm run build
```

## Cấu trúc thư mục

```
src/
├── App.jsx                  # Routes chính
├── main.jsx                 # Entry point
├── index.css                # Global styles + CSS variables
├── services/
│   └── api.js               # Axios instance + tất cả API calls
├── context/
│   ├── AuthContext.jsx      # Quản lý đăng nhập/đăng xuất
│   ├── CartContext.jsx      # Quản lý giỏ hàng
│   └── WishlistContext.jsx  # Quản lý yêu thích
├── hooks/
│   └── useOrders.jsx        # Custom hooks
├── components/
│   └── ui/
│       ├── AccessibilityWidget.jsx  # Widget chỉnh cỡ chữ/tương phản
│       ├── ImageUpload.jsx          # Upload ảnh lên Cloudinary
│       ├── NotificationBell.jsx     # Chuông thông báo
│       ├── ProductCard.jsx          # Card sản phẩm
│       ├── ReviewSection.jsx        # Đánh giá sản phẩm
│       └── ...
└── pages/
    ├── HomePage.jsx
    ├── ShopPage.jsx             # Cửa hàng với lọc nâng cao
    ├── FrameDetailPage.jsx      # Chi tiết gọng kính
    ├── customer/
    │   ├── CheckoutPage.jsx     # Thanh toán (COD / VNPay / QR)
    │   ├── CartPage.jsx         # Giỏ hàng
    │   ├── OrdersPage.jsx       # Lịch sử đơn hàng
    │   ├── DesignPage.jsx       # Thiết kế kính theo yêu cầu
    │   ├── EyeProfilePage.jsx   # Quản lý hồ sơ mắt
    │   └── PaymentResultPage.jsx
    └── staff/
        ├── StaffOrdersPage.jsx      # Quản lý đơn hàng
        ├── StaffProductsPage.jsx    # Quản lý sản phẩm + upload ảnh
        ├── StaffReportPage.jsx      # Dashboard báo cáo
        └── ...
```

## Tính năng chính

### Khách hàng
- 🛍️ Xem & lọc sản phẩm theo shape, màu, chất liệu, giá
- 👓 Thiết kế kính theo yêu cầu (chọn gọng + tròng + hồ sơ mắt)
- 🖼️ Mua chỉ gọng kính (không kèm tròng)
- 🛒 Giỏ hàng + mã giảm giá
- 💳 Thanh toán COD / VNPay / QR MBBank
- 📋 Theo dõi đơn hàng với timeline
- 👁️ Quản lý hồ sơ mắt (nhập tay hoặc upload đơn thuốc)
- ⭐ Đánh giá sản phẩm
- 🔔 Thông báo realtime

### Staff / Admin
- 📦 Quản lý đơn hàng với search/filter/sort
- 🏭 Quản lý quy trình sản xuất & giao hàng
- 🖼️ Quản lý sản phẩm + upload ảnh Cloudinary
- 📊 Dashboard báo cáo doanh thu với biểu đồ
- 👥 Quản lý người dùng (Admin)
- 🎫 Quản lý mã giảm giá

## Accessibility

Widget accessibility ở góc dưới phải cho phép:
- Tăng/giảm cỡ chữ (3 mức)
- Chuyển chế độ tương phản cao
- Lưu lựa chọn vào localStorage

## Nhóm phát triển

**Group 5 — FPT University**
