import { NavLink } from "react-router-dom";
import "./FilterNav.css";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Tất cả", end: true },
  { to: "/active", label: "Đang làm" },
  { to: "/completed", label: "Đã xong" },
  { to: "/overdue", label: "Quá hạn" },
];

/** NavLink tự thêm class `active` cho link của route hiện tại. */
export function FilterNav() {
  return (
    <nav className="filter-nav" aria-label="Bộ lọc task">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className="filter-nav__link"
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
