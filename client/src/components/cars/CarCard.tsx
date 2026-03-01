import { Link } from 'react-router-dom';
import { Fuel, Gauge, Calendar, MapPin } from 'lucide-react';
import type { ICar } from '@/types';
import { Badge } from '@/components/ui/badge';

interface CarCardProps {
  car: ICar;
}

const CarCard = ({ car }: CarCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  return (
    <Link
      to={`/cars/${car._id}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={car.images[0] || '/placeholder.svg'}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge
          className={`absolute top-3 right-3 ${
            car.status === 'available'
              ? 'bg-green-500'
              : car.status === 'pending'
              ? 'bg-yellow-500'
              : 'bg-muted'
          }`}
        >
          {car.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {car.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {car.brand} {car.model}
            </p>
          </div>
          <p className="font-display font-bold text-xl text-accent whitespace-nowrap">
            {formatPrice(car.price)}
          </p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{formatMileage(car.mileage)} mi</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span className="capitalize">{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{car.location}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {car.transmission}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {car.bodyType}
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
