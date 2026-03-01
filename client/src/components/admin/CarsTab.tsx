import { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Edit, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ICar } from '@/types';
import { adminApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const CAR_PROGRESS_OPTIONS = [
  'Pending verification',
  'Verified',
  'In auction',
  'Finished auction',
  'Verifying bidders',
  'Setting up legal documents',
  'Sold',
  'Rejected',
  'Cancel request',
  'Cancelled',
] as const;

const LOCATION_OPTIONS = ['Hanoi', 'Ho Chi Minh City', 'Da Nang'] as const;

const PLATE_COLOR_OPTIONS = [
  { code: 1, label: 'White' },
  { code: 2, label: 'Yellow' },
  { code: 3, label: 'Blue' },
  { code: 4, label: 'Red' },
  { code: 5, label: 'Foreign' },
  { code: 6, label: 'No plate' },
] as const;

const NON_EDITABLE_PROGRESS: CarProgress[] = ['Sold', 'Cancelled', 'Rejected', 'Cancel request'];
const AUCTION_STARTABLE_PROGRESS: CarProgress[] = ['Verified', 'Finished auction', 'Verifying bidders'];

type CarProgress = (typeof CAR_PROGRESS_OPTIONS)[number];
type AdminBidder = {
  id: string;
  userId: string;
  displayname: string;
  email: string;
  phonenumber: string;
  amount: number;
  time: string;
};

type AdminBrand = {
  brand: string;
  activation: boolean;
  models: {
    activation: boolean;
    model: string;
    type: string;
    versions: {
      activation: boolean;
      version: string;
      fuel: string;
      years: {
        activation: boolean;
        year: string;
        transmission: string;
        tier: number;
      }[];
    }[];
  }[];
};

type AdminCar = Omit<ICar, 'status'> & {
  status: CarProgress;
  sellerPhone: string;
  sellerEmail: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  plateColorCode: number;
  plateTypeLabel: string;
  modelType: string;
  modelFuel: string;
  modelTransmission: string;
  modelTier?: number;
  sessionEndTime?: string | null;
  auctioncounter: number;
  bidders: AdminBidder[];
};

function normalizeFuelType(value: string): ICar['fuelType'] {
  const normalized = value?.toLowerCase();
  if (normalized === 'diesel' || normalized === 'electric' || normalized === 'hybrid' || normalized === 'petrol') {
    return normalized;
  }
  return 'petrol';
}

function normalizeTransmission(value: string): ICar['transmission'] {
  const normalized = value?.toLowerCase();
  return normalized === 'manual' ? 'manual' : 'automatic';
}

function getPlateColorLabel(code: number) {
  return PLATE_COLOR_OPTIONS.find((item) => item.code === code)?.label ?? 'Unknown';
}

function buildCarTitle(brand?: string, model?: string, version?: string, year?: number | string) {
  return `${brand || ''} ${model || ''} ${version || ''} ${year || ''}`.trim();
}

function buildDefaultAuctionEndDateTime() {
  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 30 * 60 * 1000);
  const date = defaultEnd.toISOString().slice(0, 10);
  const time = defaultEnd.toTimeString().slice(0, 5);
  return { date, time };
}

function formatCountdown(ms: number) {
  if (ms <= 0) return 'Đã kết thúc';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN');
}

