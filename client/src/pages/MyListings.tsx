import Layout from '@/components/layout/Layout';
import AuthGate from '@/components/shared/AuthGate';
import { Link } from 'react-router-dom';
import { Car, Clock, CheckCircle, Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import type { ICar } from '@/types';
import { carsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

function formatPrice(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN');
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  'Pending verification': { label: 'Chờ duyệt', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
  Verified: { label: 'Đã duyệt', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700' },
  'In auction': { label: 'Đang đấu giá', icon: Gavel, className: 'bg-blue-100 text-blue-700' },
  'Finished auction': { label: 'Đã hết phiên', icon: Clock, className: 'bg-indigo-100 text-indigo-700' },
  'Verifying bidders': { label: 'Đang xác minh bidder', icon: Clock, className: 'bg-orange-100 text-orange-700' },
  'Setting up legal documents': { label: 'Đang làm hồ sơ', icon: Clock, className: 'bg-purple-100 text-purple-700' },
  Sold: { label: 'Đã bán', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  Rejected: { label: 'Từ chối', icon: Clock, className: 'bg-red-100 text-red-700' },
  Cancelled: { label: 'Đã hủy', icon: Clock, className: 'bg-zinc-100 text-zinc-700' },
  'Cancel request': { label: 'Yêu cầu hủy', icon: Clock, className: 'bg-amber-100 text-amber-700' },
};

const MyListings = () => {
  const [cars, setCars] = useState<ICar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        setIsLoading(true);
        const data = await carsApi.getMyCars();
        setCars(data);
        setError(null);
      } catch (err: any) {
        setError('Không thể tải danh sách xe của bạn.');
        toast({
          title: 'Tải dữ liệu thất bại',
          description: err?.response?.data?.message || 'Vui lòng thử lại.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyListings();
  }, [toast]);

  return (
    <Layout>
      <section className="py-8">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Car className="h-5 w-5 text-accent" />
            <h1 className="font-display text-2xl font-bold text-foreground">Tiến độ bán xe</h1>
          </div>

          <AuthGate message="Đăng nhập để xem tiến độ bán xe">
            {isLoading ? (
              <div className="text-center py-10 text-muted-foreground">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center py-10 text-destructive">{error}</div>
            ) : cars.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">Bạn chưa có xe nào đã đăng bán.</div>
            ) : (
            <div className="space-y-3">
              {cars.map((car) => {
                const st = STATUS_CONFIG[car.progress || 'Pending verification'] || STATUS_CONFIG['Pending verification'];
                const Icon = st.icon;
                return (
                  <Link key={car._id} to={`/cars/${car._id}`} state={{ fromMyListings: true }} className="block">
                    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-card transition-shadow">
                      <div className="w-20 aspect-[4/3] rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={car.images[0] || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{car.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Giá: <span className="font-medium text-foreground">{formatPrice(car.price)} ₫</span>
                        </p>
                      </div>
                      <Badge className={`shrink-0 ${st.className}`}>
                        <Icon className="h-3 w-3 mr-1" />{st.label}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
            )}
          </AuthGate>
        </div>
      </section>
    </Layout>
  );
};

export default MyListings;
