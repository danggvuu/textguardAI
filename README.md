# TextGuard AI - AI Humanizer & Detector Clone

Ứng dụng web mô phỏng và tái tạo hoàn chỉnh nền tảng **TextGuard AI Humanizer** (`https://textguard.ai/vi/humanize`), chuyên dùng để kiểm tra độ giống AI và chuyển đổi văn bản do AI (ChatGPT, Claude, Gemini) tạo thành văn bản tự nhiên như người viết.

---

## 🌟 Tính năng nổi bật

### 1. Trình nhân bản hóa văn bản (AI Humanizer)
- **3 Mức độ nhân bản (Strength)**:
  - **Nhẹ nhàng (Light)**: Giữ nguyên cấu trúc ban đầu, tinh chỉnh ngữ nghĩa và thay thế từ ngữ robot.
  - **Cân bằng (Balanced - Khuyên dùng)**: Tối ưu hóa tính trôi chảy, nhịp điệu và độ biến thiên câu.
  - **Mạnh mẽ (Aggressive / Max)**: Tái cấu trúc câu chuyên sâu, thay đổi độ dài câu và đảo ngữ để vượt qua các bộ lọc khắt khe nhất (Turnitin, GPTZero).
- **Trình độ đọc (Readability)**: Trung học, Đại học, Nhà báo, Tiến sĩ.
- **Mục đích văn bản (Purpose)**: Tổng quát, Bài luận học thuật, Marketing & Quảng cáo, Kể chuyện sáng tạo, Email & Báo cáo công sở, Pháp lý.
- **Tiến trình xử lý 4 giai đoạn** mô phỏng chân thực:
  1. *Đang quét phân tích mẫu câu văn bản...*
  2. *Khớp trình độ đọc...*
  3. *Áp dụng cấu trúc phong cách...*
  4. *Tái cấu trúc vượt qua bộ kiểm tra AI...*

### 2. Bộ phân tích & Phát hiện AI (AI Detector & Heatmap)
- **Đồng hồ đo trực quan (Gauge Meter)**: Hiển thị Điểm tự nhiên (Human Score) và Điểm nghi ngờ AI.
- **Chỉ số ngôn ngữ học**:
  - **Burstiness (Độ biến thiên nhịp điệu)**: Đo lường độ xen kẽ giữa câu ngắn và câu dài.
  - **Perplexity (Độ phong phú từ vựng)**: Đánh giá độ đa dạng từ vựng và tính khó đoán.
- **Bản đồ nhiệt từng câu (Sentence Heatmap)**:
  - 🟥 **Đỏ**: Khả năng cao do AI (>65%).
  - 🟨 **Vàng**: Trộn lẫn AI & Người (35% - 65%).
  - 🟩 **Xanh**: Tự nhiên con người (<35%).
  - Nhấp vào từng câu để xem lý do chi tiết (cụm từ khuôn mẫu AI, cấu trúc quá trịnh trọng...) và nút 1-click **"Humanize câu này"**.
- **Dự đoán điểm trên các detector lớn**: Turnitin, GPTZero, CopyLeaks, ZeroGPT, CrossPlag.

### 3. Công cụ so sánh thay đổi (Diff Viewer)
- So sánh chi tiết từng từ giữa văn bản gốc và văn bản sau khi chuyển đổi:
  - Từ ngữ khuôn mẫu AI bị gạch đỏ loại bỏ.
  - Cụm từ người viết được bôi xanh nổi bật.

### 4. Động cơ kép (Dual-Engine)
- **Engine NLP nội bộ thông minh (Mặc định - 100% Miễn phí & Offline)**: Bộ quy tắc ngôn ngữ học loại bỏ các từ nối máy móc (`Không thể phủ nhận rằng`, `Trong kỷ nguyên số`, `Đóng vai trò quan trọng`, `Furthermore`, `In conclusion`, v.v.), tăng burstiness và đảo ngữ tự nhiên.
- **Kết nối Cloud LLM tùy chọn**: Hỗ trợ người dùng nhập API Key (Google Gemini API hoặc OpenAI) trong mục **Cài đặt API** để sử dụng mô hình AI cao cấp.

### 5. Tiện ích & Trải nghiệm
- Song ngữ: **Tiếng Việt 🇻🇳** và **English 🇬🇧**.
- Hỗ trợ tải tệp lên: `.txt`, `.docx`, `.md`.
- Xuất kết quả: Tải file `.txt` hoặc sao chép 1-click.
- Kho bài mẫu AI có sẵn (Preset Samples) cho Học thuật, Marketing, Báo cáo để test nhanh.

---

## 🚀 Hướng dẫn khởi chạy

### Chạy ứng dụng:
Máy chủ hiện đã được khởi chạy sẵn tại:
👉 **[http://localhost:3001](http://localhost:3001)**

Nếu muốn khởi động lại hoặc chạy môi trường phát triển:
```bash
# Khởi động cả API và Frontend (môi trường production)
npm start

# Hoặc khởi động môi trường dev với Hot-Reload
npm run dev
```

- **Giao diện web**: `http://localhost:3001` (hoặc `http://localhost:5173` khi dùng `npm run dev`)
- **API Health check**: `http://localhost:3001/api/health`
