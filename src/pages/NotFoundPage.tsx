import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <h2>404 — Không tìm thấy trang</h2>
      <p>Đường dẫn bạn mở không tồn tại.</p>
      <Link to="/">← Về trang chủ Hôm nay</Link>
    </main>
  );
}
