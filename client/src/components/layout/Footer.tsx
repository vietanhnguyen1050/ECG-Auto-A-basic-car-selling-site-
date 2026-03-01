import { Link } from 'react-router-dom';
import { Car, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-slate-100">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Car className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold">AutoMarket</span>
            </Link>
            <p className="text-slate-300 text-sm">
              Nền tảng mua bán xe ô tô uy tín hàng đầu Việt Nam.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/cars" className="hover:text-slate-100 transition-colors">Mua xe</Link></li>
              <li><Link to="/sell" className="hover:text-slate-100 transition-colors">Bán xe</Link></li>
              <li><Link to="/evaluate" className="hover:text-slate-100 transition-colors">Định giá xe</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/faq" className="hover:text-slate-100 transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-slate-100 transition-colors">Điều khoản</Link></li>
              <li><Link to="/privacy" className="hover:text-slate-100 transition-colors">Chính sách</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Kết nối</h4>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" aria-label={`Social link ${i + 1}`} title={`Social link ${i + 1}`} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} AutoMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
