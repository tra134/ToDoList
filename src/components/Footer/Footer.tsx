import "./Footer.css";

interface FooterProps {
  remaining: number;
  overdue: number;
}

export function Footer({ remaining, overdue }: FooterProps) {
  return (
    <footer className="footer">
      <span>
        {remaining} task còn lại · {overdue} quá hạn
      </span>
    </footer>
  );
}
