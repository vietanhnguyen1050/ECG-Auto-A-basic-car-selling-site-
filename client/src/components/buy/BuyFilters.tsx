import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const LOCATIONS = ['Hanoi', 'Ho Chi Minh City', 'Da Nang'];

interface BuyFiltersProps {
  brands: string[];
  brand: string;
  setBrand: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  auctionFilter: 'all' | 'auction';
  setAuctionFilter: (v: 'all' | 'auction') => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  onClear: () => void;
}

const BuyFilters = ({
  brands,
  brand, setBrand,
  location, setLocation,
  auctionFilter, setAuctionFilter,
  maxPrice, setMaxPrice,
  onClear,
}: BuyFiltersProps) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-5">
      <div className="bg-card rounded-xl border border-border p-5 shadow-soft space-y-5">
        <h3 className="font-display font-semibold text-foreground">Bộ lọc</h3>

        {/* Brand */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Hãng xe</Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Tất cả hãng" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">Tất cả hãng</SelectItem>
                {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Khu vực</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Tất cả khu vực" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Trạng thái đấu giá</Label>
            <Select value={auctionFilter} onValueChange={(v) => setAuctionFilter(v as 'all' | 'auction')}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="auction">Đang đấu giá</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
        <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Giá tối đa (VNĐ)</Label>
            <Input type="number" placeholder="VD: 1000000000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="bg-background" />
        </div>

        <Button variant="outline" size="sm" className="w-full gap-1" onClick={onClear}>
          <X className="h-3.5 w-3.5" /> Xoá bộ lọc
        </Button>
      </div>
    </aside>
  );
};

export default BuyFilters;
