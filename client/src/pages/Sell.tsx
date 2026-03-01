import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import CarModelSelector from '@/components/sell/CarModelSelector';
import LicensePlatePreview from '@/components/sell/LicensePlatePreview';
import ImageUploader from '@/components/sell/ImageUploader';
import AuthGate from '@/components/shared/AuthGate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { carsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { ICarModelData } from '@/types';

const CONDITION_OPTIONS = [
  { value: '5', label: 'Rất tốt' },
  { value: '4', label: 'Tốt' },
  { value: '3', label: 'Trung bình' },
  { value: '2', label: 'Kém' },
  { value: '1', label: 'Tệ' },
];

const PLATE_OPTIONS = [
  { value: 'white', code: 1, label: 'Biển trắng', requirePlateNumber: true },
  { value: 'yellow', code: 2, label: 'Biển vàng', requirePlateNumber: true },
  { value: 'blue', code: 3, label: 'Biển xanh', requirePlateNumber: true },
  { value: 'red', code: 4, label: 'Biển đỏ', requirePlateNumber: true },
  { value: 'foreign', code: 5, label: 'Nước ngoài', requirePlateNumber: true },
  { value: 'none', code: 6, label: 'Không có biển', requirePlateNumber: false },
] as const;

const LOCATION_OPTIONS = [
  { value: 'Hanoi', label: 'Hà Nội' },
  { value: 'Ho Chi Minh City', label: 'TP.HCM' },
  { value: 'Da Nang', label: 'Đà Nẵng' },
] as const;

type SellFormErrors = Partial<Record<
  'brand' | 'model' | 'version' | 'year' | 'mileage' | 'condition' | 'plateType' | 'plateNumber' | 'location' | 'description' | 'images',
  string
>>;

function normalizeFuelType(value?: string): 'petrol' | 'diesel' | 'electric' | 'hybrid' {
  const normalized = value?.toLowerCase();
  if (normalized === 'diesel' || normalized === 'electric' || normalized === 'hybrid' || normalized === 'petrol') {
    return normalized;
  }
  return 'petrol';
}

function normalizeTransmission(value?: string): 'manual' | 'automatic' {
  return value?.toLowerCase() === 'manual' ? 'manual' : 'automatic';
}

function mapBrandCatalogToModelData(catalog: any[]): ICarModelData[] {
  const tierToSegment = (tier?: number): 'standard' | 'luxury' | 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'tier-5' => {
    if (tier && tier >= 1 && tier <= 5) return `tier-${tier}` as 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'tier-5';
    return 'standard';
  };

  return (catalog ?? [])
    .filter((brand) => brand?.activation !== false && brand?.brand)
    .map((brand) => ({
      _id: brand?._id,
      brand: brand.brand,
      active: brand.activation,
      models: (brand.models ?? [])
        .filter((model: any) => model?.activation !== false && model?.model)
        .map((model: any) => ({
          name: model.model,
          type: model.type,
          active: model.activation,
          versions: (model.versions ?? [])
            .filter((version: any) => version?.activation !== false && version?.version)
            .map((version: any) => ({
              name: version.version,
              fuelType: normalizeFuelType(version.fuel),
              active: version.activation,
              yearData: (version.years ?? [])
                .filter((yearData: any) => yearData?.activation !== false && yearData?.year)
                .map((yearData: any) => ({
                  year: Number(yearData.year || 0),
                  basePrice: Number(yearData.originalprice || 0),
                  transmission: normalizeTransmission(yearData.transmission),
                  fuelType: normalizeFuelType(version.fuel),
                  segment: tierToSegment(Number(yearData.tier)),
                  active: yearData.activation,
                })),
            })),
        })),
    }));
}

