# AutoMarket - API & Data Guide

## Tổng quan

Dự án sử dụng **Axios** để gọi API, cấu hình tại `src/services/axiosInstance.ts`. Base URL mặc định: `http://localhost:3000/ecg` (thay đổi qua biến môi trường `VITE_API_URL`).

Tất cả request có JWT sẽ tự động gắn `Authorization: Bearer <token>` qua interceptor.

---

## Endpoints & Data Format

### 1. Authentication (`/auth`)

#### POST `/auth/register`
```json
// Request
{
  "name": "Nguyễn Văn A",
  "email": "user@email.com",
  "phone": "0912345678",
  "password": "123456"
}

// Response
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "name": "Nguyễn Văn A",
    "email": "user@email.com",
    "phone": "0912345678",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/auth/login`
```json
// Request
{
  "credential": "email hoặc số điện thoại",
  "password": "123456"
}

// Response: giống register
```

#### GET `/auth/me` (JWT required)
```json
// Response
{
  "success": true,
  "data": { /* user object */ }
}
```

#### PUT `/auth/profile` (JWT required)
```json
// Request
{ "name": "Tên mới" }
```

#### PUT `/auth/password` (JWT required)
```json
// Request
{
  "currentPassword": "mật khẩu cũ",
  "newPassword": "mật khẩu mới"
}
```

---

### 2. Cars (`/cars`)

#### GET `/cars` - Danh sách xe (phân trang + lọc)
```
Query params: page, limit, brand, minPrice, maxPrice, minYear, maxYear, fuelType, transmission, bodyType, status
```
```json
// Response
{
  "success": true,
  "data": [ /* ICar[] */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### GET `/cars/:id` - Chi tiết xe
```json
{
  "success": true,
  "data": {
    "_id": "car-id",
    "title": "Toyota Camry 2.0Q 2023",
    "brand": "Toyota",
    "model": "Camry",
    "version": "2.0Q",
    "year": 2023,
    "price": 1050000000,
    "mileage": 15000,
    "fuelType": "petrol",     // petrol | diesel | electric | hybrid
    "transmission": "automatic", // automatic | manual
    "bodyType": "sedan",      // sedan | suv | hatchback | coupe | truck | van
    "color": "Trắng",
    "condition": "excellent", // excellent | good | average | poor | bad
    "description": "Mô tả...",
    "images": ["url1", "url2"],
    "features": ["feature1"],
    "seller": "user-id hoặc user object",
    "sellerName": "Nguyễn Văn A",
    "location": "Hà Nội",
    "plateType": "white",
    "plateNumber": "30A-123.45",
    "status": "available",    // available | sold | pending
    "auctionStatus": "auction", // auction | normal
    "currentBid": 1100000000,
    "auctionSession": {
      "sessionNumber": 1,
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-01-02T00:00:00Z",
      "bids": []
    },
    "bids": [
      {
        "_id": "bid-id",
        "bidder": "user-id",
        "bidderName": "Người dùng",
        "amount": 1100000000,
        "timestamp": "2024-01-01T10:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/cars` - Đăng xe (multipart/form-data, JWT required)
Fields: title, brand, model, year, price, mileage, fuelType, transmission, bodyType, color, description, features[], location, images (files)

#### POST `/cars/:id/bid` - Trả giá (JWT required)
```json
{ "amount": 1150000000 }
```

#### GET `/cars/my-listings` - Xe của tôi (JWT required)
#### GET `/cars/search?q=keyword` - Tìm kiếm

---

### 3. Favorites (`/favorites`)

#### GET `/favorites` (JWT required)
```json
{ "success": true, "data": [ /* ICar[] */ ] }
```

#### POST `/favorites/:carId` (JWT required) - Toggle yêu thích
```json
{ "success": true, "data": { "isFavorite": true } }
```

---

### 4. Bids (`/bids`)

#### GET `/bids/my-bids` (JWT required) - Xe đang đấu giá

---

### 5. Admin (`/admin`) - Yêu cầu role admin

#### GET `/admin/users?page=1&limit=20&search=keyword`
#### PUT `/admin/users/:id/role` → `{ "role": "admin" }`
#### DELETE `/admin/users/:id`

#### GET `/admin/cars?page=1&limit=20&status=available`
#### PUT `/admin/cars/:id` → Partial ICar
#### DELETE `/admin/cars/:id`
#### PUT `/admin/cars/mass-update` → `{ "carIds": [...], "update": { "status": "sold" } }`

#### GET `/admin/brands` → `ICarModelData[]`
#### PUT `/admin/brands` → `{ "brands": ICarModelData[] }`

---

## Cấu trúc Year Data (mới)

Mỗi year trong version có thông số **riêng biệt**:

```typescript
interface IYearData {
  year: number;
  basePrice: number;        // Giá gốc (VNĐ)
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  segment: 'standard' | 'luxury';
}

// Trong ICarModelData
versions: {
  name: string;
  yearData: IYearData[];  // Mỗi năm có data riêng
  active?: boolean;
}
```

---

## Biến môi trường

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `VITE_API_URL` | Base URL cho API | `http://localhost:5000/api` |

---

## Dark mode

Theme toggle lưu vào `localStorage` key `automarket_theme`. Sử dụng class `dark` trên `<html>`.

## Chuyển từ Mock sang Backend thực

1. Trong `src/context/AuthContext.tsx`: Bỏ `MOCK_USERS`, bật lại `authApi.login()` / `authApi.register()`
2. Trong các trang: Thay mock data bằng API calls sử dụng `@tanstack/react-query`
3. Cấu hình `VITE_API_URL` trong file `.env`
