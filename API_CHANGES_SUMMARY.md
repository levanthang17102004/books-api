# Tóm Tắt Thay Đổi API: Restaurant → Bookstore

## 📋 Tổng Quan Thay Đổi

Hệ thống đã được refactor từ mô hình **Restaurant/Menu/MenuItem** sang mô hình **Bookstore/Category/Book**.

---

## 🔄 Thay Đổi Tên Entity

| Cũ | Mới |
|---|---|
| `restaurant` / `Restaurant` | `bookstore` / `Bookstore` |
| `menu` / `Menu` | `category` / `Category` |
| `menuItem` / `MenuItem` | `book` / `Book` |

---

## 🌐 Thay Đổi API Endpoints

### 1. Bookstore Endpoints (Thay thế Restaurant)

**Cũ:**
```
GET    /restaurant
GET    /restaurant/:id
POST   /restaurant/top-rating
POST   /restaurant/newcommer
POST   /restaurant/top-freeship
```

**Mới:**
```
GET    /bookstore
GET    /bookstore/:id
POST   /bookstore/top-rating
POST   /bookstore/newcommer
POST   /bookstore/top-freeship
```

### 2. Like Endpoints

**Cũ:**
```javascript
POST   /like
GET    /like
POST   /like/delete

// Request body:
{
  "restaurant": "restaurant_id",
  "quantity": 1
}
```

**Mới:**
```javascript
POST   /like
GET    /like
POST   /like/delete

// Request body:
{
  "bookstore": "bookstore_id",  // Đổi từ "restaurant"
  "quantity": 1
}
```

### 3. Order Endpoints

**Cũ:**
```javascript
POST   /order
GET    /order

// Request body:
{
  "restaurant": "restaurant_id",
  "totalPrice": 100000,
  "totalQuantity": 2,
  "detail": [...]
}
```

**Mới:**
```javascript
POST   /order
GET    /order

// Request body:
{
  "bookstore": "bookstore_id",  // Đổi từ "restaurant"
  "totalPrice": 100000,
  "totalQuantity": 2,
  "detail": [...]
}
```

---

## 📦 Thay Đổi Response Structure

### 1. Bookstore Response (GET /bookstore/:id)

**Cũ:**
```json
{
  "statusCode": 200,
  "message": "Fetch a restaurant by id",
  "data": {
    "_id": "...",
    "name": "...",
    "phone": "...",
    "address": "...",
    "email": "...",
    "rating": 4.5,
    "image": "...",
    "isActive": true,
    "menu": [
      {
        "_id": "...",
        "restaurant": "...",
        "title": "...",
        "menuItem": [
          {
            "_id": "...",
            "menu": "...",
            "title": "...",
            "basePrice": 50000,
            "image": "...",
            "options": [...]
          }
        ]
      }
    ]
  }
}
```

**Mới:**
```json
{
  "statusCode": 200,
  "message": "Fetch a bookstore by id",
  "data": {
    "_id": "...",
    "name": "...",
    "phone": "...",
    "address": "...",
    "email": "...",
    "rating": 4.5,
    "image": "...",
    "isActive": true,
    "category": [  // Đổi từ "menu"
      {
        "_id": "...",
        "bookstore": "...",  // Đổi từ "restaurant"
        "title": "...",
        "book": [  // Đổi từ "menuItem"
          {
            "_id": "...",
            "category": "...",  // Đổi từ "menu"
            "title": "...",
            "basePrice": 50000,
            "image": "...",
            "options": [...]
          }
        ]
      }
    ]
  }
}
```

### 2. Like Response (GET /like)

**Cũ:**
```json
{
  "success": true,
  "message": "Liked restaurants retrieved successfully",
  "data": [
    {
      "_id": "...",
      "user": "...",
      "restaurant": {  // Object restaurant
        "_id": "...",
        "name": "...",
        ...
      },
      "quantity": 1
    }
  ]
}
```

**Mới:**
```json
{
  "success": true,
  "message": "Liked bookstores retrieved successfully",
  "data": [
    {
      "_id": "...",
      "user": "...",
      "bookstore": {  // Đổi từ "restaurant"
        "_id": "...",
        "name": "...",
        ...
      },
      "quantity": 1
    }
  ]
}
```

