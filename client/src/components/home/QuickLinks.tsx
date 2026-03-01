// ─── Stats / Quick-links bar ──────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { Car, Tag, Search, BarChart3, FileText, Shield } from 'lucide-react';

const QUICK_LINKS = [
  { icon: Car,       label: 'Xem xe đang bán',      to: '/buy' },
  { icon: Tag,       label: 'Đăng tin bán xe',       to: '/sell' },
  { icon: Search,    label: 'Tìm kiếm xe',            to: '/buy' },
  { icon: BarChart3, label: 'Định giá xe',             to: '/evaluate' },
  { icon: FileText,  label: 'Cẩm nang mua xe',        to: '/guides' },
  { icon: Shield,    label: 'Kiểm tra phạt nguội',    to: '/check' },
];

const QuickLinks = () => (
  <section className="py-6 bg-card border-b border-border">
    <div className="container">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {QUICK_LINKS.map(({ icon: Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors text-center group"
          >
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:opacity-90 transition-opacity">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default QuickLinks;
