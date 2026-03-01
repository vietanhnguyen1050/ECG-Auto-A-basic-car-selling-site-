// ==========================================
// SHARED TYPES
// ==========================================

// User Types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  displayName?: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  displayname?: string;
  email: string;
  phonenumber: string;
  password: string;
}

export interface ILoginInput {
  credential: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  token: string;
  user: Omit<IUser, 'password'>;
}

// Bid Types
export interface IBid {
  _id: string;
  bidder: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
}

// Auction Session
export interface IAuctionSession {
  sessionNumber: number;
  startTime: Date;
  endTime: Date;
  bids: IBid[];
}

// Car Types
export interface ICar {
  _id: string;
  title: string;
  brand: string;
  model: string;
  version?: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  bodyType: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'truck' | 'van';
  color: string;
  condition?: 'excellent' | 'good' | 'average' | 'poor' | 'bad';
  description: string;
  images: string[];
  features: string[];
  seller: IUser | string;
  sellerName: string;
  location: string;
  plateType?: string;
  plateNumber?: string;
  progress?: string;
  status: 'available' | 'sold' | 'pending';
  auctionStatus: 'auction' | 'normal';
  currentBid?: number;
  auctionSession?: IAuctionSession;
  bids?: IBid[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICarInput {
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: ICar['fuelType'];
  transmission: ICar['transmission'];
  bodyType: ICar['bodyType'];
  color: string;
  description: string;
  features: string[];
  location: string;
}

export interface ICarFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minYear?: number;
  maxYear?: number;
  fuelType?: ICar['fuelType'];
  transmission?: ICar['transmission'];
  bodyType?: ICar['bodyType'];
  status?: ICar['status'];
  auctionStatus?: ICar['auctionStatus'];
}

// Year-level data for each version-year combination
export interface IYearData {
  year: number;
  basePrice: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  segment: 'standard' | 'luxury' | 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'tier-5';
  active?: boolean;
}

// Car Model Data (for cascading dropdowns)
export interface ICarModelData {
  _id?: string;
  brand: string;
  models: {
    name: string;
    type?: string;
    versions: {
      name: string;
      fuelType?: IYearData['fuelType'];
      yearData: IYearData[];
      active?: boolean;
    }[];
    active?: boolean;
  }[];
  active?: boolean;
}

// API Response Types
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
