import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ICarModelData, IYearData } from '@/types';
import type { BrandSelection } from './BrandsTab';

interface Props {
  data: ICarModelData[];
  setData: React.Dispatch<React.SetStateAction<ICarModelData[]>>;
  sel: BrandSelection;
}

const BrandDetailPanel = ({ data, setData, sel }: Props) => {
  if (sel.brandIdx === null || sel.modelIdx === null || sel.versionIdx === null || sel.yearIdx === null) {
    return (
      <div className="flex-1 min-w-[280px] bg-card rounded-xl border border-border p-6 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Chọn Brand → Model → Version → Year để xem chi tiết</p>
      </div>
    );
  }

  const brand = data[sel.brandIdx];
  const model = brand.models[sel.modelIdx];
  const version = model.versions[sel.versionIdx];
  const yearData = version.yearData[sel.yearIdx];

  if (!yearData) {
    return (
      <div className="flex-1 min-w-[280px] bg-card rounded-xl border border-border p-6 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Dữ liệu năm không tồn tại</p>
      </div>
    );
  }

  const updateYearData = (patch: Partial<IYearData>) => {
    setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
      ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? {
        ...m, versions: m.versions.map((v, vi) => vi === sel.versionIdx ? {
          ...v, yearData: v.yearData.map((yd, yi) => yi === sel.yearIdx ? { ...yd, ...patch } : yd)
        } : v)
      } : m)
    } : b));
  };

  const updateVersionData = (patch: Partial<{ fuelType: IYearData['fuelType'] }>) => {
    setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
      ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? {
        ...m, versions: m.versions.map((v, vi) => vi === sel.versionIdx ? { ...v, ...patch } : v)
      } : m)
    } : b));
  };

  const updateModelData = (patch: Partial<{ type: string }>) => {
    setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
      ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? { ...m, ...patch } : m)
    } : b));
  };

  return (
    <div className="flex-1 min-w-[280px] bg-card rounded-xl border border-border p-6 space-y-4">
      <h4 className="font-display font-semibold text-foreground">
        {brand.brand} · {model.name} · {version.name} · {yearData.year}
      </h4>
      <p className="text-xs text-muted-foreground">Mỗi năm có thông số kỹ thuật riêng biệt · Activation: {yearData.active ?? true ? 'On' : 'Off'}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Hộp số</Label>
          <Select value={yearData.transmission} onValueChange={v => updateYearData({ transmission: v as IYearData['transmission'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Tự động</SelectItem>
              <SelectItem value="manual">Số sàn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Nhiên liệu</Label>
          <Select value={(version.fuelType || yearData.fuelType)} onValueChange={v => updateVersionData({ fuelType: v as IYearData['fuelType'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Xăng</SelectItem>
              <SelectItem value="diesel">Dầu</SelectItem>
              <SelectItem value="electric">Điện</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Phân khúc</Label>
          <Select value={yearData.segment} onValueChange={v => updateYearData({ segment: v as IYearData['segment'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tier-1">Bậc 1 · Phổ thông</SelectItem>
              <SelectItem value="tier-2">Bậc 2 · Trung cấp thấp</SelectItem>
              <SelectItem value="tier-3">Bậc 3 · Trung cấp</SelectItem>
              <SelectItem value="tier-4">Bậc 4 · Cận cao cấp</SelectItem>
              <SelectItem value="tier-5">Bậc 5 · Sang trọng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Input
            value={model.type || ''}
            onChange={e => updateModelData({ type: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Giá gốc (VNĐ)</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={yearData.basePrice}
            onChange={e => {
              const v = Number(e.target.value.replace(/[^0-9]/g, ''));
              updateYearData({ basePrice: v });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandDetailPanel;
