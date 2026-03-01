// ─── Brand Logos Section ───────────────────────────────────────────────────────

import { Link } from 'react-router-dom';

const BRANDS = [
  'Toyota', 'Honda', 'Hyundai', 'Kia', 'Mazda',
  'Ford', 'BMW', 'Mercedes', 'Mitsubishi', 'Suzuki',
];

const BrandsSection = () => (
  <section className="py-10">
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Thương hiệu nổi bật</h2>
        <Link to="/buy" className="text-sm text-accent hover:underline font-medium">
          Xem tất cả →
        </Link>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
        {BRANDS.map((brand) => (
          <Link
            key={brand}
            to={`/buy?brand=${brand}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl border border-border bg-card hover:border-accent/50 hover:shadow-soft flex items-center justify-center transition-all group-hover:-translate-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground group-hover:text-accent transition-colors text-center leading-tight px-1">
                {brand.toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground text-center">{brand}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default BrandsSection;
