import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  images: File[];
  setImages: (imgs: File[]) => void;
  max?: number;
}

const ImageUploader = ({ images, setImages, max = 5 }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = max - images.length;
    setImages([...images, ...files.slice(0, remaining)]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {images.map((file, i) => (
          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted">
            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
              aria-label={`Xóa ảnh ${i + 1}`}
              title="Xóa ảnh"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-accent/50 transition-colors"
            aria-label="Thêm ảnh"
            title="Thêm ảnh"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">{images.length}/{max}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAdd}
        aria-label="Chọn ảnh xe để tải lên"
        title="Chọn ảnh xe để tải lên"
      />
    </div>
  );
};

export default ImageUploader;
