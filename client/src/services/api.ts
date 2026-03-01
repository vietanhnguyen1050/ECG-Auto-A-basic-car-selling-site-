// ==========================================
// API SERVICE - Centralized HTTP client using Axios
// ==========================================

import axiosInstance from './axiosInstance';
import { clearAuthTokens } from '@/lib/authTokens';
import { fromSignUpResponseDto, toSignUpRequestDto } from './adapters/auth.adapter';
import type {
  IAuthResponse,
  ILoginInput,
  IUserInput,
  ICar,
  ICarInput,
  ICarFilters,
  IApiResponse,
  IPaginatedResponse,
} from '@/types';
import type { RegisterResult, SignUpResponseDto } from './adapters/auth.adapter';

export interface LoginResponseDto {
  message: string;
  userId: string;
  role: 'user' | 'admin';
  displayname: string | null;
  email: string | null;
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponseDto {
  userId: string;
  displayname: string | null;
  email: string | null;
  phonenumber: string | null;
  role: 'user' | 'admin';
}

const mapApiCarToICar = (item: any): ICar => {
  const progress = item?.progress;
  const seller = item?.car?.seller;
  const conditionMap: Record<number, ICar['condition']> = {
    1: 'bad',
    2: 'poor',
    3: 'average',
    4: 'good',
    5: 'excellent',
  };

  const mappedBids = (item?.bid?.bidders ?? []).map((bid: any) => ({
    _id: String(bid?._id ?? `${bid?.userid?._id ?? 'bid'}-${bid?.time ?? Date.now()}`),
    bidder: String(bid?.userid?._id ?? bid?.userid ?? ''),
    bidderName: bid?.userid?.displayname || bid?.userid?.email || 'Ẩn danh',
    amount: Number(bid?.amount || 0),
    timestamp: new Date(bid?.time || Date.now()),
  }));

  const auctioncounter = Number(item?.bid?.auctioncounter || 0);
  const endTime = item?.bid?.auctionSessionEndTime;

  return {
    _id: item?._id,
    title: `${item?.model?.brand || ''} ${item?.model?.model || ''} ${item?.model?.version || ''}`.trim(),
    brand: item?.model?.brand || '',
    model: item?.model?.model || '',
    version: item?.model?.version || '',
    year: Number(item?.model?.year || 0),
    price: Number(item?.car?.startingprice || 0),
    mileage: Number(item?.car?.mileage || 0),
    fuelType:
      item?.model?.fuel === 'diesel' || item?.model?.fuel === 'electric' || item?.model?.fuel === 'hybrid'
        ? item.model.fuel
        : 'petrol',
    transmission: item?.model?.transmission === 'manual' ? 'manual' : 'automatic',
    bodyType: 'sedan',
    condition: conditionMap[Number(item?.car?.condition)] ?? undefined,
    color: '',
    description: item?.car?.description || '',
    images: item?.car?.images || [],
    features: [],
    seller: seller || '',
    sellerName: seller?.displayname || seller?.email || 'Unknown',
    location: item?.car?.location || '',
    plateType: item?.car?.platecolorLabel || '',
    plateNumber: item?.car?.platenumber || '',
    progress,
    status: progress === 'Sold' ? 'sold' : progress === 'Pending verification' ? 'pending' : 'available',
    auctionStatus: progress === 'In auction' ? 'auction' : 'normal',
    currentBid: Number(item?.bid?.currentprice || item?.car?.startingprice || 0),
    auctionSession:
      endTime
        ? {
            sessionNumber: auctioncounter,
            startTime: new Date(),
            endTime: new Date(endTime),
            bids: mappedBids,
          }
        : undefined,
    bids: mappedBids,
    createdAt: new Date(item?.car?.posteddate || Date.now()),
    updatedAt: new Date(item?.updatedAt || Date.now()),
  };
};

// ==========================================
// AUTH API
// ==========================================
export const authApi = {
  register: async (data: IUserInput): Promise<RegisterResult> => {
    const payload = toSignUpRequestDto(data);
    const res = await axiosInstance.post<SignUpResponseDto>('/auth/signup', payload);
    return fromSignUpResponseDto(res.data);
  },

  login: async (data: ILoginInput): Promise<LoginResponseDto> => {
    const credential = data.credential.trim();
    const isEmail = credential.includes('@');
    const loginPayload = {
      ...(isEmail ? { email: credential } : { phonenumber: credential }),
      password: data.password,
    };
    const res = await axiosInstance.post<LoginResponseDto>('/auth/login', loginPayload);
    return res.data;
  },

  getProfile: async (): Promise<ProfileResponseDto> => {
    const res = await axiosInstance.get<ProfileResponseDto>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { displayname: string }): Promise<{ message: string; user: ProfileResponseDto }> => {
    const res = await axiosInstance.put('/auth/profile', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await axiosInstance.put('/auth/password', data);
    return res.data;
  },

  logout: (): void => {
    clearAuthTokens();
  },
};

// ==========================================
// CARS API
// ==========================================
export const carsApi = {
  getAll: async (
    page = 1,
    limit = 10,
    filters?: ICarFilters
  ): Promise<IPaginatedResponse<ICar>> => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };

    if (filters?.brand && filters.brand !== 'all') {
      params.brand = filters.brand;
    }

    if (filters?.location && filters.location !== 'all') {
      params.location = filters.location;
    }

    if (filters?.auctionStatus && filters.auctionStatus !== 'normal') {
      params.auctionStatus = filters.auctionStatus;
    }

    if (filters?.maxPrice && Number(filters.maxPrice) > 0) {
      params.maxPrice = String(filters.maxPrice);
    }

    const res = await axiosInstance.get('/car', { params });
    return {
      ...res.data,
      data: (res.data?.data ?? []).map(mapApiCarToICar),
      pagination: {
        ...res.data.pagination,
        pages: res.data?.pagination?.totalPages ?? 1,
      },
    };
  },

