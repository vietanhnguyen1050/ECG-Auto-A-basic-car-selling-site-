// ==========================================
// CARS HOOK - Car data fetching & management
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '@/services/api';
import type { ICarFilters, ICarInput } from '@/types';

export const useCars = (page = 1, limit = 10, filters?: ICarFilters) => {
  return useQuery({
    queryKey: ['cars', page, limit, filters],
    queryFn: () => carsApi.getAll(page, limit, filters),
  });
};

export const useCar = (id: string) => {
  return useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(id),
    enabled: !!id,
  });
};

export const useMyCars = () => {
  return useQuery({
    queryKey: ['my-cars'],
    queryFn: () => carsApi.getMyCars(),
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, images }: { data: ICarInput; images: File[] }) =>
      carsApi.create(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['my-cars'] });
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICarInput> }) =>
      carsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-cars'] });
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['my-cars'] });
    },
  });
};
