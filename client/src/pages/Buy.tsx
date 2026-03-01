import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import BuyFilters from '@/components/buy/BuyFilters';
import BuyCarCard from '@/components/buy/BuyCarCard';
import { useCars } from '@/hooks/useCars';
import { carsApi } from '@/services/api';
import type { ICarFilters } from '@/types';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 12;

const Buy = () => {
  const [brand, setBrand] = useState('all');
  const [location, setLocation] = useState('all');
  const [auctionFilter, setAuctionFilter] = useState<'all' | 'auction'>('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [maxPrice]);

  useEffect(() => {
    const fetchBrandCatalog = async () => {
      try {
        const catalog = await carsApi.getBrandCatalog();
        const nextBrands = (catalog ?? [])
          .filter((item: any) => item?.activation !== false && item?.brand)
          .map((item: any) => item.brand as string);
        setBrands(nextBrands);
      } catch {
        setBrands([]);
      }
    };

    fetchBrandCatalog();
  }, []);
  const filters = useMemo<ICarFilters>(
    () => ({
      brand: brand === 'all' ? undefined : brand,
      location: location === 'all' ? undefined : location,
      auctionStatus: auctionFilter === 'auction' ? 'auction' : undefined,
      maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
    }),
    [brand, location, auctionFilter, debouncedMaxPrice],
  );

  const { data, isLoading, isError } = useCars(page, ITEMS_PER_PAGE, filters);

  const cars = data?.data ?? [];
  const totalPages = Math.max(1, data?.pagination?.pages ?? 1);
  const currentPage = Math.min(page, totalPages);

  const clearFilters = () => {
    setBrand('all');
    setLocation('all');
    setAuctionFilter('all');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <Layout>
      <section className="py-8">
        <div className="container">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Mua xe</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            <BuyFilters
              brands={brands}
              brand={brand} setBrand={v => { setBrand(v); setPage(1); }}
              location={location} setLocation={v => { setLocation(v); setPage(1); }}
              auctionFilter={auctionFilter} setAuctionFilter={v => { setAuctionFilter(v); setPage(1); }}
              maxPrice={maxPrice} setMaxPrice={v => { setMaxPrice(v); setPage(1); }}
              onClear={clearFilters}
            />

            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Đang tải danh sách xe...</div>
              ) : isError ? (
                <div className="text-center py-20 text-destructive">Không thể tải dữ liệu xe. Vui lòng thử lại.</div>
              ) : cars.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">Không tìm thấy xe phù hợp.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cars.map(car => <BuyCarCard key={car._id} car={car} />)}
                  </div>

                  {totalPages > 1 && (
                    <Pagination className="mt-8">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={currentPage === i + 1}
                              onClick={() => setPage(i + 1)}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Buy;
