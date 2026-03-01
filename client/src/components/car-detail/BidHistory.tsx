import type { IBid } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

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

function timeAgo(d: Date) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return `${Math.floor(diff / 1440)} ngày trước`;
}

const BidHistory = ({ bids }: { bids: IBid[] }) => {
  const sorted = [...bids].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <h4 className="font-display font-semibold text-foreground mb-3 text-sm">Lịch sử trả giá</h4>
      <ScrollArea className="h-48">
        <div className="space-y-2 pr-2">
          {sorted.map((bid, i) => (
            <div key={bid._id} className={`flex items-center justify-between p-2 rounded-lg text-xs ${i === 0 ? 'bg-accent/10 border border-accent/20' : 'bg-secondary/50'}`}>
              <div>
                <span className="font-medium text-foreground">{redactName(bid.bidderName)}</span>
                <span className="text-muted-foreground ml-2">{timeAgo(bid.timestamp)}</span>
              </div>
              <span className="font-bold text-foreground">{formatPrice(bid.amount)} ₫</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BidHistory;
