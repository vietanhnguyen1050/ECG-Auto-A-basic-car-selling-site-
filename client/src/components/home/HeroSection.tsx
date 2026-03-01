import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Car, DollarSign, BarChart3 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-0 w-72 h-72 bg-white/40 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
            Mua & Bán Xe Ô Tô
            <br />
            <span className="text-blue-200">Nhanh – Gọn – Tin Cậy</span>
          </h1>
          <p className="text-white/80 mb-8 text-base lg:text-lg">
            Hàng nghìn xe đã qua kiểm định, giá minh bạch, mua bán dễ dàng.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/cars">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 w-full sm:w-auto font-semibold">
                <Car className="h-5 w-5" />
                Mua xe ngay
              </Button>
            </Link>
            <Link to="/sell">
              <Button size="lg" className="bg-white/20 text-white hover:bg-white/30 border border-white/40 gap-2 w-full sm:w-auto font-semibold">
                <DollarSign className="h-5 w-5" />
                Đăng tin bán xe
              </Button>
            </Link>
            <Link to="/evaluate">
              <Button size="lg" className="bg-white/20 text-white hover:bg-white/30 border border-white/40 gap-2 w-full sm:w-auto font-semibold">
                <BarChart3 className="h-5 w-5" />
                Định giá xe
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
