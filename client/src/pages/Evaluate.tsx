import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import CarModelSelector from '@/components/sell/CarModelSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';
import { carsApi } from '@/services/api';
import type { ICarModelData } from '@/types';
import { useToast } from '@/hooks/use-toast';

const CONDITION_OPTIONS = [
  { value: '1', label: 'Kém' },
  { value: '2', label: 'Trung bình thấp' },
  { value: '3', label: 'Trung bình' },
  { value: '4', label: 'Tốt' },
  { value: '5', label: 'Rất tốt' },
];

function formatVND(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
  return (n / 1_000_000).toFixed(0) + ' triệu';
}

const Evaluate = () => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [catalog, setCatalog] = useState<ICarModelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const brands = await carsApi.getBrandCatalog();
        const mapped: ICarModelData[] = (brands ?? [])
          .filter((brand: any) => brand?.activation !== false)
          .map((brand: any) => ({
            _id: brand._id,
            brand: brand.brand,
            active: brand.activation ?? true,
            models: (brand.models ?? [])
              .filter((model: any) => model?.activation !== false)
              .map((model: any) => ({
                name: model.model,
                type: model.type,
                active: model.activation ?? true,
                versions: (model.versions ?? [])
                  .filter((version: any) => version?.activation !== false)
                  .map((version: any) => ({
                    name: version.version,
                    fuelType: version.fuel,
                    active: version.activation ?? true,
                    yearData: (version.years ?? [])
                      .filter((year: any) => year?.activation !== false)
                      .map((year: any) => ({
                        year: Number(year.year),
                        basePrice: Number(year.originalprice || 0),
                        transmission:
                          year.transmission === 'manual' || year.transmission === 'automatic'
                            ? year.transmission
                            : 'automatic',
                        fuelType:
                          version.fuel === 'diesel' || version.fuel === 'electric' || version.fuel === 'hybrid'
                            ? version.fuel
                            : 'petrol',
                        segment: 'tier-3',
                        active: year.activation ?? true,
                      })),
                  })),
              })),
          }));

        setCatalog(mapped);
      } catch (error: any) {
        toast({
          title: 'Không tải được dữ liệu định giá',
          description: error?.response?.data?.message || 'Vui lòng thử lại sau.',
          variant: 'destructive',
        });
      }
    };

    fetchCatalog();
  }, [toast]);

  const canEvaluate = useMemo(() => {
    return brand && model && version && year && mileage && Number(mileage) > 0 && condition;
  }, [brand, model, version, year, mileage, condition]);

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMileage(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleEvaluate = async () => {
    if (!canEvaluate) return;

    try {
      setIsLoading(true);
      const response = await carsApi.evaluate({
        model: {
          brand,
          model,
          version,
          year,
        },
        car: {
          condition: Number(condition),
          mileage: Number(mileage),
        },
      });
      setResult(Number(response.price));
    } catch (error: any) {
      toast({
        title: 'Định giá thất bại',
        description: error?.response?.data?.message || 'Vui lòng kiểm tra lại thông tin xe.',
        variant: 'destructive',
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return ( 
    <Layout>
      <section className="py-8">
        <div className="container max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Định giá xe</h1>
          <div className="bg-card rounded-xl border border-border p-5 space-y-6">
            <CarModelSelector
              brand={brand}
              setBrand={setBrand}
              model={model}
              setModel={setModel}
              version={version}
              setVersion={setVersion}
              year={year}
              setYear={setYear}
              options={catalog}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Số km đã đi</Label>
                <Input type="text" inputMode="numeric" placeholder="VD: 30000" value={mileage} onChange={handleMileageChange} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Tình trạng xe</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn tình trạng" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {CONDITION_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleEvaluate} disabled={!canEvaluate || isLoading} size="lg" className="w-full gradient-accent text-white gap-2">
              <BarChart3 className="h-5 w-5" /> {isLoading ? 'Đang định giá...' : 'Định giá xe'}
            </Button>
          </div>
          {result !== null && (
            <div className="mt-6 bg-card rounded-xl border border-accent/30 p-6 text-center shadow-accent">
              <p className="text-muted-foreground text-sm mb-1">Giá trị ước tính</p>
              <p className="font-display text-3xl font-bold text-accent">{formatVND(result)} ₫</p>
              <p className="text-muted-foreground text-xs mt-2">* Đây là giá trị tham khảo dựa trên thuật toán ước tính</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Evaluate;
