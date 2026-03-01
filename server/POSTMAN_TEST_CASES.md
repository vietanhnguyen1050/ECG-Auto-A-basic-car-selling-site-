# POSTMAN TEST CASES

## 0) Environment setup (Postman)
Tạo environment với các biến:
- `base_url` = `http://localhost:3000`
- `access_token` = token lấy từ API login
- `user_id` = MongoDB ObjectId của user test
- `car_id` = MongoDB ObjectId của car test

Header dùng chung (khi API yêu cầu xác thực):
- `Authorization: Bearer {{access_token}}`
- `Content-Type: application/json`

---

## 1) USER APIs (`/ecg/user`)

> Lưu ý: code hiện tại dùng `req.user?.userId` trong controller. Vì vậy khi test thực tế, cần có middleware auth gắn user vào request.

### 1.1 Get current user info
- **Name**: Get user info
- **Method**: `GET`
- **Route**: `{{base_url}}/ecg/user/info`
- **Headers**:
  - `Authorization: Bearer {{access_token}}`
- **Body**: none
- **Expected success**:
  - `200 OK`
  - Body:
```json
{
  "user": {
    "_id": "{{user_id}}",
    "phonenumber": "...",
    "displayname": "...",
    "email": "...",
    "role": "user"
  }
}
```
- **Expected fail**:
  - `401 Unauthorized`
  - `404 User not found`
  - `500 Server error`

---

## 2) Next sections (sẽ bổ sung theo từng nhánh)
- Auth
- Verify token / middleware behavior
- Car
- Bid
- Admin
- Brand

---

## 3) Quick run order for User branch
1. Login lấy `access_token` (tạm dùng auth API hiện có)
2. Gọi `GET /ecg/user/info`
