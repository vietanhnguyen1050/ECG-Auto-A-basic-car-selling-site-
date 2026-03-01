import type { ICar, IBid } from '@/types';

function makeBids(count: number, basePrice: number): IBid[] {
  const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Vũ Thị E', 'Đỗ Văn F'];
  const bids: IBid[] = [];
  let price = basePrice;
  for (let i = 0; i < count; i++) {
    price += (Math.floor(Math.random() * 10) + 1) * 500000;
    bids.push({
      _id: `bid-${Date.now()}-${i}`,
      bidder: `u${i + 100}`,
      bidderName: names[i % names.length],
      amount: price,
      timestamp: new Date(Date.now() - (count - i) * 3600000),
    });
  }
  return bids;
}

function makeSession(bids: IBid[]): { sessionNumber: number; startTime: Date; endTime: Date; bids: IBid[] } {
  return {
    sessionNumber: 1,
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() + 86400000 * 2),
    bids,
  };
}

const cars: Omit<ICar, 'bids' | 'auctionSession'>[] = [
  { _id: '1', title: 'Toyota Camry 2.5Q 2023', brand: 'Toyota', model: 'Camry', version: '2.5Q', year: 2023, price: 1050000000, mileage: 15000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'Đen', condition: 'excellent', description: 'Xe đẹp, ít đi, bảo dưỡng đúng hạn.', images: ['/placeholder.svg'], features: [], seller: 'u1', sellerName: 'Nguyễn Văn An', location: 'Hà Nội', status: 'available', auctionStatus: 'auction', currentBid: 1020000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '2', title: 'Honda CR-V 1.5G 2024', brand: 'Honda', model: 'CR-V', version: '1.5 G', year: 2024, price: 1098000000, mileage: 5000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'suv', color: 'Trắng', condition: 'excellent', description: 'Xe mới, full option.', images: ['/placeholder.svg'], features: [], seller: 'u2', sellerName: 'Trần Thị Bình', location: 'TP.HCM', status: 'available', auctionStatus: 'auction', currentBid: 1020000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '3', title: 'Mazda CX-5 2.0 Premium 2022', brand: 'Mazda', model: 'CX-5', version: '2.0 Premium', year: 2022, price: 850000000, mileage: 30000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'suv', color: 'Đỏ', condition: 'good', description: 'Xe gia đình, nội thất đẹp.', images: ['/placeholder.svg'], features: [], seller: 'u3', sellerName: 'Lê Hoàng Cường', location: 'Đà Nẵng', status: 'available', auctionStatus: 'auction', currentBid: 820000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '4', title: 'Hyundai Tucson 2.0 2023', brand: 'Hyundai', model: 'Tucson', version: '2.0 Đặc biệt', year: 2023, price: 920000000, mileage: 12000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'suv', color: 'Xanh', condition: 'excellent', description: 'Xe đẹp như mới, đầy đủ phụ kiện.', images: ['/placeholder.svg'], features: [], seller: 'u4', sellerName: 'Phạm Minh Đức', location: 'Hà Nội', status: 'available', auctionStatus: 'auction', currentBid: 880000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '5', title: 'Kia Seltos 1.6 Premium 2023', brand: 'Kia', model: 'Seltos', version: '1.6 Premium', year: 2023, price: 700000000, mileage: 20000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'suv', color: 'Trắng', condition: 'good', description: 'Xe trẻ trung, tiết kiệm nhiên liệu.', images: ['/placeholder.svg'], features: [], seller: 'u5', sellerName: 'Vũ Thị Hoa', location: 'TP.HCM', status: 'available', auctionStatus: 'auction', currentBid: 670000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '6', title: 'Toyota Vios 1.5G 2022', brand: 'Toyota', model: 'Vios', version: '1.5G', year: 2022, price: 480000000, mileage: 35000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'Bạc', condition: 'average', description: 'Xe bền bỉ, phù hợp chạy dịch vụ.', images: ['/placeholder.svg'], features: [], seller: 'u6', sellerName: 'Nguyễn Thanh Giang', location: 'Hà Nội', status: 'available', auctionStatus: 'auction', currentBid: 455000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '7', title: 'Honda City 1.5 RS 2024', brand: 'Honda', model: 'City', version: '1.5 RS', year: 2024, price: 599000000, mileage: 3000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'Đỏ', condition: 'excellent', description: 'Xe mới 99%, mua về chỉ việc đi.', images: ['/placeholder.svg'], features: [], seller: 'u7', sellerName: 'Đỗ Văn Hùng', location: 'TP.HCM', status: 'available', auctionStatus: 'auction', currentBid: 570000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '8', title: 'Mazda3 1.5 Luxury 2023', brand: 'Mazda', model: 'Mazda3', version: '1.5 Luxury', year: 2023, price: 680000000, mileage: 18000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'Xám', condition: 'good', description: 'Xe đẹp, nội thất sang trọng.', images: ['/placeholder.svg'], features: [], seller: 'u8', sellerName: 'Trần Văn Khoa', location: 'Đà Nẵng', status: 'available', auctionStatus: 'auction', currentBid: 650000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '9', title: 'Hyundai Accent 1.4 AT 2023', brand: 'Hyundai', model: 'Accent', version: '1.4 AT Đặc biệt', year: 2023, price: 500000000, mileage: 22000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'Trắng', condition: 'good', description: 'Xe gia đình, tiết kiệm xăng.', images: ['/placeholder.svg'], features: [], seller: 'u9', sellerName: 'Lê Thị Lan', location: 'Hà Nội', status: 'available', auctionStatus: 'auction', currentBid: 475000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '10', title: 'Kia K3 1.6 Premium 2024', brand: 'Kia', model: 'K3', version: '1.6 Premium', year: 2024, price: 689000000, mileage: 5000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'Đen', condition: 'excellent', description: 'Xe mới, thiết kế thể thao.', images: ['/placeholder.svg'], features: [], seller: 'u10', sellerName: 'Phạm Quốc Mạnh', location: 'TP.HCM', status: 'available', auctionStatus: 'auction', currentBid: 650000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '11', title: 'Toyota Corolla Cross 1.8V 2023', brand: 'Toyota', model: 'Corolla Cross', version: '1.8V', year: 2023, price: 780000000, mileage: 16000, fuelType: 'hybrid', transmission: 'automatic', bodyType: 'suv', color: 'Trắng ngọc trai', condition: 'excellent', description: 'Xe hybrid tiết kiệm nhiên liệu.', images: ['/placeholder.svg'], features: [], seller: 'u11', sellerName: 'Nguyễn Văn Nam', location: 'Đà Nẵng', status: 'available', auctionStatus: 'auction', currentBid: 750000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '12', title: 'Honda Civic 1.5 RS 2023', brand: 'Honda', model: 'Civic', version: '1.5 RS', year: 2023, price: 830000000, mileage: 10000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'Xanh đậm', condition: 'excellent', description: 'Xe thể thao, đầy đủ công nghệ.', images: ['/placeholder.svg'], features: [], seller: 'u12', sellerName: 'Trần Hữu Phúc', location: 'Hà Nội', status: 'available', auctionStatus: 'auction', currentBid: 800000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '13', title: 'Hyundai Santa Fe 2.5 2024', brand: 'Hyundai', model: 'Santa Fe', version: '2.5 Cao cấp', year: 2024, price: 1340000000, mileage: 2000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'suv', color: 'Đen', condition: 'excellent', description: 'Xe 7 chỗ, full option, mới 100%.', images: ['/placeholder.svg'], features: [], seller: 'u13', sellerName: 'Đặng Quang Sơn', location: 'TP.HCM', status: 'available', auctionStatus: 'auction', currentBid: 1300000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '14', title: 'Kia Morning AT Luxury 2022', brand: 'Kia', model: 'Morning', version: 'AT Luxury', year: 2022, price: 390000000, mileage: 28000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'hatchback', color: 'Cam', condition: 'average', description: 'Xe nhỏ gọn, phù hợp đi phố.', images: ['/placeholder.svg'], features: [], seller: 'u14', sellerName: 'Lý Thị Trang', location: 'Hà Nội', status: 'available', auctionStatus: 'auction', currentBid: 365000000, createdAt: new Date(), updatedAt: new Date() },
  { _id: '15', title: 'Mazda CX-5 2.5 Signature 2024', brand: 'Mazda', model: 'CX-5', version: '2.5 Signature', year: 2024, price: 1059000000, mileage: 1000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'suv', color: 'Đỏ pha lê', condition: 'excellent', description: 'Phiên bản cao cấp nhất, nội thất da Nappa.', images: ['/placeholder.svg'], features: [], seller: 'u15', sellerName: 'Vương Đình Uy', location: 'Đà Nẵng', status: 'available', auctionStatus: 'auction', currentBid: 1010000000, createdAt: new Date(), updatedAt: new Date() },
];

const mockCars: ICar[] = cars.map(car => {
  const bids = makeBids(Math.floor(Math.random() * 5) + 2, car.price * 0.9);
  return {
    ...car,
    currentBid: bids[bids.length - 1].amount,
    bids,
    auctionSession: makeSession(bids),
  };
});

export default mockCars;