### 3. Order Response (GET /order)

**Cũ:**
```json
{
  "statusCode": 200,
  "message": "Đã lấy tất cả đơn hàng thành công",
  "data": [
    {
      "_id": "...",
      "restaurant": {  // Object restaurant
        "_id": "...",
        "name": "...",
        "address": "...",
        "image": "..."
      },
      "totalPrice": 100000,
      "totalQuantity": 2,
      "createdAt": "..."
    }
  ]
}
```

**Mới:**
```json
{
  "statusCode": 200,
  "message": "Đã lấy tất cả đơn hàng thành công",
  "data": [
    {
      "_id": "...",
      "bookstore": {  // Đổi từ "restaurant"
        "_id": "...",
        "name": "...",
        "address": "...",
        "image": "..."
      },
      "totalPrice": 100000,
      "totalQuantity": 2,
      "createdAt": "..."
    }
  ]
}
```

---

## 🔍 Thay Đổi Field Names trong Request/Response

### Request Body Changes

| Endpoint | Field Cũ | Field Mới |
|----------|----------|-----------|
| `POST /like` | `restaurant` | `bookstore` |
| `POST /like/delete` | `restaurant` | `bookstore` |
| `POST /order` | `restaurant` | `bookstore` |

### Response Field Changes

| Response Type | Field Cũ | Field Mới |
|---------------|----------|-----------|
| Bookstore Detail | `menu` | `category` |
| Bookstore Detail | `menuItem` | `book` |
| Category Object | `restaurant` | `bookstore` |
| Book Object | `menu` | `category` |
| Like Object | `restaurant` | `bookstore` |
| Order Object | `restaurant` | `bookstore` |

---

## 📝 Checklist cho Front-end Team

### 1. API Endpoints
- [ ] Đổi tất cả `/restaurant` → `/bookstore`
- [ ] Cập nhật các API calls trong services/API files

### 2. Request Body
- [ ] Đổi `restaurant` → `bookstore` trong POST `/like`
- [ ] Đổi `restaurant` → `bookstore` trong POST `/like/delete`
- [ ] Đổi `restaurant` → `bookstore` trong POST `/order`

### 3. Response Handling
- [ ] Đổi `menu` → `category` khi xử lý bookstore detail
- [ ] Đổi `menuItem` → `book` khi xử lý category items
- [ ] Đổi `restaurant` → `bookstore` trong like response
- [ ] Đổi `restaurant` → `bookstore` trong order response
- [ ] Đổi `restaurant` → `bookstore` trong category object
- [ ] Đổi `menu` → `category` trong book object

### 4. State Management / Variables
- [ ] Đổi tên state variables: `restaurant` → `bookstore`
- [ ] Đổi tên state variables: `menu` → `category`
- [ ] Đổi tên state variables: `menuItem` → `book`
- [ ] Cập nhật TypeScript interfaces/types nếu có

### 5. UI Components
- [ ] Cập nhật component names nếu cần
- [ ] Cập nhật text labels: "Nhà hàng" → "Nhà sách"
- [ ] Cập nhật text labels: "Menu" → "Danh mục"
- [ ] Cập nhật text labels: "Món ăn" → "Sách"

### 6. Error Messages
- [ ] Cập nhật error messages liên quan đến restaurant → bookstore
- [ ] Cập nhật success messages

---

## 🖼️ Image Paths

**Không thay đổi!** Các đường dẫn ảnh vẫn giữ nguyên:
- Bookstore images: `/images/restaurant/...`
- Book images: `/images/menu-item/...`

---

## ⚠️ Breaking Changes

Các thay đổi này là **breaking changes**, cần cập nhật front-end ngay:
1. Tất cả endpoints `/restaurant` → `/bookstore`
2. Tất cả field names `restaurant` → `bookstore` trong request/response
3. Tất cả field names `menu` → `category` trong response
4. Tất cả field names `menuItem` → `book` trong response

---

**Ngày cập nhật:** 2024

