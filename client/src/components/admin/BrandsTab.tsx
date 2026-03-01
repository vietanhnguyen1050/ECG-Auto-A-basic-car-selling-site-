import { useEffect, useMemo, useState } from 'react';
import BrandColumnManager from './BrandColumnManager';
import BrandDetailPanel from './BrandDetailPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import type { ICarModelData } from '@/types';
import { adminApi } from '@/services/api';

function tierToSegment(tier: unknown): 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'tier-5' {
  const numericTier = Number(tier);
  if (numericTier === 1) return 'tier-1';
  if (numericTier === 2) return 'tier-2';
  if (numericTier === 3) return 'tier-3';
  if (numericTier === 4) return 'tier-4';
  if (numericTier === 5) return 'tier-5';
  return 'tier-3';
}

function segmentToTier(segment: unknown): number {
  if (segment === 'tier-1') return 1;
  if (segment === 'tier-2') return 2;
  if (segment === 'tier-3') return 3;
  if (segment === 'tier-4') return 4;
  if (segment === 'tier-5') return 5;
  if (segment === 'luxury') return 5;
  return 1;
}

export interface BrandSelection {
  brandIdx: number | null;
  modelIdx: number | null;
  versionIdx: number | null;
  yearIdx: number | null;
}

const BrandsTab = () => {
  const [data, setData] = useState<ICarModelData[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState('[]');
  const [sel, setSel] = useState<BrandSelection>({ brandIdx: null, modelIdx: null, versionIdx: null, yearIdx: null });

  const hasUnsavedChanges = useMemo(() => JSON.stringify(data) !== savedSnapshot, [data, savedSnapshot]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brands = await adminApi.getBrands();
        const mapped = (brands ?? []).map((brand: any) => ({
          _id: brand._id,
          brand: brand.brand,
          active: brand.activation ?? true,
          models: (brand.models ?? []).map((model: any) => ({
            name: model.model,
            type: model.type,
            active: model.activation ?? true,
            versions: (model.versions ?? []).map((version: any) => ({
              name: version.version,
              fuelType:
                version.fuel === 'petrol' ||
                version.fuel === 'diesel' ||
                version.fuel === 'electric' ||
                version.fuel === 'hybrid'
                  ? version.fuel
                  : 'petrol',
              active: version.activation ?? true,
              yearData: (version.years ?? []).map((year: any) => ({
                year: Number(year.year),
                basePrice: Number(year.originalprice ?? 0),
                active: year.activation ?? true,
                transmission:
                  year.transmission === 'manual' || year.transmission === 'automatic'
                    ? year.transmission
                    : 'automatic',
                fuelType:
                  version.fuel === 'petrol' ||
                  version.fuel === 'diesel' ||
                  version.fuel === 'electric' ||
                  version.fuel === 'hybrid'
                    ? version.fuel
                    : 'petrol',
                segment: tierToSegment(year.tier),
              })),
            })),
          })),
        }));
        setData(mapped);
        setSavedSnapshot(JSON.stringify(mapped));
      } catch (error: any) {
        toast({
          title: 'Không tải được danh sách brand',
          description: error?.response?.data?.message || 'Vui lòng thử lại.',
          variant: 'destructive',
        });
      }
    };

    fetchBrands();
  }, []);

  const handleSave = async () => {
    try {
      const toPayload = (brand: any) => ({
        brand: brand.brand,
        activation: brand.active ?? true,
        models: (brand.models ?? []).map((model: any) => ({
          activation: model.active ?? true,
          model: model.name,
          type: model.type || 'Unknown',
          versions: (model.versions ?? []).map((version: any) => ({
            activation: version.active ?? true,
            version: version.name,
            fuel: version.fuelType || version.yearData?.[0]?.fuelType || 'petrol',
            years: (version.yearData ?? []).map((year: any) => ({
              activation: year.active ?? true,
              year: String(year.year),
              transmission: year.transmission,
              tier: segmentToTier(year.segment),
              originalprice: Number(year.basePrice || 0),
            })),
          })),
        })),
      });

      const saveResults = await Promise.all(
        data.map(async (brand: any, index: number) => {
          const payload = toPayload(brand);
          if (brand._id) {
            const result = await adminApi.updateBrand(brand._id, payload);
            return { index, brand: result.brand };
          }
          const created = await adminApi.createBrand(payload);
          return { index, brand: created.brand };
        }),
      );

      const updatedData = data.map((brand, index) => {
          const saved = saveResults.find((item) => item.index === index);
          return saved ? { ...brand, _id: saved.brand?._id || brand._id } : brand;
        });

      setData(updatedData);
      setSavedSnapshot(JSON.stringify(updatedData));

      toast({ title: 'Đã lưu', description: 'Tất cả thay đổi đã được lưu vào backend.' });
    } catch (error: any) {
      toast({
        title: 'Lưu thất bại',
        description: error?.response?.data?.message || 'Vui lòng kiểm tra dữ liệu và thử lại.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto">
        <BrandColumnManager data={data} setData={setData} sel={sel} setSel={setSel} />
        <BrandDetailPanel data={data} setData={setData} sel={sel} />
      </div>
      <div className="flex justify-end items-center gap-3">
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
            Unsaved changes
          </Badge>
        )}
        <Button onClick={handleSave} className="gradient-accent text-white" size="lg" disabled={!hasUnsavedChanges}>
          Lưu tất cả thay đổi
        </Button>
      </div>
    </div>
  );
};

export default BrandsTab;
