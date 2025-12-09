# 🌐 Hướng dẫn Deploy qua Vercel Web (Dashboard)

## 📋 Tổng quan các bước:

1. ✅ Push code lên GitHub
2. ✅ Đăng nhập Vercel
3. ✅ Import project từ GitHub
4. ✅ Cấu hình build settings
5. ✅ Deploy
6. ✅ Thêm Environment Variables
7. ✅ Redeploy
8. ✅ Test và kiểm tra

---

## BƯỚC 1: Push code lên GitHub

### Nếu chưa có GitHub repository:

1. **Tạo repository mới trên GitHub**:

   - Truy cập: https://github.com/new
   - Repository name: `notepadonline` (hoặc tên bạn thích)
   - Chọn **Public** hoặc **Private**
   - **KHÔNG** chọn "Add a README file"
   - Click **"Create repository"**

2. **Push code lên GitHub**:

   ```bash
   # Mở terminal trong thư mục project
   cd C:\Users\ADMIN\Desktop\NotepadOnline

   # Khởi tạo git (nếu chưa có)
   git init

   # Thêm tất cả files
   git add .

   # Commit
   git commit -m "Initial commit - Ready to deploy"

   # Thêm remote (thay YOUR_USERNAME bằng username GitHub của bạn)
   git remote add origin https://github.com/YOUR_USERNAME/notepadonline.git

   # Push lên GitHub
   git branch -M main
   git push -u origin main
   ```

### Nếu đã có GitHub repository:

```bash
# Chỉ cần push code mới nhất
git add .
git commit -m "Update for Vercel deployment"
git push origin main
```

---

## BƯỚC 2: Đăng nhập Vercel

1. **Truy cập Vercel**:

   - Mở trình duyệt
   - Vào: https://vercel.com/login

2. **Chọn phương thức đăng nhập**:

   - **Continue with GitHub** ⬅️ **KHUYẾN NGHỊ** (dễ nhất)
   - Continue with GitLab
   - Continue with Bitbucket
   - Continue with Email

3. **Cho phép Vercel truy cập GitHub** (nếu lần đầu):
   - Click **"Authorize Vercel"**
   - Chọn repositories Vercel có thể truy cập:
     - **All repositories** (tất cả)
     - **Only select repositories** (chọn `notepadonline`)

---

## BƯỚC 3: Import Project từ GitHub

1. **Vào Dashboard**:

   - Sau khi đăng nhập, bạn sẽ thấy Vercel Dashboard
   - Nếu không, vào: https://vercel.com/dashboard

2. **Tạo project mới**:

   - Click nút **"Add New..."** (góc trên bên phải)
   - Chọn **"Project"**

3. **Import Git Repository**:

   - Bạn sẽ thấy danh sách repositories từ GitHub
   - Tìm repository **"notepadonline"**
   - Click nút **"Import"** bên cạnh repository đó

   📸 **Giao diện sẽ như thế này**:

   ```
   Import Git Repository

   Search repositories...

   [GitHub icon] notepadonline
   [Import] ⬅️ CLICK VÀO ĐÂY
   ```

---

## BƯỚC 4: Cấu hình Project Settings

Sau khi click Import, bạn sẽ thấy trang cấu hình:

### 📝 Configure Project:

1. **Project Name**:

   ```
   notepadonline
   ```

   (hoặc để mặc định)

2. **Framework Preset**:

   ```
   Other
   ```

   (hoặc chọn "Vite" nếu có)

3. **Root Directory**:

   ```
   ./
   ```

   (giữ nguyên - không thay đổi)

4. **Build and Output Settings**:

   ✅ Click vào **"Override"** để tùy chỉnh

   **Build Command**:

   ```bash
   cd frontend && npm install && npm run build
   ```

   **Output Directory**:

   ```
   frontend/dist
   ```

   **Install Command**:

   ```bash
   npm install
   ```

   (hoặc để mặc định)

