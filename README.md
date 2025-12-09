# 📝 Notepad Online

Ứng dụng ghi chú trực tuyến với tính năng đăng ký, đăng nhập và quản lý notes.

## 🏗️ Cấu trúc Project

```
NotepadOnline/
├── backend/          # Backend API (Express.js)
│   ├── index.js      # Serverless function entry
│   ├── server.js     # Local development server
│   ├── vercel.json   # Vercel config cho backend
│   └── ...
├── frontend/         # Frontend (React + Vite)
│   ├── src/
│   ├── dist/         # Build output
│   └── ...
└── DEPLOY_INSTRUCTIONS.txt  # Hướng dẫn deploy chi tiết
```

## 🚀 Deploy lên Vercel

### Bước 1: Deploy Backend

1. Vào https://vercel.com/new
2. Import repository này
3. Cấu hình:
   - **Project Name**: `notepad-backend`
   - **Root Directory**: `backend`
   - **Build Command**: (để trống)
   - **Output Directory**: (để trống)

4. Thêm Environment Variables (BẮT BUỘC):
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key cho JWT
   - `JWT_EXPIRES_IN`: `7d`
   - `REFRESH_TOKEN_EXPIRES_IN`: `30d`
   - `CORS_ORIGIN`: `*` (tạm thời)
   - `NODE_ENV`: `production`

5. Deploy và lưu lại URL backend

### Bước 2: Deploy Frontend

1. Vào https://vercel.com/new (lần 2)
2. Import repository này (lần 2)
3. Cấu hình:
   - **Project Name**: `notepad-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Thêm Environment Variable:
   - `VITE_API_URL`: URL backend từ Bước 1

5. Deploy và lưu lại URL frontend

### Bước 3: Cập nhật CORS

1. Quay lại Backend project trên Vercel
2. Settings > Environment Variables
3. Sửa `CORS_ORIGIN` thành URL frontend
4. Redeploy backend

## 🔧 Development Local

### Backend:
```bash
cd backend
npm install
npm run dev
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📚 API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/notes` - Lấy danh sách notes
- `POST /api/notes` - Tạo note mới
- `GET /api/notes/:id` - Lấy chi tiết note
- `PUT /api/notes/:id` - Cập nhật note
- `DELETE /api/notes/:id` - Xóa note

## 🔐 Environment Variables

### Backend:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key cho JWT (64 chars random)
- `JWT_EXPIRES_IN` - JWT expiration time
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiration
- `CORS_ORIGIN` - Allowed CORS origin
- `NODE_ENV` - Environment (production/development)

### Frontend:
- `VITE_API_URL` - Backend API URL

## 📝 License

MIT

