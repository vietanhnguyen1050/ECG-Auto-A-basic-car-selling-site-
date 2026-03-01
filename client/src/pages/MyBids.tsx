import Layout from '@/components/layout/Layout';
import AuthGate from '@/components/shared/AuthGate';
import { Link } from 'react-router-dom';
import { Gavel, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo, useState } from 'react';
import type { ICar } from '@/types';
import { bidsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

function formatPrice(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN');
}

const MyBids = () => {
  const [cars, setCars] = useState<ICar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        setIsLoading(true);
        const data = await bidsApi.getMyBids();
        setCars(data);
        setError(null);
      } catch (err: any) {
        setError('Không thể tải xe đang đấu giá.');
        toast({
          title: 'Tải dữ liệu thất bại',
          description: err?.response?.data?.message || 'Vui lòng thử lại.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBids();
  }, [toast]);

  const myBidRows = useMemo(() => {
    return cars.map((car) => {
      const myBids = (car.bids || [])
        .filter((bid) => String(bid.bidder) === String(user?._id))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const myBid = myBids[0]?.amount || 0;
      const highest = Number(car.currentBid || car.price || 0);

      return {
        car,
        myBid,
        isLeading: myBid > 0 && myBid >= highest,
      };
    });
  }, [cars, user?._id]);

  return (
    <Layout>
      <section className="py-8">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Gavel className="h-5 w-5 text-accent" />
            <h1 className="font-display text-2xl font-bold text-foreground">Xe đang đấu giá</h1>
          </div>

          <AuthGate message="Đăng nhập để xem xe đang đấu giá">
            {isLoading ? (
              <div className="text-center py-10 text-muted-foreground">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center py-10 text-destructive">{error}</div>
            ) : myBidRows.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">Bạn chưa tham gia đấu giá xe nào.</div>
            ) : (
            <div className="space-y-3">
              {myBidRows.map(({ car, myBid, isLeading }) => (
                <Link key={car._id} to={`/cars/${car._id}`} className="block">
                  <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-card transition-shadow">
                    <div className="w-20 aspect-[4/3] rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={car.images[0] || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">{car.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Giá bạn trả: <span className="font-medium text-foreground">{formatPrice(myBid)} ₫</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Giá cao nhất: <span className="font-medium text-foreground">{formatPrice(car.currentBid || car.price)} ₫</span>
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${isLeading ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isLeading ? <><TrendingUp className="h-3 w-3 mr-1" />Dẫn đầu</> : <><TrendingDown className="h-3 w-3 mr-1" />Bị vượt</>}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </AuthGate>
        </div>
      </section>
    </Layout>
  );
};

export default MyBids;
