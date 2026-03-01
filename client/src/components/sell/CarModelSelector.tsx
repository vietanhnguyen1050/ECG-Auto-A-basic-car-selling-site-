import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ICarModelData } from '@/types';

interface CarModelSelectorProps {
  brand: string;
  setBrand: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  version: string;
  setVersion: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  options: ICarModelData[];
}

const CarModelSelector = ({ brand, setBrand, model, setModel, version, setVersion, year, setYear, options }: CarModelSelectorProps) => {
  const sourceData = options;
  const brandData = sourceData.find(b => b.brand === brand);
  const modelData = brandData?.models.find(m => m.name === model);
  const versionData = modelData?.versions.find(v => v.name === version);

  const handleBrand = (v: string) => { setBrand(v); setModel(''); setVersion(''); setYear(''); };
  const handleModel = (v: string) => { setModel(v); setVersion(''); setYear(''); };
  const handleVersion = (v: string) => { setVersion(v); setYear(''); };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Hãng xe</Label>
        <Select value={brand} onValueChange={handleBrand}>
          <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn hãng" /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {sourceData.map(b => <SelectItem key={b.brand} value={b.brand}>{b.brand}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Dòng xe</Label>
        <Select value={model} onValueChange={handleModel} disabled={!brand}>
          <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn dòng" /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {brandData?.models.map(m => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Phiên bản</Label>
        <Select value={version} onValueChange={handleVersion} disabled={!model}>
          <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn phiên bản" /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {modelData?.versions.map(v => <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Năm sản xuất</Label>
        <Select value={year} onValueChange={setYear} disabled={!version}>
          <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn năm" /></SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {versionData?.yearData.map(yd => <SelectItem key={yd.year} value={String(yd.year)}>{yd.year}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CarModelSelector;
