# 📝 Hệ Thống Trắc Nghiệm Local (Quiz Exam)

Chào mừng bạn đến với **Quiz Exam**, một ứng dụng web trắc nghiệm được xây dựng với tiêu chí: **Nhanh - Gọn - Chuyên Nghiệp**. Ứng dụng cho phép người dùng thực hiện các bài thi trắc nghiệm trực tiếp trên máy local, lưu trữ kết quả và xem lại bài làm chi tiết.

## ✨ Tính Năng Nổi Bật

### 1. Giao Diện & Trải Nghiệm (UI/UX)
- **Flat Design:** Thiết kế theo phong cách phẳng, hiện đại với tông màu xanh chuyên nghiệp, phù hợp với môi trường giáo dục.
- **Bố cục cố định (Fixed Layout):** Khung ứng dụng luôn ổn định ở kích thước chuẩn (850px), giúp nội dung không bị nhảy khi thay đổi câu hỏi.
- **Bảng đáp án (Question Matrix):** Một bảng điều hướng thông minh bên cạnh cho phép bạn nhảy nhanh đến bất kỳ câu hỏi nào.

### 2. Logic Bài Thi
- **Xáo trộn thông minh (Shuffle):** Mỗi lượt thi sẽ tự động xáo trộn cả thứ tự câu hỏi và thứ tự các lựa chọn (A, B, C, D) để đảm bảo tính khách quan.
- **Tùy chọn số lượng câu:** Người dùng có thể tự nhập số lượng câu hỏi muốn làm trước khi bắt đầu bài thi.
- **Ràng buộc nộp bài:** Hệ thống yêu cầu người dùng phải trả lời **tất cả** các câu hỏi mới được phép nộp bài.
- **Nút Bỏ bài:** Cho phép thoát nhanh bài thi hiện tại và xóa sạch dữ liệu bài đang làm để quay về trang chủ.

### 3. Kết Quả & Lịch Sử (Local Storage)
- **Lưu trữ local:** Kết quả thi (Tên, Điểm số, Ngày giờ) được lưu trực tiếp vào trình duyệt của bạn (LocalStorage).
- **Chế độ Xem Lại (Review Mode):** 
    - Xem lại chi tiết từng lượt thi trong lịch sử.
    - Hiển thị trực quan câu đúng (màu xanh), câu sai (màu đỏ).
    - Chỉ rõ đáp án đúng và lựa chọn thực tế của người dùng.

## 🛠 Công Nghệ Sử Dụng
- **Frontend:** React.js, Vite, TypeScript, Vanilla CSS.
- **Backend:** Node.js, Express.js (Hệ thống đã có khung sẵn sàng để mở rộng API/Database).

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Yêu cầu hệ thống
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).

### 2. Khởi chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
Sau đó truy cập: `http://localhost:5173`

### 3. Khởi chạy Backend (Tùy chọn mở rộng)
```bash
cd backend
npm install
npm run dev
```
Server sẽ chạy tại cổng `3001`.

---
*Dự án được phát triển theo tiêu chuẩn vancevo_skills.*
