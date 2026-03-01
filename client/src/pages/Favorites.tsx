import Layout from '@/components/layout/Layout';
import AuthGate from '@/components/shared/AuthGate';
import BuyCarCard from '@/components/buy/BuyCarCard';
import mockCars from '@/data/mockCars';
import { Heart } from 'lucide-react';

const favoriteCars = mockCars.slice(0, 3);

const Favorites = () => {
  return (
    <Layout>
      <section className="py-8">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-5 w-5 text-accent" />
            <h1 className="font-display text-2xl font-bold text-foreground">Xe yêu thích</h1>
          </div>

          <AuthGate message="Đăng nhập để xem xe yêu thích">
            {favoriteCars.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">Bạn chưa có xe yêu thích nào.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {favoriteCars.map(car => <BuyCarCard key={car._id} car={car} />)}
              </div>
            )}
          </AuthGate>
        </div>
      </section>
    </Layout>
  );
};

export default Favorites;