  getById: async (id: string): Promise<ICar> => {
    const res = await axiosInstance.get(`/car/${id}`);
    return mapApiCarToICar(res.data);
  },

  cancelSellRequest: async (carId: string): Promise<{ message: string; progress: string }> => {
    const res = await axiosInstance.patch(`/car/${carId}/cancel`);
    return res.data;
  },

  create: async (
    data: {
      model: { brand: string; model: string; version: string; year: string };
      car: {
        mileage: number;
        condition: number;
        platecolor: number;
        platenumber?: string;
        description: string;
        location: 'Hanoi' | 'Ho Chi Minh City' | 'Da Nang';
      };
    },
    images: File[],
  ): Promise<{ message: string; imageCount: number; carId: string }> => {
    const formData = new FormData();
    formData.append('car', JSON.stringify(data));
    images.forEach((image) => formData.append('images', image));

    const res = await axiosInstance.post('/car/sell', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  update: async (id: string, data: Partial<ICarInput>): Promise<IApiResponse<ICar>> => {
    const res = await axiosInstance.put(`/cars/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<IApiResponse<null>> => {
    const res = await axiosInstance.delete(`/cars/${id}`);
    return res.data;
  },

  getMyCars: async (): Promise<ICar[]> => {
    const res = await axiosInstance.get('/car/my-listings');
    return (res.data?.data ?? []).map(mapApiCarToICar);
  },

  search: async (query: string, page = 1, limit = 10): Promise<IPaginatedResponse<ICar>> => {
    const res = await axiosInstance.get('/cars/search', { params: { q: query, page, limit } });
    return res.data;
  },

  getBrandCatalog: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/brand');
    return res.data;
  },

  evaluate: async (data: {
    model: { brand: string; model: string; version: string; year: string };
    car: { condition: number; mileage: number };
  }): Promise<{ price: number }> => {
    const res = await axiosInstance.post('/car/evaluate', { car: data });
    return res.data;
  },
};

// ==========================================
// BIDS API
// ==========================================
export const bidsApi = {
  placeBid: async (payload: {
    carId: string;
    userid: string;
    amount: number;
    time: string;
  }): Promise<{ message: string }> => {
    const res = await axiosInstance.post('/bid/place', payload);
    return res.data;
  },

  getBidders: async (carId: string): Promise<{ bidders: any[] }> => {
    const res = await axiosInstance.post('/bid/list', { carId });
    return res.data;
  },

  getMyBids: async (): Promise<ICar[]> => {
    const res = await axiosInstance.get('/bid/my-bids');
    return (res.data?.data ?? []).map(mapApiCarToICar);
  },
};

// ==========================================
// FAVORITES API
// ==========================================
export const favoritesApi = {
  getAll: async (): Promise<IApiResponse<ICar[]>> => {
    const res = await axiosInstance.get('/favorites');
    return res.data;
  },

  toggle: async (carId: string): Promise<IApiResponse<{ isFavorite: boolean }>> => {
    const res = await axiosInstance.post(`/favorites/${carId}`);
    return res.data;
  },
};

// ==========================================
// ADMIN API
// ==========================================
export const adminApi = {
  getOverview: async (): Promise<{ brands: any[]; users: any[]; cars: any[] }> => {
    const res = await axiosInstance.get('/admin/overview');
    return res.data;
  },

  // Users
  getUsers: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/admin/users');
    return res.data;
  },

  updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<{ message: string; user: any }> => {
    const res = await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  getUserById: async (userId: string): Promise<any> => {
    const res = await axiosInstance.get(`/admin/users/${userId}`);
    return res.data;
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const res = await axiosInstance.delete(`/admin/users/${userId}`);
    return res.data;
  },

  // Cars
  getCars: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/admin/cars');
    return res.data;
  },

  getCarById: async (carId: string): Promise<any> => {
    const res = await axiosInstance.get(`/admin/cars/${carId}`);
    return res.data;
  },

  deleteCar: async (carId: string): Promise<{ message: string }> => {
    const res = await axiosInstance.delete(`/admin/cars/${carId}`);
    return res.data;
  },

  updateCar: async (
    carId: string,
    data: {
      progress?: string;
      startingprice?: number;
      description?: string;
      brand?: string;
      model?: string;
      version?: string;
      year?: string;
      type?: string;
      fuel?: string;
      transmission?: string;
      tier?: number;
      mileage?: number;
      condition?: number;
      platecolor?: number;
      platenumber?: string;
      images?: string[];
      buyerId?: string;
      location?: 'Hanoi' | 'Ho Chi Minh City' | 'Da Nang';
      removeImages?: string[];
    },
  ): Promise<{ message: string; car: any }> => {
    const res = await axiosInstance.patch(`/admin/cars/${carId}`, data);
    return res.data;
  },

  startAuction: async (
    carId: string,
    auctionSessionEndTime: string,
  ): Promise<{
    message: string;
    progress: string;
    auctioncounter: number;
    auctionSessionEndTime: string;
  }> => {
    const res = await axiosInstance.patch(`/admin/cars/${carId}/start-auction`, {
      auctionSessionEndTime,
    });
    return res.data;
  },

  uploadCarImages: async (
    carId: string,
    files: File[],
  ): Promise<{ message: string; addedImages: string[]; images: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const res = await axiosInstance.post(`/admin/cars/${carId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Brands
  getBrands: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/admin/brands');
    return res.data;
  },

  updateBrand: async (brandId: string, data: any): Promise<{ message: string; brand: any }> => {
    const res = await axiosInstance.put(`/admin/brands/${brandId}`, data);
    return res.data;
  },

  createBrand: async (data: any): Promise<{ message: string; brand: any }> => {
    const res = await axiosInstance.post('/admin/brands', data);
    return res.data;
  },
};