const Sell = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [modelOptions, setModelOptions] = useState<ICarModelData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatedPrice, setEvaluatedPrice] = useState<number | null>(null);
  const [evaluateError, setEvaluateError] = useState<string | null>(null);
  const [errors, setErrors] = useState<SellFormErrors>({});
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');
  const [plateType, setPlateType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const plateOption = useMemo(
    () => PLATE_OPTIONS.find((option) => option.value === plateType),
    [plateType],
  );

  useEffect(() => {
    const fetchBrandCatalog = async () => {
      try {
        const catalog = await carsApi.getBrandCatalog();
        setModelOptions(mapBrandCatalogToModelData(catalog));
      } catch {
        setModelOptions([]);
      }
    };

    fetchBrandCatalog();
  }, []);

  useEffect(() => {
    const mileageNumber = Number(mileage);
    const conditionNumber = Number(condition);

    const canEvaluate =
      Boolean(brand && model && version && year) &&
      Number.isFinite(mileageNumber) && mileageNumber > 0 &&
      Number.isFinite(conditionNumber) && conditionNumber >= 1 && conditionNumber <= 5;

    if (!canEvaluate) {
      setEvaluatedPrice(null);
      setEvaluateError(null);
      setIsEvaluating(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsEvaluating(true);
        setEvaluateError(null);
        const result = await carsApi.evaluate({
          model: { brand, model, version, year },
          car: { condition: conditionNumber, mileage: mileageNumber },
        });
        setEvaluatedPrice(Number(result?.price || 0));
      } catch (error: any) {
        setEvaluatedPrice(null);
        setEvaluateError(error?.response?.data?.message || 'Không thể định giá tự động.');
      } finally {
        setIsEvaluating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [brand, model, version, year, condition, mileage]);

  const validateForm = (): SellFormErrors => {
    const nextErrors: SellFormErrors = {};
    const plateRegex = /^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{1,4}-(\d{4}|\d{5}|\d{3}\.\d{2})$/;

    if (!brand) nextErrors.brand = 'Vui lòng chọn hãng xe';
    if (!model) nextErrors.model = 'Vui lòng chọn dòng xe';
    if (!version) nextErrors.version = 'Vui lòng chọn phiên bản';
    if (!year) nextErrors.year = 'Vui lòng chọn năm sản xuất';

    const mileageNumber = Number(mileage);
    if (!mileage || Number.isNaN(mileageNumber) || mileageNumber <= 0) {
      nextErrors.mileage = 'Số km phải lớn hơn 0';
    }

    if (!condition) nextErrors.condition = 'Vui lòng chọn tình trạng xe';
    if (!plateType) nextErrors.plateType = 'Vui lòng chọn loại biển';
    if (!location) nextErrors.location = 'Vui lòng chọn khu vực';

    const normalizedPlateNumber = plateNumber.trim().toUpperCase();
    if (plateOption?.requirePlateNumber) {
      if (!normalizedPlateNumber) {
        nextErrors.plateNumber = 'Vui lòng nhập biển số';
      } else if (!plateRegex.test(normalizedPlateNumber)) {
        nextErrors.plateNumber = 'Biển số không hợp lệ (ví dụ: 30A-123.45, 30A-1234 hoặc 30A-12345)';
      }
    }

    const normalizedDescription = description.trim();
    if (!normalizedDescription) {
      nextErrors.description = 'Vui lòng nhập mô tả xe';
    } else if (normalizedDescription.length > 1000) {
      nextErrors.description = 'Mô tả không được quá 1000 ký tự';
    }

    if (images.length === 0) {
      nextErrors.images = 'Vui lòng tải lên ít nhất 1 ảnh';
    } else if (images.length > 5) {
      nextErrors.images = 'Chỉ được tải lên tối đa 5 ảnh';
    } else if (images.some((file) => !file.type.startsWith('image/'))) {
      nextErrors.images = 'Chỉ chấp nhận tệp ảnh';
    } else if (images.some((file) => file.size > 5 * 1024 * 1024)) {
      nextErrors.images = 'Mỗi ảnh phải nhỏ hơn 5MB';
    }

    return nextErrors;
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setMileage(val);
    setErrors((prev) => ({ ...prev, mileage: undefined }));
  };

  const handlePlateNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9.-]/g, '')
      .slice(0, 12);
    setPlateNumber(formatted);
    setErrors((prev) => ({ ...prev, plateNumber: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast({
        title: 'Thông tin chưa hợp lệ',
        description: 'Vui lòng kiểm tra lại các trường bắt buộc.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?._id || !plateOption) {
      toast({
        title: 'Không thể gửi tin đăng',
        description: 'Vui lòng đăng nhập lại và thử lại.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        model: {
          brand,
          model,
          version,
          year,
        },
        car: {
          mileage: Number(mileage),
          condition: Number(condition),
          platecolor: plateOption.code,
          platenumber: plateOption.requirePlateNumber ? plateNumber.trim().toUpperCase() : '',
          description: description.trim(),
          location: location as 'Hanoi' | 'Ho Chi Minh City' | 'Da Nang',
        },
      };

      await carsApi.create(payload, images);
      toast({ title: 'Đã gửi tin đăng bán', description: 'Tin của bạn sẽ được duyệt trong 24h.' });

      setBrand('');
      setModel('');
      setVersion('');
      setYear('');
      setMileage('');
      setCondition('');
      setPlateType('');
      setPlateNumber('');
      setLocation('');
      setDescription('');
      setImages([]);
      setErrors({});
    } catch (error: any) {
      const backendErrors = error?.response?.data?.errors;
      const backendMessage = Array.isArray(backendErrors) && backendErrors.length > 0
        ? String(backendErrors[0])
        : error?.response?.data?.message;
      toast({
        title: 'Gửi tin đăng thất bại',
        description: backendMessage || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-8">
        <div className="container max-w-3xl">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Đăng tin bán xe</h1>

          <AuthGate message="Vui lòng đăng nhập để đăng tin bán xe">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Car model */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h2 className="font-display font-semibold text-foreground">Mẫu xe</h2>
                <CarModelSelector brand={brand} setBrand={setBrand} model={model} setModel={setModel} version={version} setVersion={setVersion} year={year} setYear={setYear} options={modelOptions} />
                {(errors.brand || errors.model || errors.version || errors.year) && (
                  <p className="text-xs text-destructive">{errors.brand || errors.model || errors.version || errors.year}</p>
                )}
              </div>

              {/* Car info */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h2 className="font-display font-semibold text-foreground">Thông tin xe</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Số km đã đi *</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 30000"
                      value={mileage}
                      onChange={handleMileageChange}
                      className="bg-background"
                    />
                    {mileage && Number(mileage) <= 0 && (
                      <p className="text-xs text-destructive">Số km phải lớn hơn 0</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Tình trạng xe *</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn tình trạng" /></SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {CONDITION_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
                  </div>
                </div>
              </div>

              {/* License plate */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h2 className="font-display font-semibold text-foreground">Biển số xe</h2>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs">Loại biển</Label>
                        <Select value={plateType} onValueChange={setPlateType}>
                          <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn loại biển" /></SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {PLATE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {errors.plateType && <p className="text-xs text-destructive">{errors.plateType}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs">Biển số</Label>
                        <Input
                          placeholder="VD: 30A-123.45"
                          value={plateNumber}
                          onChange={handlePlateNumberChange}
                          maxLength={12}
                          className="bg-background"
                        />
                        {errors.plateNumber && <p className="text-xs text-destructive">{errors.plateNumber}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center pt-5">
                    <LicensePlatePreview plateType={plateType} plateNumber={plateNumber} />
                  </div>
                </div>
              </div>

              {/* Additional info */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h2 className="font-display font-semibold text-foreground">Thông tin thêm</h2>

                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">Giá xe dự kiến bán (tự động)</p>
                  {isEvaluating ? (
                    <p className="text-sm text-muted-foreground mt-1">Đang tính giá...</p>
                  ) : evaluateError ? (
                    <p className="text-sm text-destructive mt-1">{evaluateError}</p>
                  ) : evaluatedPrice !== null ? (
                    <p className="font-display font-bold text-foreground mt-1">{evaluatedPrice.toLocaleString('vi-VN')} ₫</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">Điền đủ hãng, dòng, phiên bản, năm, số km và tình trạng để xem giá.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Khu vực *</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn thành phố" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {LOCATION_OPTIONS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Mô tả</Label>
                  <Textarea placeholder="Mô tả chi tiết về xe..." value={description} onChange={e => { setDescription(e.target.value); setErrors((prev) => ({ ...prev, description: undefined })); }} className="bg-background min-h-[100px]" />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Ảnh xe (tối đa 5) *</Label>
                  <ImageUploader images={images} setImages={(next) => { setImages(next); setErrors((prev) => ({ ...prev, images: undefined })); }} max={5} />
                  {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-accent text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi tin...' : 'Đăng tin bán xe'}
              </Button>
            </form>
          </AuthGate>
        </div>
      </section>
    </Layout>
  );
};

export default Sell;
