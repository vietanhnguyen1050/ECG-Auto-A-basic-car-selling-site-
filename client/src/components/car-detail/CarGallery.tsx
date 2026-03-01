import { useState } from 'react';

const CarGallery = ({ images }: { images: string[] }) => {
  const [selected, setSelected] = useState(0);
  const imgs = images.length > 0 ? images : ['/placeholder.svg'];

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
        <img src={imgs[selected]} alt="Car" className="w-full h-full object-cover" />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              aria-label={`Xem ảnh xe ${i + 1}`}
              title={`Xem ảnh xe ${i + 1}`}
              className={`shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors ${i === selected ? 'border-accent' : 'border-border hover:border-muted-foreground'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarGallery;
