import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gavel, Clock, TrendingUp } from 'lucide-react';
import BidHistory from './BidHistory';
import type { ICar, IBid } from '@/types';
import { bidsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

const AuctionPanel = ({ car }: { car: ICar }) => {
  const [bidAmount, setBidAmount] = useState(1000000);
  const [bids, setBids] = useState<IBid[]>(car.bids || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(car.auctionSession?.endTime ? new Date(car.auctionSession.endTime) : null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setSessionEndTime(car.auctionSession?.endTime ? new Date(car.auctionSession.endTime) : null);
  }, [car.auctionSession?.endTime]);

  useEffect(() => {
    const fetchBidders = async () => {
      try {
        const res = await bidsApi.getBidders(car._id);
        const mapped: IBid[] = (res?.bidders ?? []).map((item: any, index: number) => ({
          _id: String(item?._id ?? `${item?.userid?._id ?? 'bid'}-${item?.time ?? index}`),
          bidder: String(item?.userid?._id ?? ''),
          bidderName: item?.userid?.displayname || item?.userid?.email || 'Ẩn danh',
          amount: Number(item?.amount || 0),
          timestamp: new Date(item?.time || Date.now()),
        }));
        setBids(mapped);
      } catch {
        setBids(car.bids || []);
      }
    };

    fetchBidders();
    const intervalId = setInterval(fetchBidders, 5000);
    return () => clearInterval(intervalId);
  }, [car._id, car.bids]);

  useEffect(() => {
    if (!sessionEndTime) return;
    const tick = () => {
      const remaining = new Date(sessionEndTime).getTime() - Date.now();
      setCountdown(Math.max(0, remaining));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionEndTime]);

  const latestBid = useMemo(() => {
    if (!bids.length) return undefined;

    return bids.reduce((latest, current) => {
      if (!latest) return current;
      return new Date(current.timestamp).getTime() >= new Date(latest.timestamp).getTime()
        ? current
        : latest;
    }, bids[0]);
  }, [bids]);

  const isBlockedByConsecutiveBid = Boolean(
    user?._id && latestBid?.bidder && String(latestBid.bidder) === String(user._id),
  );
  const sellerId = typeof car.seller === 'string' ? car.seller : car.seller?._id;
  const isOwnerViewingOwnCar = Boolean(
    user?._id && sellerId && String(user._id) === String(sellerId),
  );

  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : car.price;

  const handleBid = async () => {
    if (!user?._id) return;
    try {
      setIsSubmitting(true);
      const bidTime = new Date().toISOString();
      await bidsApi.placeBid({
        carId: car._id,
        userid: user._id,
        amount: bidAmount,
        time: bidTime,
      });

      const latest = await bidsApi.getBidders(car._id);
      const mapped: IBid[] = (latest?.bidders ?? []).map((item: any, index: number) => ({
        _id: String(item?._id ?? `${item?.userid?._id ?? 'bid'}-${item?.time ?? index}`),
        bidder: String(item?.userid?._id ?? ''),
        bidderName: item?.userid?.displayname || item?.userid?.email || 'Ẩn danh',
        amount: Number(item?.amount || 0),
        timestamp: new Date(item?.time || Date.now()),
      }));
      setBids(mapped);
      toast({ title: 'Trả giá thành công' });
    } catch (error: any) {
      toast({
        title: 'Không thể trả giá',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sliderValue = bidAmount / 1000000;

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-5 sticky top-20">
      <div className="flex items-center gap-2">
        <Gavel className="h-5 w-5 text-accent" />
        <h3 className="font-display font-semibold text-foreground">Đấu giá</h3>
        {car.auctionSession && (
          <Badge variant="secondary" className="ml-auto text-xs">
            Phiên #{car.auctionSession.sessionNumber}
          </Badge>
        )}
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Còn lại:</span>
        <span className="font-bold text-foreground">{formatCountdown(countdown)}</span>
      </div>

      {/* Starting price */}
      <div className="bg-secondary/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">Giá khởi điểm</p>
        <p className="font-display font-bold text-foreground">{formatPrice(car.price)} ₫</p>
      </div>

      {/* Highest bid */}
      <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-accent" />
          <p className="text-xs text-accent font-medium">Giá cao nhất hiện tại</p>
        </div>
        <p className="font-display text-xl font-bold text-accent">{formatPrice(highestBid)} ₫</p>
      </div>

      {!isOwnerViewingOwnCar && (
        <>
          {/* Bid slider */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Trả thêm</p>
            <div className="space-y-3">
              <Slider
                min={1}
                max={50}
                step={1}
                value={[sliderValue]}
                onValueChange={([v]) => setBidAmount(v * 1000000)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Giá trả thêm: <span className="font-semibold text-foreground">{formatPrice(bidAmount)} ₫</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Giá trả: <span className="font-semibold text-foreground">{formatPrice(highestBid + bidAmount)} ₫</span>
            </p>
          </div>

          {/* Bid button */}
          <Button
            className="w-full gradient-accent text-white gap-2"
            size="lg"
            disabled={isSubmitting || countdown <= 0 || isBlockedByConsecutiveBid}
            onClick={handleBid}
          >
            <Gavel className="h-4 w-4" />
            {isSubmitting ? 'Đang gửi trả giá...' : 'Trả giá'}
          </Button>

          {isBlockedByConsecutiveBid && countdown > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Không thể trả giá liên tiếp 2 lần.
            </p>
          )}
        </>
      )}

      {isOwnerViewingOwnCar && (
        <p className="text-xs text-muted-foreground text-center">
          Đây là xe bạn đăng bán. Bạn chỉ có thể xem giá hiện tại và lịch sử bidder.
        </p>
      )}

      {/* Bid History */}
      <BidHistory bids={bids} />
    </div>
  );
};

export default AuctionPanel;
