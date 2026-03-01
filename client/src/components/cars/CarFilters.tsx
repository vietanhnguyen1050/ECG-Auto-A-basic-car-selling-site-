import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ICarFilters } from '@/types';

interface CarFiltersProps {
  filters: ICarFilters;
  onFilterChange: (filters: ICarFilters) => void;
}

const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Chevrolet'];
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid'];
const transmissions = ['manual', 'automatic'];
const bodyTypes = ['sedan', 'suv', 'hatchback', 'coupe', 'truck', 'van'];

const CarFilters = ({ filters, onFilterChange }: CarFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (key: keyof ICarFilters, value: string | undefined) => {
    onFilterChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={isExpanded ? 'secondary' : 'outline'}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t border-border">
          <Select
            value={filters.brand || 'all'}
            onValueChange={(v) => handleFilterChange('brand', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.fuelType || 'all'}
            onValueChange={(v) => handleFilterChange('fuelType', v as ICarFilters['fuelType'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Fuel Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fuel Types</SelectItem>
              {fuelTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.transmission || 'all'}
            onValueChange={(v) => handleFilterChange('transmission', v as ICarFilters['transmission'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transmissions</SelectItem>
              {transmissions.map((trans) => (
                <SelectItem key={trans} value={trans} className="capitalize">
                  {trans}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.bodyType || 'all'}
            onValueChange={(v) => handleFilterChange('bodyType', v as ICarFilters['bodyType'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Body Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Body Types</SelectItem>
              {bodyTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value || undefined)}
          />

          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value || undefined)}
          />
        </div>
      )}
    </div>
  );
};

export default CarFilters;
