// ─── Featured Listings Section ─────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { MapPin, Gauge } from 'lucide-react';

const SAMPLE_CARS = [
  { _id: '1', title: 'Toyota Vios 1.5E CVT', year: 2021, price: 465000000, mileage: 28000, location: 'Hà Nội', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=280&fit=crop', badge: 'Mới đăng' },
  { _id: '2', title: 'Honda City RS 2022',   year: 2022, price: 530000000, mileage: 15000, location: 'TP.HCM',  image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=280&fit=crop', badge: 'Hot' },
  { _id: '3', title: 'Hyundai Tucson 2.0 AT', year: 2020, price: 710000000, mileage: 42000, location: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=280&fit=crop', badge: null },
  { _id: '4', title: 'Mazda CX-5 2.0 AT',   year: 2021, price: 820000000, mileage: 31000, location: 'Hà Nội',  image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=280&fit=crop', badge: null },
  { _id: '5', title: 'Kia Seltos 1.4 Turbo', year: 2022, price: 678000000, mileage: 18000, location: 'TP.HCM',  image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=280&fit=crop', badge: 'Tốt' },
  { _id: '6', title: 'Ford Ranger XLT 4x2',  year: 2020, price: 595000000, mileage: 55000, location: 'Cần Thơ', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=280&fit=crop', badge: null },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const FeaturedListings = () => (
  <section className="py-10 bg-secondary/40">
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Xe nổi bật</h2>
          <p className="text-sm text-muted-foreground">Được kiểm duyệt kỹ, giá minh bạch</p>
        </div>
        <Link to="/buy" className="text-sm text-accent hover:underline font-medium">
          Xem tất cả →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_CARS.map((car) => (
          <Link
            key={car._id}
            to={`/cars/${car._id}`}
            className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/40 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={car.image}
                alt={car.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {car.badge && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] font-semibold gradient-accent text-accent-foreground shadow">
                  {car.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors line-clamp-1">
                {car.title}
              </h3>
              <p className="font-display font-bold text-lg text-accent mb-2">{fmt(car.price)}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  {car.mileage.toLocaleString()} km
                </span>
                <span>{car.year}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {car.location}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedListings;
