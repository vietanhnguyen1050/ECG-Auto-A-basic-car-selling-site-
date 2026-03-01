import { MapPin, Gauge, Fuel, Settings, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ICar } from '@/types';

function redactName(name: string) {
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  return parts.map((p) => p[0] + '***').join(' ');
}

const FUEL_LABELS: Record<string, string> = { petrol: 'Xăng', diesel: 'Dầu', electric: 'Điện', hybrid: 'Hybrid' };
const BODY_LABELS: Record<string, string> = { sedan: 'Sedan', suv: 'SUV', hatchback: 'Hatchback', coupe: 'Coupe', truck: 'Bán tải', van: 'Van' };
const CONDITION_LABELS: Record<string, string> = { excellent: 'Rất tốt', good: 'Tốt', average: 'Trung bình', poor: 'Kém', bad: 'Tệ' };

const CarInfo = ({ car }: { car: ICar }) => {
  const specs = [
    { icon: Gauge, label: 'Số km', value: `${car.mileage.toLocaleString('vi-VN')} km` },
    { icon: Fuel, label: 'Nhiên liệu', value: FUEL_LABELS[car.fuelType] || car.fuelType },
    { icon: Settings, label: 'Hộp số', value: car.transmission === 'automatic' ? 'Tự động' : 'Số sàn' },
    { icon: Car, label: 'Dòng xe', value: BODY_LABELS[car.bodyType] || car.bodyType },
    { icon: MapPin, label: 'Vị trí', value: car.location },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{car.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <span>{car.brand} · {car.model}{car.version ? ` · ${car.version}` : ''} · {car.year}</span>
          {car.condition && <Badge variant="secondary" className="text-xs">{CONDITION_LABELS[car.condition]}</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{car.location}</span>
        <span className="mx-1">·</span>
        <span>Người bán: {redactName(car.sellerName)}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {specs.map((s) => (
          <div key={s.label} className="bg-secondary/50 rounded-lg p-3 flex items-center gap-2">
            <s.icon className="h-4 w-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-medium text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {car.description && (
        <div>
          <h3 className="font-display font-semibold text-foreground mb-2">Mô tả</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{car.description}</p>
        </div>
      )}
    </div>
  );
};

export default CarInfo;