function mapAdminCar(item: any): AdminCar {
  const modelYear = Number(item?.model?.year || 0);
  const plateColorCode = Number(item?.car?.platecolor || 1);
  const sellerDisplay = item?.car?.seller?.displayname || item?.car?.seller?.email || 'Unknown';
  const sellerPhone = item?.car?.seller?.phonenumber || '';
  const sellerEmail = item?.car?.seller?.email || '';
  const buyerId = String(item?.car?.buyer?._id || item?.car?.buyer || '');
  const buyerDisplay = item?.car?.buyer?.displayname || item?.car?.buyer?.email || '';
  const buyerPhone = item?.car?.buyer?.phonenumber || '';
  const buyerEmail = item?.car?.buyer?.email || '';
  const progress = CAR_PROGRESS_OPTIONS.includes(item?.progress)
    ? item.progress
    : 'Pending verification';
  const bidders: AdminBidder[] = (item?.bid?.bidders ?? []).map((bid: any, index: number) => ({
    id: String(bid?._id ?? `${bid?.userid?._id ?? bid?.userid ?? 'bid'}-${index}`),
    userId: String(bid?.userid?._id ?? bid?.userid ?? ''),
    displayname: bid?.userid?.displayname || bid?.displayname || bid?.userid?.email || 'Ẩn danh',
    email: bid?.userid?.email || bid?.email || '',
    phonenumber: bid?.userid?.phonenumber || bid?.phonenumber || '',
    amount: Number(bid?.amount ?? bid?.currentprice ?? bid?.price ?? 0),
    time: bid?.time ? new Date(bid.time).toISOString() : new Date().toISOString(),
  }));

  return {
    _id: item._id,
    title: buildCarTitle(item?.model?.brand, item?.model?.model, item?.model?.version, item?.model?.year),
    brand: item?.model?.brand || '',
    model: item?.model?.model || '',
    version: item?.model?.version || '',
    year: Number.isFinite(modelYear) ? modelYear : 0,
    price: Number(item?.car?.startingprice || 0),
    mileage: Number(item?.car?.mileage || 0),
    fuelType: normalizeFuelType(item?.model?.fuel || 'petrol'),
    transmission: normalizeTransmission(item?.model?.transmission || 'automatic'),
    bodyType: 'sedan',
    color: '',
    description: item?.car?.description || '',
    images: item?.car?.images || [],
    features: [],
    seller: item?.car?.seller || '',
    sellerName: sellerDisplay,
    sellerPhone,
    sellerEmail,
    buyerId,
    buyerName: buyerDisplay,
    buyerPhone,
    buyerEmail,
    location: item?.car?.location || '',
    plateType: getPlateColorLabel(plateColorCode),
    plateColorCode,
    plateTypeLabel: item?.car?.platecolorLabel || getPlateColorLabel(plateColorCode),
    plateNumber: item?.car?.platenumber || '',
    status: progress,
    modelType: item?.model?.type || '',
    modelFuel: item?.model?.fuel || '',
    modelTransmission: item?.model?.transmission || '',
    modelTier: item?.model?.tier,
    auctionStatus: progress === 'In auction' ? 'auction' : 'normal',
    currentBid: item?.bid?.currentprice || undefined,
    sessionEndTime: item?.bid?.auctionSessionEndTime || null,
    auctioncounter: Number(item?.bid?.auctioncounter || 0),
    bidders,
    createdAt: new Date(item?.car?.posteddate || Date.now()),
    updatedAt: new Date(item?.updatedAt || Date.now()),
  };
}

function formatPrice(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN');
}

const STATUS_COLORS: Record<CarProgress, string> = {
  'Pending verification': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'In auction': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Finished auction': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Verifying bidders': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Setting up legal documents': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Sold: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Cancel request': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cancelled: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400',
};