5. **Environment Variables**:
   - **TẠM THỜI BỎ QUA** bước này
   - Chúng ta sẽ thêm sau khi deploy lần đầu
   - Click **"Deploy"** ngay

📸 **Giao diện cấu hình**:

```
Configure Project

Project Name: notepadonline
Framework Preset: Other
Root Directory: ./

Build and Output Settings
☑️ Override
  Build Command: cd frontend && npm install && npm run build
  Output Directory: frontend/dist
  Install Command: npm install

Environment Variables
[Add Environment Variables] ⬅️ BỎ QUA, THÊM SAU

[Deploy] ⬅️ CLICK VÀO ĐÂY
```

---

## BƯỚC 5: Deploy lần đầu

1. **Click nút "Deploy"**

2. **Chờ Vercel build và deploy**:

   - Bạn sẽ thấy màn hình building với logs
   - Quá trình này mất khoảng 2-3 phút
   - Vercel sẽ:
     - Clone repository
     - Install dependencies
     - Build frontend
     - Deploy lên CDN

3. **Theo dõi build logs**:

   ```
   Building...
   ├─ Installing dependencies
   ├─ Running build command
   ├─ Uploading files
   └─ Deployment ready
   ```

4. **Deployment thành công**:
   - Bạn sẽ thấy màn hình chúc mừng với confetti 🎉
   - URL production: `https://notepadonline-xxx.vercel.app`
   - Click **"Continue to Dashboard"**

---

## BƯỚC 6: Thêm Environment Variables

⚠️ **QUAN TRỌNG**: Bước này bắt buộc để API hoạt động!

### 6.1. Vào Settings

1. Trong Dashboard của project, bạn sẽ thấy các tabs:

   ```
   [Deployments] [Analytics] [Logs] [Settings]
   ```

2. Click vào tab **"Settings"**

### 6.2. Tìm Environment Variables

1. Trong Settings, menu bên trái có nhiều options:

   ```
   General
   Domains
   Git
   Environment Variables ⬅️ CLICK VÀO ĐÂY
   Functions
   Build & Development Settings
   ...
   ```

2. Click vào **"Environment Variables"**

### 6.3. Thêm từng biến môi trường

Bạn sẽ thấy nút **"Add New"** hoặc **"Add Variable"**

**Thêm 6 biến sau (từng biến một):**

---

#### ✅ Biến 1: MONGODB_URI

Click **"Add New"**, nhập:

```
Key (Name):
MONGODB_URI

Value:
mongodb+srv://username:password@cluster.mongodb.net/notepad-online?retryWrites=true&w=majority

Environment:
☑️ Production
☑️ Preview
☑️ Development
```

⚠️ **Chú ý**:

- Thay `username`, `password`, `cluster` bằng thông tin MongoDB Atlas của bạn
- Nếu chưa có MongoDB Atlas, xem hướng dẫn ở cuối file này

Click **"Save"**

---

#### ✅ Biến 2: JWT_SECRET

Click **"Add New"**, nhập:

```
Key (Name):
JWT_SECRET

Value:
[Chuỗi ngẫu nhiên dài - xem cách tạo bên dưới]

Environment:
☑️ Production
☑️ Preview
☑️ Development
```

**Cách tạo JWT_SECRET**:

```bash
# Mở terminal và chạy lệnh này:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Kết quả sẽ là chuỗi dài như:
# a1b2c3d4e5f6789...xyz
# Copy chuỗi này và paste vào Value
```

Click **"Save"**

---

#### ✅ Biến 3: JWT_EXPIRES_IN

Click **"Add New"**, nhập:

```
Key (Name):
JWT_EXPIRES_IN

Value:
7d

Environment:
☑️ Production
☑️ Preview
☑️ Development
```

Click **"Save"**

---

#### ✅ Biến 4: REFRESH_TOKEN_EXPIRES_IN

Click **"Add New"**, nhập:

```
Key (Name):
REFRESH_TOKEN_EXPIRES_IN

Value:
30d

Environment:
☑️ Production
☑️ Preview
☑️ Development
```

