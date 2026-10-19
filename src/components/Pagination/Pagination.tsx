import "./Pagination.css";

interface PaginationProps {
  page: number; // 0-based
  pageCount: number;
  onChange: (page: number) => void;
}

/** Phân trang: hiện khi list dài hơn PAGE_SIZE task. */
export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav className="pagination" aria-label="Phân trang danh sách task">
      <button
        type="button"
        className="pagination__btn"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ← Trước
      </button>
      <span className="pagination__info">
        Trang {page + 1} / {pageCount}
      </span>
      <button
        type="button"
        className="pagination__btn"
        disabled={page >= pageCount - 1}
        onClick={() => onChange(page + 1)}
      >
        Sau →
      </button>
    </nav>
  );
}
