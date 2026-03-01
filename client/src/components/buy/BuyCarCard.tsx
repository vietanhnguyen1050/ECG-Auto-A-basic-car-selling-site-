import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ICar } from '@/types';

function redactName(name: string) {
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  return parts.map((p) => p[0] + '***').join(' ');
}

function formatPrice(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN');
}

function formatCountdown(ms: number) {
  if (ms <= 0) return 'Đã kết thúc';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

interface Props {
  car: ICar;
}

const BuyCarCard = ({ car }: Props) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const endTime = car.auctionSession?.endTime ? new Date(car.auctionSession.endTime).getTime() : null;
  const inAuctionSession = car.progress === 'In auction' && !!endTime && endTime > now;
  const highestBid = Number(car.currentBid || car.price || 0);

  return (
    <div className="group relative h-full">
      <Link to={`/cars/${car._id}`} className="block h-full">
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-soft hover:shadow-card transition-shadow h-full flex flex-col">
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            <img src={car.images[0] || '/placeholder.svg'} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {inAuctionSession && (
              <Badge className="absolute top-2 right-2 text-xs bg-accent text-white">
                <Gavel className="h-3 w-3 mr-1" />Đấu giá
              </Badge>
            )}
          </div>

          <div className="p-3.5 space-y-2 flex-1 flex flex-col">
            <h3 className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-1">
              {car.title}
            </h3>

            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3" />
              <span>{car.location}</span>
              <span className="mx-1">·</span>
              <span>{redactName(car.sellerName)}</span>
            </div>

            <div className="pt-1 border-t border-border mt-auto min-h-[118px]">
              {inAuctionSession ? (
                <div className="space-y-1">
                  <div>
                    <span className="text-xs text-muted-foreground">Giá cao nhất hiện tại</span>
                    <p className="font-display font-bold text-accent text-base">
                      {formatPrice(highestBid)} ₫
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Giá khởi điểm</span>
                    <p className="font-display font-semibold text-foreground text-sm">
                      {formatPrice(car.price)} ₫
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Phiên #{car.auctionSession?.sessionNumber || 0}</span>
                    <span>Còn lại: {formatCountdown((endTime || 0) - now)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-muted-foreground">Giá khởi điểm</span>
                  <p className="font-display font-bold text-accent text-base">
                    {formatPrice(car.price)} ₫
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

    </div>
  );
};

export default BuyCarCard;