Click **"Save"**

---

#### ✅ Biến 5: CORS_ORIGIN

Click **"Add New"**, nhập:

```
Key (Name):
CORS_ORIGIN

Value:
*

Environment:
☑️ Production
☑️ Preview
☑️ Development
```

Click **"Save"**

---

#### ✅ Biến 6: NODE_ENV

Click **"Add New"**, nhập:

```
Key (Name):
NODE_ENV

Value:
production

Environment:
☑️ Production only (chỉ chọn Production)
```

Click **"Save"**

---

### 6.4. Kiểm tra danh sách Environment Variables

Sau khi thêm xong, bạn sẽ thấy:

```
Environment Variables (6)

MONGODB_URI          Production, Preview, Development
JWT_SECRET           Production, Preview, Development
JWT_EXPIRES_IN       Production, Preview, Development
REFRESH_TOKEN_...    Production, Preview, Development
CORS_ORIGIN          Production, Preview, Development
NODE_ENV             Production
```

---

## BƯỚC 7: Redeploy để áp dụng Environment Variables

⚠️ **Environment Variables chỉ có hiệu lực sau khi redeploy!**

### Cách 1: Redeploy qua Dashboard

1. Click vào tab **"Deployments"** (phía trên)

2. Bạn sẽ thấy danh sách deployments, deployment mới nhất ở trên cùng

3. Click vào deployment mới nhất (dòng đầu tiên)

4. Trong trang deployment details, bạn sẽ thấy nút **"..."** (3 chấm) hoặc **"Redeploy"**

5. Click **"Redeploy"**

6. Chọn **"Use existing Build Cache"** (nhanh hơn) hoặc **"Rebuild"** (build lại từ đầu)

7. Click **"Redeploy"**

8. Chờ 1-2 phút để deployment hoàn tất

### Cách 2: Push commit mới lên GitHub

```bash
# Thêm một thay đổi nhỏ (ví dụ: update README)
git add .
git commit -m "Trigger redeploy with env vars"
git push origin main
```

→ Vercel sẽ tự động deploy khi có push mới!

---

## BƯỚC 8: Kiểm tra và Test

### 8.1. Kiểm tra Frontend

1. **Lấy URL production**:

   - Trong Dashboard > Deployments
   - Hoặc vào: https://vercel.com/dashboard
   - URL sẽ dạng: `https://notepadonline-xxx.vercel.app`

2. **Mở URL trong trình duyệt**:
   - Trang chủ phải hiển thị đúng
   - Navigation phải hoạt động
   - CSS/styling phải đẹp

### 8.2. Kiểm tra API

1. **Test API Root**:

   ```
   https://notepadonline-xxx.vercel.app/api
   ```

   Mở trong trình duyệt, bạn sẽ thấy:

   ```json
   {
     "success": true,
     "message": "Welcome to Notepad Online API",
     "version": "1.0.0",
     "timestamp": "2024-12-09T..."
   }
   ```

2. **Test Health Check**:

   ```
   https://notepadonline-xxx.vercel.app/api/health
   ```

   Kết quả mong đợi:

   ```json
   {
     "success": true,
     "status": "ok",
     "database": "connected",  ⬅️ QUAN TRỌNG: Phải là "connected"
     "timestamp": "...",
     "uptime": 123.456
   }
   ```

   ✅ Nếu `"database": "connected"` → Thành công!
   ❌ Nếu `"database": "disconnected"` → Kiểm tra lại MONGODB_URI

### 8.3. Test các chức năng

1. **Đăng ký user**:

   - Vào `/register`
   - Tạo tài khoản mới
   - Kiểm tra có đăng ký thành công không

2. **Đăng nhập**:

   - Vào `/login`
   - Đăng nhập với tài khoản vừa tạo

3. **Tạo note**:

   - Tạo note mới
   - Kiểm tra lưu thành công

4. **Xem notes**:
   - Vào Dashboard
   - Xem danh sách notes của bạn