const CarsTab = () => {
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editCar, setEditCar] = useState<AdminCar | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminCar>>({});
  const [auctionEndDate, setAuctionEndDate] = useState(buildDefaultAuctionEndDateTime().date);
  const [auctionEndTime, setAuctionEndTime] = useState(buildDefaultAuctionEndDateTime().time);
  const [isStartingAuction, setIsStartingAuction] = useState(false);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const id = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [carData, brandData] = await Promise.all([adminApi.getCars(), adminApi.getBrands()]);
        setCars((carData ?? []).map((item: any) => mapAdminCar(item)));
        setBrands((brandData ?? []) as AdminBrand[]);
      } catch (error: any) {
        toast({
          title: 'Không tải được dữ liệu admin',
          description: error?.response?.data?.message || 'Vui lòng thử lại.',
          variant: 'destructive',
        });
      }
    };

    fetchInitialData();
  }, [toast]);

  const selectedBrand = useMemo(
    () => brands.find((item) => item.brand === editForm.brand),
    [brands, editForm.brand],
  );

  const modelOptions = useMemo(
    () => selectedBrand?.models ?? [],
    [selectedBrand],
  );

  const selectedModel = useMemo(
    () => modelOptions.find((item) => item.model === editForm.model),
    [modelOptions, editForm.model],
  );

  const versionOptions = useMemo(
    () => selectedModel?.versions ?? [],
    [selectedModel],
  );

  const selectedVersion = useMemo(
    () => versionOptions.find((item) => item.version === editForm.version),
    [versionOptions, editForm.version],
  );

  const yearOptions = useMemo(
    () => selectedVersion?.years ?? [],
    [selectedVersion],
  );

  const isEditBlocked = useMemo(() => {
    if (!editCar?.status) return false;
    if (NON_EDITABLE_PROGRESS.includes(editCar.status as CarProgress)) {
      return true;
    }
    if (
      editCar.status === 'In auction' &&
      editCar.sessionEndTime &&
      new Date() <= new Date(editCar.sessionEndTime)
    ) {
      return true;
    }
    return false;
  }, [editCar?.status, editCar?.sessionEndTime]);

  const remainingMs = useMemo(() => {
    if (!editForm.sessionEndTime) return 0;
    const end = new Date(editForm.sessionEndTime).getTime();
    if (Number.isNaN(end)) return 0;
    return Math.max(0, end - clockNow);
  }, [editForm.sessionEndTime, clockNow]);

  const isPersistedSettingUpLegal = editCar?.status === 'Setting up legal documents';
  const canEditBuyer = isPersistedSettingUpLegal;

  const bidderOptions = useMemo(() => {
    const grouped = new Map<string, AdminBidder>();
    (editForm.bidders || []).forEach((bidder) => {
      if (!bidder.userId) return;
      const existing = grouped.get(bidder.userId);
      if (!existing || Number(bidder.amount || 0) > Number(existing.amount || 0)) {
        grouped.set(bidder.userId, bidder);
      }
    });

    return Array.from(grouped.values()).sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
  }, [editForm.bidders]);

  const canMoveToSold = isPersistedSettingUpLegal && Boolean(editForm.buyerId);

  const progressOptions = useMemo(
    () => CAR_PROGRESS_OPTIONS.filter((status) => {
      if (status === 'In auction') return false;
      if (status === 'Sold') {
        if (editForm.status === 'Sold') return true;
        return canMoveToSold;
      }
      return true;
    }),
    [editForm.status, canMoveToSold],
  );

  const filtered = cars.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.brand.toLowerCase().includes(q) && !c.sellerName.toLowerCase().includes(q)) return false;
    }
    if (userSearchQuery) {
      const qUser = userSearchQuery.toLowerCase().trim();
      const sellerPhone = (c.sellerPhone || '').toLowerCase();
      const sellerEmail = (c.sellerEmail || '').toLowerCase();
      const buyerPhone = (c.buyerPhone || '').toLowerCase();
      const buyerEmail = (c.buyerEmail || '').toLowerCase();

      if (
        !sellerPhone.includes(qUser) &&
        !sellerEmail.includes(qUser) &&
        !buyerPhone.includes(qUser) &&
        !buyerEmail.includes(qUser)
      ) {
        return false;
      }
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c._id)));
  };
  const massUpdate = (status: CarProgress) => {
    setCars(prev => prev.map(c => selected.has(c._id) ? { ...c, status } : c));
    setSelected(new Set());
  };
  const deleteCar = async (id: string) => {
    try {
      await adminApi.deleteCar(id);
      setCars(prev => prev.filter(c => c._id !== id));
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (editCar?._id === id) {
        setEditCar(null);
      }
      toast({ title: 'Xóa xe thành công' });
    } catch (error: any) {
      toast({
        title: 'Xóa xe thất bại',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const openEdit = (car: AdminCar) => {
    setEditCar(car);
    setEditForm({ ...car });
    setPreviewImageIndex(null);
    const defaultDateTime = buildDefaultAuctionEndDateTime();
    setAuctionEndDate(defaultDateTime.date);
    setAuctionEndTime(defaultDateTime.time);
  };

  const uploadImagesForCar = async (files: FileList | null) => {
    if (!editCar || !files || files.length === 0) return;

    const currentImages = editForm.images || [];
    const remainingSlots = 5 - currentImages.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Đã đạt tối đa 5 ảnh',
        description: 'Hãy xóa bớt ảnh trước khi thêm mới.',
        variant: 'destructive',
      });
      return;
    }

    const selectedFiles = Array.from(files);
    const filesToUpload = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      toast({
        title: 'Vượt quá số lượng ảnh',
        description: `Chỉ có thể thêm ${remainingSlots} ảnh nữa.`,
        variant: 'destructive',
      });
    }

    try {
      setIsUploadingImages(true);
      const result = await adminApi.uploadCarImages(editCar._id, filesToUpload);
      updateField('images', result.images || [...currentImages, ...(result.addedImages || [])]);
      toast({
        title: 'Tải ảnh thành công',
        description: `Đã thêm ${result.addedImages?.length || filesToUpload.length} ảnh.`,
      });
    } catch (error: any) {
      toast({
        title: 'Tải ảnh thất bại',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImageFromEditForm = (index: number) => {
    const currentImages = editForm.images || [];
    updateField('images', currentImages.filter((_, i) => i !== index));
    if (previewImageIndex === index) {
      setPreviewImageIndex(null);
    } else if (previewImageIndex !== null && previewImageIndex > index) {
      setPreviewImageIndex(previewImageIndex - 1);
    }
  };

  const handleBrandChange = (brandName: string) => {
    const nextBrand = brands.find((item) => item.brand === brandName);
    const firstModel = nextBrand?.models?.[0];
    const firstVersion = firstModel?.versions?.[0];
    const firstYear = firstVersion?.years?.[0];

    setEditForm((prev) => ({
      ...prev,
      brand: brandName,
      model: firstModel?.model || '',
      version: firstVersion?.version || '',
      year: Number(firstYear?.year || 0),
      title: buildCarTitle(brandName, firstModel?.model, firstVersion?.version, Number(firstYear?.year || 0)),
      modelType: firstModel?.type || '',
      modelFuel: firstVersion?.fuel || '',
      modelTransmission: firstYear?.transmission || '',
      modelTier: firstYear?.tier,
      fuelType: normalizeFuelType(firstVersion?.fuel || 'petrol'),
      transmission: normalizeTransmission(firstYear?.transmission || 'automatic'),
    }));
  };

  const handleModelChange = (modelName: string) => {
    const nextModel = modelOptions.find((item) => item.model === modelName);
    const firstVersion = nextModel?.versions?.[0];
    const firstYear = firstVersion?.years?.[0];

    setEditForm((prev) => ({
      ...prev,
      model: modelName,
      version: firstVersion?.version || '',
      year: Number(firstYear?.year || 0),
      title: buildCarTitle(prev.brand, modelName, firstVersion?.version, Number(firstYear?.year || 0)),
      modelType: nextModel?.type || '',
      modelFuel: firstVersion?.fuel || '',
      modelTransmission: firstYear?.transmission || '',
      modelTier: firstYear?.tier,
      fuelType: normalizeFuelType(firstVersion?.fuel || 'petrol'),
      transmission: normalizeTransmission(firstYear?.transmission || 'automatic'),
    }));
  };

  const handleVersionChange = (versionName: string) => {
    const nextVersion = versionOptions.find((item) => item.version === versionName);
    const firstYear = nextVersion?.years?.[0];

    setEditForm((prev) => ({
      ...prev,
      version: versionName,
      year: Number(firstYear?.year || 0),
      title: buildCarTitle(prev.brand, prev.model, versionName, Number(firstYear?.year || 0)),
      modelFuel: nextVersion?.fuel || '',
      modelTransmission: firstYear?.transmission || '',
      modelTier: firstYear?.tier,
      fuelType: normalizeFuelType(nextVersion?.fuel || 'petrol'),
      transmission: normalizeTransmission(firstYear?.transmission || 'automatic'),
    }));
  };

  const handleYearChange = (year: string) => {
    const nextYear = yearOptions.find((item) => item.year === year);
    setEditForm((prev) => ({
      ...prev,
      year: Number(year),
      title: buildCarTitle(prev.brand, prev.model, prev.version, Number(year)),
      modelTransmission: nextYear?.transmission || prev.modelTransmission,
      modelTier: nextYear?.tier ?? prev.modelTier,
      transmission: normalizeTransmission(nextYear?.transmission || String(prev.transmission || 'automatic')),
    }));
  };

  const handleStartAuction = async () => {
    if (!editCar || !AUCTION_STARTABLE_PROGRESS.includes((editForm.status || '') as CarProgress)) return;

    if (!auctionEndDate || !auctionEndTime) {
      toast({
        title: 'Thiếu thời gian kết thúc',
        description: 'Vui lòng chọn ngày và giờ kết thúc phiên đấu giá.',
        variant: 'destructive',
      });
      return;
    }

    const endDateTime = new Date(`${auctionEndDate}T${auctionEndTime}`);
    if (Number.isNaN(endDateTime.getTime()) || endDateTime.getTime() <= Date.now()) {
      toast({
        title: 'Thời gian kết thúc không hợp lệ',
        description: 'Giờ kết thúc phải lớn hơn thời điểm hiện tại.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsStartingAuction(true);
      const result = await adminApi.startAuction(editCar._id, endDateTime.toISOString());

      setCars((prev) => prev.map((car) =>
        car._id === editCar._id
          ? {
              ...car,
              status: 'In auction',
              auctionStatus: 'auction',
              sessionEndTime: result.auctionSessionEndTime,
              auctioncounter: result.auctioncounter,
              currentBid: Number(car.price || 0),
              buyerId: '',
              buyerName: '',
              buyerEmail: '',
              buyerPhone: '',
              bidders: [],
            }
          : car,
      ));

      setEditForm((prev) => ({
        ...prev,
        status: 'In auction',
        auctionStatus: 'auction',
        sessionEndTime: result.auctionSessionEndTime,
        auctioncounter: result.auctioncounter,
        currentBid: Number(prev.price || 0),
        buyerId: '',
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        bidders: [],
      }));

      setEditCar((prev) =>
        prev
          ? {
              ...prev,
              status: 'In auction',
              auctionStatus: 'auction',
              sessionEndTime: result.auctionSessionEndTime,
              auctioncounter: result.auctioncounter,
              currentBid: Number(prev.price || 0),
              buyerId: '',
              buyerName: '',
              buyerEmail: '',
              buyerPhone: '',
              bidders: [],
            }
          : prev,
      );

      toast({ title: 'Đã đặt xe vào phiên đấu giá' });
    } catch (error: any) {
      toast({
        title: 'Không thể bắt đầu phiên đấu giá',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsStartingAuction(false);
    }
  };

  const saveEdit = async () => {
    if (!editCar || !editForm.price || Number(editForm.price) <= 0) return;

    if (editForm.status === 'Sold' && !canMoveToSold) {
      toast({
        title: 'Không thể chuyển sang Sold',
        description: 'Chỉ được chuyển Sold khi xe đang ở Setting up legal documents và đã chọn buyer.',
        variant: 'destructive',
      });
      return;
    }

    if (isEditBlocked) {
      toast({
        title: 'Xe ở trạng thái không thể chỉnh sửa',
        description: 'Vui lòng đổi trạng thái phù hợp trước khi cập nhật thông tin.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        progress: editForm.status === 'In auction' ? undefined : editForm.status,
        startingprice: Number(editForm.price),
        description: editForm.description,
        images: (editForm.images || []).slice(0, 5),
        brand: editForm.brand,
        model: editForm.model,
        version: editForm.version,
        year: String(editForm.year || ''),
        type: editForm.modelType,
        fuel: editForm.modelFuel,
        transmission: editForm.modelTransmission,
        tier: editForm.modelTier,
        mileage: Number(editForm.mileage || 0),
        platecolor: editForm.plateColorCode,
        platenumber: editForm.plateNumber,
        buyerId: editForm.buyerId || undefined,
        location: editForm.location as (typeof LOCATION_OPTIONS)[number],
      };
      const response = await adminApi.updateCar(editCar._id, payload);
      const updatedCar = mapAdminCar(response.car);

      setCars((prev) => prev.map((car) => (car._id === editCar._id ? updatedCar : car)));
      setEditForm(updatedCar);

      setEditCar(null);
      toast({ title: 'Cập nhật xe thành công' });
    } catch (error: any) {
      toast({
        title: 'Cập nhật xe thất bại',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const updateField = (field: keyof AdminCar, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm xe..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-52" />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm user theo SĐT/Email..."
            value={userSearchQuery}
            onChange={e => setUserSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Lọc trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {CAR_PROGRESS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{selected.size} xe đã chọn</span>
            <Button size="sm" variant="outline" onClick={() => massUpdate('Pending verification')}>→ Pending verification</Button>
            <Button size="sm" variant="outline" onClick={() => massUpdate('Verified')}>→ Verified</Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></TableHead>
              <TableHead>Xe</TableHead>
              <TableHead>Info</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(car => (
              <TableRow key={car._id} className="cursor-pointer" onClick={() => openEdit(car)}>
                <TableCell onClick={e => e.stopPropagation()}><Checkbox checked={selected.has(car._id)} onCheckedChange={() => toggleSelect(car._id)} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 aspect-[4/3] rounded overflow-hidden bg-muted shrink-0">
                      <img src={car.images[0] || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{car.title}</p>
                      <p className="text-xs text-muted-foreground">{car.brand} · {car.location}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div>{car.sellerName}</div>
                  <div>{car.sellerPhone || car.sellerEmail || '-'}</div>
                  <div className="mt-1">Buyer: {car.buyerName || 'Chưa có buyer'}</div>
                  <div>Ngày đăng: {formatDateTime(car.createdAt)}</div>
                </TableCell>
                <TableCell className="text-sm">{formatPrice(car.price)} ₫</TableCell>
                <TableCell><Badge className={STATUS_COLORS[car.status]}>{car.status}</Badge></TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(car)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xoá xe?</AlertDialogTitle>
                          <AlertDialogDescription>Bạn chắc chắn muốn xoá {car.title}?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Huỷ</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCar(car._id)} className="bg-destructive text-destructive-foreground">Xoá</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Full-screen Edit Dialog */}
      <Dialog open={!!editCar} onOpenChange={o => !o && setEditCar(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa xe - {buildCarTitle(editForm.brand, editForm.model, editForm.version, editForm.year)}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-6">
              {AUCTION_STARTABLE_PROGRESS.includes((editForm.status || '') as CarProgress) && (
                <div className="bg-secondary/50 rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Đặt vào phiên đấu giá</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="space-y-2">
                      <Label>Ngày kết thúc</Label>
                      <Input type="date" value={auctionEndDate} onChange={(e) => setAuctionEndDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Giờ kết thúc</Label>
                      <Input type="time" value={auctionEndTime} onChange={(e) => setAuctionEndTime(e.target.value)} />
                    </div>
                    <Button onClick={handleStartAuction} disabled={isStartingAuction} className="gradient-accent text-white w-full">
                      {isStartingAuction ? 'Đang bắt đầu phiên...' : 'Đặt vào phiên đấu giá'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Images preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Ảnh xe ({editForm.images?.length || 0}/5)</p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {editForm.images?.map((img, i) => (
                    <div key={i} className="relative w-24 aspect-[4/3] rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                      <button
                        type="button"
                        className="w-full h-full"
                        onClick={() => setPreviewImageIndex(i)}
                        title="Phóng to"
                      >
                        <img src={img} alt={`car-${i}`} className="w-full h-full object-cover" />
                      </button>
                      {!isEditBlocked && (
                        <button
                          type="button"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 border border-border text-foreground flex items-center justify-center"
                          onClick={() => removeImageFromEditForm(i)}
                          title="Xóa ảnh"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isEditBlocked || isUploadingImages || (editForm.images?.length || 0) >= 5}
                    onChange={(e) => {
                      uploadImagesForCar(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Tải ảnh lên như luồng user bán xe. Tối đa 5 ảnh cho mỗi xe.</p>
                </div>
              </div>

              {previewImageIndex !== null && (editForm.images?.[previewImageIndex]) && (
                <Dialog open={previewImageIndex !== null} onOpenChange={(open) => !open && setPreviewImageIndex(null)}>
                  <DialogContent className="max-w-3xl p-3">
                    <div className="w-full rounded-lg overflow-hidden bg-muted">
                      <img
                        src={editForm.images[previewImageIndex]}
                        alt="preview"
                        className="w-full max-h-[75vh] object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tiêu đề</Label>
                  <Input value={buildCarTitle(editForm.brand, editForm.model, editForm.version, editForm.year)} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Giá (VNĐ)</Label>
                  <Input disabled={isEditBlocked} type="text" inputMode="numeric" value={editForm.price || ''} onChange={e => updateField('price', Number(e.target.value.replace(/[^0-9]/g, '')))} />
                </div>
                <div className="space-y-2">
                  <Label>Hãng</Label>
                  <Select value={editForm.brand || ''} onValueChange={handleBrandChange} disabled={isEditBlocked}>
                    <SelectTrigger><SelectValue placeholder="Chọn hãng" /></SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.brand} value={brand.brand}>{brand.brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dòng xe</Label>
                  <Select value={editForm.model || ''} onValueChange={handleModelChange} disabled={isEditBlocked || !editForm.brand}>
                    <SelectTrigger><SelectValue placeholder="Chọn dòng xe" /></SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((model) => (
                        <SelectItem key={model.model} value={model.model}>{model.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phiên bản</Label>
                  <Select value={editForm.version || ''} onValueChange={handleVersionChange} disabled={isEditBlocked || !editForm.model}>
                    <SelectTrigger><SelectValue placeholder="Chọn phiên bản" /></SelectTrigger>
                    <SelectContent>
                      {versionOptions.map((version) => (
                        <SelectItem key={version.version} value={version.version}>{version.version}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Năm</Label>
                  <Select value={String(editForm.year || '')} onValueChange={handleYearChange} disabled={isEditBlocked || !editForm.version}>
                    <SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year.year} value={year.year}>{year.year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Số km</Label>
                  <Input disabled={isEditBlocked} type="text" inputMode="numeric" value={editForm.mileage || ''} onChange={e => updateField('mileage', Number(e.target.value.replace(/[^0-9]/g, '')))} />
                </div>
                <div className="space-y-2">
                  <Label>Nhiên liệu</Label>
                  <Input value={editForm.modelFuel || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Hộp số</Label>
                  <Input value={editForm.modelTransmission || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Loại xe</Label>
                  <Input value={editForm.modelType || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Input value={String(editForm.modelTier || '')} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Tiến trình</Label>
                  <Select value={editForm.status || ''} onValueChange={v => updateField('status', v as CarProgress)} disabled={isEditBlocked}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {progressOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Khu vực</Label>
                  <Select value={editForm.location || ''} onValueChange={v => updateField('location', v)} disabled={isEditBlocked}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Loại biển</Label>
                  <Select value={String(editForm.plateColorCode || 1)} onValueChange={v => updateField('plateColorCode', Number(v))} disabled={isEditBlocked}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATE_COLOR_OPTIONS.map((plate) => (
                        <SelectItem key={plate.code} value={String(plate.code)}>{plate.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Biển số</Label>
                  <Input disabled={isEditBlocked} value={editForm.plateNumber || ''} onChange={e => updateField('plateNumber', e.target.value)} />
                </div>
              </div>

              {isEditBlocked && (
                <p className="text-sm text-destructive">
                  Xe ở trạng thái hiện tại không thể cập nhật thông tin.
                </p>
              )}

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea disabled={isEditBlocked} value={editForm.description || ''} onChange={e => updateField('description', e.target.value)} className="min-h-[100px]" />
              </div>

              <div className="space-y-3 border border-border rounded-lg p-4 bg-card">
                <p className="text-sm font-medium text-foreground">Thông tin người bán / người mua</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Người bán</Label>
                    <Input value={editForm.sellerName || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email người bán</Label>
                    <Input value={editForm.sellerEmail || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>SĐT người bán</Label>
                    <Input value={editForm.sellerPhone || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày đăng</Label>
                    <Input value={formatDateTime(editForm.createdAt)} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Người mua</Label>
                    <Select
                      value={editForm.buyerId || '__none__'}
                      onValueChange={(value) => {
                        if (value === '__none__') {
                          updateField('buyerId', '');
                          updateField('buyerName', '');
                          updateField('buyerEmail', '');
                          updateField('buyerPhone', '');
                          return;
                        }
                        const selectedBidder = bidderOptions.find((item) => item.userId === value);
                        updateField('buyerId', value);
                        updateField('buyerName', selectedBidder?.displayname || '');
                        updateField('buyerEmail', selectedBidder?.email || '');
                        updateField('buyerPhone', selectedBidder?.phonenumber || '');
                      }}
                      disabled={!canEditBuyer || isEditBlocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={canEditBuyer ? 'Chọn buyer từ bidders' : 'Chỉ chỉnh khi xe đang ở Setting up legal documents'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Chưa chọn buyer</SelectItem>
                        {bidderOptions.map((bidder) => (
                          <SelectItem key={bidder.userId} value={bidder.userId}>
                            {(bidder.email || bidder.phonenumber || bidder.displayname)} / {(bidder.phonenumber || bidder.email || '-')} - Đã trả: {formatPrice(Number(bidder.amount || 0))} ₫
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email người mua</Label>
                    <Input value={editForm.buyerEmail || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>SĐT người mua</Label>
                    <Input value={editForm.buyerPhone || '-'} disabled />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border border-border rounded-lg p-4 bg-card">
                <p className="text-sm font-medium text-foreground">Thông tin phiên & bidders</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Số phiên</p>
                    <p className="font-semibold text-foreground">#{Number(editForm.auctioncounter || 0)}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Giá hiện tại</p>
                    <p className="font-semibold text-foreground">{formatPrice(Number(editForm.currentBid || editForm.price || 0))} ₫</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Thời gian còn lại</p>
                    <p className="font-semibold text-foreground">{formatCountdown(remainingMs)}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Kết thúc phiên</p>
                    <p className="font-semibold text-foreground">{formatDateTime(editForm.sessionEndTime)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Danh sách bidder</p>
                  {(editForm.bidders?.length ?? 0) > 0 ? (
                    <div className="border border-border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bidder</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Thời gian</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(editForm.bidders || []).map((bidder) => (
                            <TableRow key={bidder.id}>
                              <TableCell>{bidder.displayname}</TableCell>
                              <TableCell>{bidder.email || '-'}</TableCell>
                              <TableCell>{bidder.phonenumber || '-'}</TableCell>
                              <TableCell>{formatPrice(Number(bidder.amount || 0))} ₫</TableCell>
                              <TableCell>{formatDateTime(bidder.time)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có bidder trong dữ liệu phiên hiện tại.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCar(null)}>Huỷ</Button>
            <Button onClick={saveEdit} className="gradient-accent text-white" disabled={isEditBlocked || !editForm.price || Number(editForm.price) <= 0}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarsTab;
