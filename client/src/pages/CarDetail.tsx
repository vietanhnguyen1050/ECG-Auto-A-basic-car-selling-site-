import { useParams, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CarGallery from '@/components/car-detail/CarGallery';
import CarInfo from '@/components/car-detail/CarInfo';
import AuctionPanel from '@/components/car-detail/AuctionPanel';
import AuthGate from '@/components/shared/AuthGate';
import { useCar } from '@/hooks/useCars';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { adminApi, carsApi } from '@/services/api';

function formatPrice(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN');
}

function buildDefaultAuctionEndDateTime() {
  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 30 * 60 * 1000);
  const date = defaultEnd.toISOString().slice(0, 10);
  const time = defaultEnd.toTimeString().slice(0, 5);
  return { date, time };
}

const CarDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { data: car, isLoading, isError, refetch } = useCar(id || '');
  const { user } = useAuth();
  const { toast } = useToast();
  const defaultAuctionDateTime = buildDefaultAuctionEndDateTime();
  const [auctionEndDate, setAuctionEndDate] = useState(defaultAuctionDateTime.date);
  const [auctionEndTime, setAuctionEndTime] = useState(defaultAuctionDateTime.time);
  const [isStartingAuction, setIsStartingAuction] = useState(false);

  const progress = car?.progress;
  const isInAuction = progress === 'In auction';
  const canAdminStartAuction = ['Verified', 'Finished auction', 'Verifying bidders'].includes(progress || '');
  const isAdmin = user?.role === 'admin';
  const sellerId = car ? (typeof car.seller === 'string' ? car.seller : car.seller?._id) : undefined;
  const isSellerOfCar = Boolean(user?._id && sellerId && String(user._id) === String(sellerId));
  const fromMyListings = Boolean((location.state as { fromMyListings?: boolean } | null)?.fromMyListings);
  const canShowSellerCancelAction = fromMyListings && isSellerOfCar;
  const isImmediateCancel = progress === 'Pending verification';
  const isRequestCancel = ['Verified', 'Finished auction', 'Verifying bidders'].includes(progress || '');
  const canCancelByStatus = isImmediateCancel || isRequestCancel;
  const [isCancellingSellRequest, setIsCancellingSellRequest] = useState(false);
  const endedAuctionStatuses = ['Finished auction', 'Verifying bidders'];
  const auctionUnavailableReason = endedAuctionStatuses.includes(progress || '')
    ? 'Đấu giá đã kết thúc'
    : 'Xe không trong phiên đấu giá';

  const handleStartAuction = async () => {
    if (!car?._id || !canAdminStartAuction) return;

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
      await adminApi.startAuction(car._id, endDateTime.toISOString());
      await refetch();
      toast({ title: 'Đã bắt đầu phiên đấu giá' });
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

  const handleCancelSellRequest = async () => {
    if (!car?._id || !canShowSellerCancelAction || !canCancelByStatus) return;

    try {
      setIsCancellingSellRequest(true);
      const result = await carsApi.cancelSellRequest(car._id);
      await refetch();
      toast({
        title: isImmediateCancel ? 'Đã hủy xe bán' : 'Đã gửi yêu cầu hủy',
        description: result?.message || undefined,
      });
    } catch (error: any) {
      toast({
        title: 'Không thể thực hiện thao tác hủy',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsCancellingSellRequest(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16 text-center">
          <p className="text-muted-foreground">Đang tải thông tin xe...</p>
        </section>
      </Layout>
    );
  }

  if (isError || !car) {
    return (
      <Layout>
        <section className="py-16 text-center">
          <p className="text-muted-foreground">Không tìm thấy xe.</p>
          <Link to="/cars"><Button variant="outline" className="mt-4">Quay lại</Button></Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-6">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <Link to="/cars">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <CarGallery images={car.images} />
              <CarInfo car={car} />
            </div>

            <div className="lg:col-span-2">
              {canShowSellerCancelAction && canCancelByStatus && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {isImmediateCancel
                      ? 'Xe đang ở trạng thái chờ duyệt, bạn có thể hủy ngay.'
                      : 'Xe đã qua bước duyệt/phiên, thao tác này sẽ gửi yêu cầu hủy cho admin.'}
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelSellRequest}
                    disabled={isCancellingSellRequest}
                  >
                    {isCancellingSellRequest
                      ? 'Đang xử lý...'
                      : isImmediateCancel
                        ? 'Hủy'
                        : 'Request hủy'}
                  </Button>
                </div>
              )}

              {isAdmin && canAdminStartAuction && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 mb-4">
                  <p className="text-sm font-medium text-foreground">Bắt đầu phiên đấu giá (Admin)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
                      <Input type="date" value={auctionEndDate} onChange={(e) => setAuctionEndDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Giờ kết thúc</p>
                      <Input type="time" value={auctionEndTime} onChange={(e) => setAuctionEndTime(e.target.value)} />
                    </div>
                  </div>
                  <Button
                    className="w-full gradient-accent text-white"
                    onClick={handleStartAuction}
                    disabled={isStartingAuction}
                  >
                    {isStartingAuction ? 'Đang bắt đầu phiên...' : 'Đặt vào phiên đấu giá'}
                  </Button>
                </div>
              )}

              {isInAuction ? (
                <AuthGate message="Đăng nhập để tham gia đấu giá">
                  <AuctionPanel car={car} />
                </AuthGate>
              ) : (
                <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Giá khởi điểm</p>
                    <p className="font-display font-bold text-foreground">{formatPrice(car.price)} ₫</p>
                  </div>
                  <p className="text-center text-muted-foreground">{auctionUnavailableReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CarDetail;
