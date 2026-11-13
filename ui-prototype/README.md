# AIOHub

Prototype tương tác cho môn Mobile Application Development. Giao diện dùng HTML, CSS và JavaScript thuần.

## Chạy thử

1. Giải nén toàn bộ ZIP.
2. Mở thư mục AIOHub-Source bằng VS Code để đọc hoặc sửa mã.
3. Nhấp đúp vào index.html để chạy bằng Chrome hoặc Edge. Chọn **Use demo account**.
4. Thử **News → VnExpress → chọn bài viết → Web Back → Services → Home**.

## Tìm phần cần sửa

| File | Nội dung |
| --- | --- |
| index.html | Trang khởi đầu, nạp CSS và các script theo thứ tự |
| css/app.css | Màu, font, bố cục, nút và kích thước màn hình |
| js/app.js | Tạo giao diện, điều hướng, tài khoản demo và trạng thái dịch vụ. Tìm welcome(), home(), category() hoặc provider() để sửa từng màn hình. |
| js/game.js | Tạo bàn chơi 2048, di chuyển, gộp ô và cộng điểm |
| js/digest.js | Hàm SHA-256 dự phòng dùng cho tài khoản demo |
| assets/ | Logo và ảnh cassette |

Chọn **⋯ → Demo controls** để xem trạng thái loading, empty, error và offline. Dữ liệu tài khoản demo lưu trong trình duyệt. Playback và khôi phục phiên trên thiết bị thứ hai được mô phỏng bằng dữ liệu cục bộ. **Reset demo** xóa dữ liệu demo của bản đang mở.
