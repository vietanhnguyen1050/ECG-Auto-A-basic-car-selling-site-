import type { ICarModelData, IYearData } from '@/types';

// Helper to generate yearData for a list of years with same defaults
function makeYearData(
  years: number[],
  basePrice: number,
  transmission: IYearData['transmission'] = 'automatic',
  fuelType: IYearData['fuelType'] = 'petrol',
  segment: IYearData['segment'] = 'standard',
): IYearData[] {
  return years.map(year => ({
    year,
    basePrice: basePrice - (2024 - year) * Math.round(basePrice * 0.03),
    transmission,
    fuelType,
    segment,
  }));
}

export const carModelsData: ICarModelData[] = [
  {
    brand: 'Toyota',
    models: [
      {
        name: 'Camry',
        versions: [
          { name: '2.0Q', yearData: makeYearData([2024, 2023, 2022, 2021, 2020], 1050000000) },
          { name: '2.5Q', yearData: makeYearData([2024, 2023, 2022, 2021], 1250000000, 'automatic', 'petrol', 'luxury') },
          { name: '2.0G', yearData: makeYearData([2023, 2022, 2021, 2020], 950000000) },
        ],
      },
      {
        name: 'Corolla Cross',
        versions: [
          { name: '1.8V', yearData: makeYearData([2024, 2023, 2022, 2021], 820000000) },
          { name: '1.8HV', yearData: makeYearData([2024, 2023, 2022], 905000000, 'automatic', 'hybrid') },
          { name: '1.8G', yearData: makeYearData([2023, 2022, 2021], 720000000) },
        ],
      },
      {
        name: 'Vios',
        versions: [
          { name: '1.5G', yearData: makeYearData([2024, 2023, 2022, 2021, 2020], 580000000) },
          { name: '1.5E', yearData: makeYearData([2024, 2023, 2022, 2021], 480000000, 'manual') },
        ],
      },
    ],
  },
  {
    brand: 'Honda',
    models: [
      {
        name: 'City',
        versions: [
          { name: '1.5 RS', yearData: makeYearData([2024, 2023, 2022, 2021], 599000000) },
          { name: '1.5 L', yearData: makeYearData([2024, 2023, 2022], 529000000) },
          { name: '1.5 G', yearData: makeYearData([2023, 2022, 2021], 559000000) },
        ],
      },
      {
        name: 'CR-V',
        versions: [
          { name: '1.5 E', yearData: makeYearData([2024, 2023, 2022, 2021], 998000000) },
          { name: '1.5 G', yearData: makeYearData([2024, 2023, 2022], 1098000000) },
          { name: '1.5 L', yearData: makeYearData([2024, 2023], 1198000000, 'automatic', 'petrol', 'luxury') },
        ],
      },
      {
        name: 'Civic',
        versions: [
          { name: '1.5 RS', yearData: makeYearData([2024, 2023, 2022], 870000000) },
          { name: '1.5 G', yearData: makeYearData([2024, 2023, 2022], 770000000) },
        ],
      },
    ],
  },
  {
    brand: 'Hyundai',
    models: [
      {
        name: 'Accent',
        versions: [
          { name: '1.4 AT Đặc biệt', yearData: makeYearData([2024, 2023, 2022, 2021], 542000000) },
          { name: '1.4 AT Tiêu chuẩn', yearData: makeYearData([2024, 2023, 2022], 472000000) },
          { name: '1.4 MT', yearData: makeYearData([2023, 2022, 2021], 426000000, 'manual') },
        ],
      },
      {
        name: 'Tucson',
        versions: [
          { name: '2.0 Đặc biệt', yearData: makeYearData([2024, 2023, 2022], 920000000) },
          { name: '1.6T-GDi', yearData: makeYearData([2024, 2023], 1030000000, 'automatic', 'petrol', 'luxury') },
          { name: '2.0 Tiêu chuẩn', yearData: makeYearData([2024, 2023, 2022], 825000000) },
        ],
      },
      {
        name: 'Santa Fe',
        versions: [
          { name: '2.5 Cao cấp', yearData: makeYearData([2024, 2023, 2022], 1340000000, 'automatic', 'petrol', 'luxury') },
          { name: '2.2D Đặc biệt', yearData: makeYearData([2024, 2023], 1290000000, 'automatic', 'diesel', 'luxury') },
        ],
      },
    ],
  },
  {
    brand: 'Mazda',
    models: [
      {
        name: 'Mazda3',
        versions: [
          { name: '1.5 Luxury', yearData: makeYearData([2024, 2023, 2022, 2021], 739000000) },
          { name: '2.0 Premium', yearData: makeYearData([2024, 2023, 2022], 849000000) },
        ],
      },
      {
        name: 'CX-5',
        versions: [
          { name: '2.0 Deluxe', yearData: makeYearData([2024, 2023, 2022, 2021], 839000000) },
          { name: '2.0 Premium', yearData: makeYearData([2024, 2023, 2022], 919000000) },
          { name: '2.5 Signature', yearData: makeYearData([2024, 2023], 1059000000, 'automatic', 'petrol', 'luxury') },
        ],
      },
    ],
  },
  {
    brand: 'Kia',
    models: [
      {
        name: 'Morning',
        versions: [
          { name: 'AT Luxury', yearData: makeYearData([2024, 2023, 2022, 2021], 439000000) },
          { name: 'MT', yearData: makeYearData([2023, 2022, 2021], 349000000, 'manual') },
        ],
      },
      {
        name: 'Seltos',
        versions: [
          { name: '1.6 Premium', yearData: makeYearData([2024, 2023, 2022], 729000000) },
          { name: '1.6 Deluxe', yearData: makeYearData([2024, 2023, 2022, 2021], 639000000) },
        ],
      },
      {
        name: 'K3',
        versions: [
          { name: '1.6 Luxury', yearData: makeYearData([2024, 2023, 2022], 619000000) },
          { name: '1.6 Premium', yearData: makeYearData([2024, 2023], 689000000) },
        ],
      },
    ],
  },
];

export const CONDITIONS = [
  { value: 'excellent', label: 'Rất tốt', factor: 1.0 },
  { value: 'good', label: 'Tốt', factor: 0.9 },
  { value: 'average', label: 'Trung bình', factor: 0.75 },
  { value: 'poor', label: 'Kém', factor: 0.6 },
  { value: 'bad', label: 'Tệ', factor: 0.45 },
];

export const PLATE_TYPES = [
  { value: 'white', label: 'Biển trắng' },
  { value: 'yellow', label: 'Biển vàng' },
  { value: 'blue', label: 'Biển xanh' },
  { value: 'red', label: 'Biển đỏ' },
  { value: 'foreign', label: 'Nước ngoài' },
  { value: 'none', label: 'Không có biển' },
];

export const LOCATIONS = ['Hà Nội', 'TP.HCM', 'Đà Nẵng'];