---

## 🎉 HOÀN THÀNH!

Chúc mừng! Project của bạn đã được deploy thành công lên Vercel!

### 📊 Tóm tắt:

✅ Frontend: `https://notepadonline-xxx.vercel.app`
✅ Backend API: `https://notepadonline-xxx.vercel.app/api`
✅ Auto-deploy: Mỗi khi push lên GitHub, Vercel tự động deploy
✅ Environment Variables: Đã cấu hình đầy đủ
✅ MongoDB: Đã kết nối thành công

---

## 📚 PHỤ LỤC: Hướng dẫn tạo MongoDB Atlas

### Bước 1: Đăng ký MongoDB Atlas

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký bằng Google hoặc Email
3. Xác thực email

### Bước 2: Tạo Cluster (Database)

1. Chọn **"Build a Database"**
2. Chọn plan **"M0 Free"** (miễn phí mãi mãi)
3. Chọn Provider: **AWS**
4. Chọn Region: **Singapore** (ap-southeast-1) - gần Việt Nam nhất
5. Cluster Name: `Cluster0`
6. Click **"Create Cluster"**
7. Chờ 2-3 phút

### Bước 3: Tạo Database User

1. Bạn sẽ thấy popup "Security Quickstart"
2. Hoặc vào menu **"Database Access"** bên trái

**Tạo user**:

```
Authentication Method: Password
Username: notepaduser
Password: [Tạo password mạnh - LƯU LẠI!]

Database User Privileges: Read and write to any database
```

Click **"Add User"**

### Bước 4: Whitelist IP (Cho phép truy cập)

1. Vào menu **"Network Access"** bên trái
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"**
   ```
   IP Address: 0.0.0.0/0
   Description: Vercel serverless functions
   ```
4. Click **"Confirm"**

⚠️ **Lưu ý**: `0.0.0.0/0` cho phép tất cả IPs - cần thiết cho Vercel serverless

### Bước 5: Lấy Connection String

1. Vào menu **"Database"** bên trái
2. Click nút **"Connect"** của Cluster0
3. Chọn **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy connection string:

   ```
   mongodb+srv://notepaduser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Chỉnh sửa connection string**:

   - Thay `<password>` → password thực của user
   - Thêm database name `/notepad-online` trước dấu `?`

   **Kết quả cuối cùng**:

   ```
   mongodb+srv://notepaduser:yourpassword@cluster0.xxxxx.mongodb.net/notepad-online?retryWrites=true&w=majority
   ```

7. **Copy chuỗi này** và dùng làm giá trị cho `MONGODB_URI` trong Vercel

---

## 🔄 Cập nhật sau này

### Khi có thay đổi code:

```bash
# 1. Commit changes
git add .
git commit -m "Update features"

# 2. Push lên GitHub
git push origin main

# 3. Vercel tự động deploy!
```

### Xem logs nếu có lỗi:

1. Vào Vercel Dashboard
2. Click vào project
3. Tab **"Deployments"** → Click vào deployment
4. Xem **"Build Logs"** và **"Function Logs"**

---

## 🐛 Troubleshooting

### Lỗi: Build failed

- Kiểm tra Build Command đúng chưa
- Xem Build Logs để biết lỗi cụ thể

### Lỗi: Database disconnected

- Kiểm tra MONGODB_URI đúng chưa
- Password có ký tự đặc biệt? Cần encode URL
- IP whitelist có `0.0.0.0/0` chưa?

### Lỗi: 404 Not Found

- Kiểm tra Output Directory: `frontend/dist`
- Kiểm tra vercel.json cấu hình đúng chưa

### Lỗi: API không hoạt động

- Kiểm tra Environment Variables đã thêm đủ chưa
- Đã Redeploy sau khi thêm env vars chưa?
- Xem Function Logs để debug

---

**Chúc bạn deploy thành công! 🚀**

Nếu cần hỗ trợ thêm, hãy cho tôi biết!
