// ─── Sell CTA Banner ──────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SellCTA = () => (
  <section className="py-14">
    <div className="container">
      <div className="gradient-primary rounded-2xl p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8 text-primary-foreground overflow-hidden relative">
        {/* Decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
          <div className="absolute top-4 right-8 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-accent">Bán nhanh – Giá tốt</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Bạn muốn bán xe?
          </h2>
          <p className="text-primary-foreground/70 text-sm mb-6 max-w-md">
            Đăng tin miễn phí, tiếp cận hàng nghìn người mua. Định giá xe ngay để biết giá thị trường tốt nhất.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/sell">
              <Button variant="accent" size="lg">
                Đăng tin bán xe
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/evaluate">
              <Button
                size="lg"
                className="border-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                Định giá xe
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4 shrink-0">
          {[
            { value: '50K+', label: 'Xe đang bán' },
            { value: '25K+', label: 'Khách hàng' },
            { value: '500+', label: 'Đại lý' },
            { value: '99%', label: 'Hài lòng' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center bg-primary-foreground/10 rounded-xl px-5 py-3">
              <p className="font-display text-2xl font-bold text-accent">{value}</p>
              <p className="text-xs text-primary-foreground/60 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SellCTA;
