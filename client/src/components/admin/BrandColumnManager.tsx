import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { ICarModelData, IYearData } from '@/types';
import type { BrandSelection } from './BrandsTab';

interface Props {
  data: ICarModelData[];
  setData: React.Dispatch<React.SetStateAction<ICarModelData[]>>;
  sel: BrandSelection;
  setSel: React.Dispatch<React.SetStateAction<BrandSelection>>;
}

interface ColumnItem {
  name: string;
  active: boolean;
}

const Column = ({
  title, items, selectedIdx, onSelect, onAdd, onToggle, onRename, onDelete, disabled,
}: {
  title: string; items: ColumnItem[]; selectedIdx: number | null;
  onSelect: (i: number) => void; onAdd: (name: string) => void; onToggle: (i: number) => void;
  onRename: (i: number, name: string) => void; onDelete: (i: number) => void; disabled?: boolean;
}) => {
  const [newName, setNewName] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || disabled) return;
    onAdd(newName.trim());
    setNewName('');
  };

  return (
    <div className={`w-48 shrink-0 bg-card rounded-xl border border-border overflow-hidden ${disabled ? 'opacity-50' : ''}`}>
      <div className="p-3 border-b border-border bg-secondary/30">
        <h4 className="font-display font-semibold text-foreground text-sm">{title}</h4>
      </div>
      <div className="p-2 border-b border-border">
        <div className="flex gap-1">
          <Input
            placeholder={disabled ? `Chọn ${title === 'Model' ? 'Brand' : title === 'Version' ? 'Model' : title === 'Year' ? 'Version' : ''} trước` : `Thêm ${title.toLowerCase()}`}
            value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="h-8 text-xs" disabled={disabled}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleAdd} disabled={disabled || !newName.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i}
            className={`group flex items-center gap-1.5 px-2 py-1.5 text-xs cursor-pointer transition-colors ${
              selectedIdx === i ? 'bg-accent/10 border-l-2 border-accent' : 'hover:bg-secondary/50 border-l-2 border-transparent'
            } ${!item.active ? 'opacity-50' : ''}`}
            onClick={() => onSelect(i)}>
            <div onClick={e => e.stopPropagation()}>
              <Switch checked={item.active} onCheckedChange={() => onToggle(i)} className="scale-75" />
            </div>
            {editIdx === i ? (
              <div className="flex items-center gap-1 flex-1">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-6 text-xs flex-1" />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={e => { e.stopPropagation(); onRename(i, editName); setEditIdx(null); }}><Check className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={e => { e.stopPropagation(); setEditIdx(null); }}><X className="h-3 w-3" /></Button>
              </div>
            ) : (
              <>
                <span className="flex-1 truncate text-foreground">{item.name}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); setEditIdx(i); setEditName(item.name); }}><Edit2 className="h-3 w-3" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}><Trash2 className="h-3 w-3" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xoá {item.name}?</AlertDialogTitle>
                      <AlertDialogDescription>Bạn chắc chắn muốn xoá? Tất cả dữ liệu con sẽ bị xoá theo.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Huỷ</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(i)} className="bg-destructive text-destructive-foreground">Xoá</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">{disabled ? 'Chọn mục trước' : 'Trống'}</p>}
      </div>
    </div>
  );
};

const BrandColumnManager = ({ data, setData, sel, setSel }: Props) => {
  const brands: ColumnItem[] = data.map(b => ({ name: b.brand, active: b.active ?? true }));
  const models: ColumnItem[] = sel.brandIdx !== null ? data[sel.brandIdx].models.map(m => ({ name: m.name, active: m.active ?? true })) : [];
  const versions: ColumnItem[] = sel.brandIdx !== null && sel.modelIdx !== null
    ? data[sel.brandIdx].models[sel.modelIdx].versions.map(v => ({ name: v.name, active: v.active ?? true }))
    : [];
  const years: ColumnItem[] = sel.brandIdx !== null && sel.modelIdx !== null && sel.versionIdx !== null
    ? data[sel.brandIdx].models[sel.modelIdx].versions[sel.versionIdx].yearData.map(yd => ({ name: String(yd.year), active: yd.active ?? true }))
    : [];

  return (
    <>
      <Column title="Brand" items={brands} selectedIdx={sel.brandIdx}
        onSelect={i => setSel({ brandIdx: i, modelIdx: null, versionIdx: null, yearIdx: null })}
        onAdd={name => setData(prev => [...prev, { brand: name, models: [], active: true }])}
        onToggle={i => setData(prev => prev.map((b, idx) => idx === i ? { ...b, active: !(b.active ?? true) } : b))}
        onRename={(i, name) => setData(prev => prev.map((b, idx) => idx === i ? { ...b, brand: name } : b))}
        onDelete={i => { setData(prev => prev.filter((_, idx) => idx !== i)); setSel({ brandIdx: null, modelIdx: null, versionIdx: null, yearIdx: null }); }}
      />
      <Column title="Model" items={models} selectedIdx={sel.modelIdx} disabled={sel.brandIdx === null}
        onSelect={i => setSel(prev => ({ ...prev, modelIdx: i, versionIdx: null, yearIdx: null }))}
        onAdd={name => {
          if (sel.brandIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? { ...b, models: [...b.models, { name, versions: [], active: true }] } : b));
        }}
        onToggle={i => {
          if (sel.brandIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? { ...b, models: b.models.map((m, mi) => mi === i ? { ...m, active: !(m.active ?? true) } : m) } : b));
        }}
        onRename={(i, name) => {
          if (sel.brandIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? { ...b, models: b.models.map((m, mi) => mi === i ? { ...m, name } : m) } : b));
        }}
        onDelete={i => {
          if (sel.brandIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? { ...b, models: b.models.filter((_, mi) => mi !== i) } : b));
          setSel(prev => ({ ...prev, modelIdx: null, versionIdx: null, yearIdx: null }));
        }}
      />
      <Column title="Version" items={versions} selectedIdx={sel.versionIdx} disabled={sel.modelIdx === null}
        onSelect={i => setSel(prev => ({ ...prev, versionIdx: i, yearIdx: null }))}
        onAdd={name => {
          if (sel.brandIdx === null || sel.modelIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? { ...m, versions: [...m.versions, { name, yearData: [], active: true }] } : m)
          } : b));
        }}
        onToggle={i => {
          if (sel.brandIdx === null || sel.modelIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? { ...m, versions: m.versions.map((v, vi) => vi === i ? { ...v, active: !(v.active ?? true) } : v) } : m)
          } : b));
        }}
        onRename={(i, name) => {
          if (sel.brandIdx === null || sel.modelIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? { ...m, versions: m.versions.map((v, vi) => vi === i ? { ...v, name } : v) } : m)
          } : b));
        }}
        onDelete={i => {
          if (sel.brandIdx === null || sel.modelIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? { ...m, versions: m.versions.filter((_, vi) => vi !== i) } : m)
          } : b));
          setSel(prev => ({ ...prev, versionIdx: null, yearIdx: null }));
        }}
      />
      <Column title="Year" items={years} selectedIdx={sel.yearIdx} disabled={sel.versionIdx === null}
        onSelect={i => setSel(prev => ({ ...prev, yearIdx: i }))}
        onAdd={name => {
          const y = parseInt(name);
          if (isNaN(y) || sel.brandIdx === null || sel.modelIdx === null || sel.versionIdx === null) return;
          const newYearData: IYearData = { year: y, basePrice: 0, transmission: 'automatic', fuelType: 'petrol', segment: 'tier-1', active: true };
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? {
              ...m, versions: m.versions.map((v, vi) => vi === sel.versionIdx ? { ...v, yearData: [...v.yearData, newYearData] } : v)
            } : m)
          } : b));
        }}
        onToggle={i => {
          if (sel.brandIdx === null || sel.modelIdx === null || sel.versionIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? {
              ...m, versions: m.versions.map((v, vi) => vi === sel.versionIdx ? {
                ...v,
                yearData: v.yearData.map((yd, yi) => yi === i ? { ...yd, active: !(yd.active ?? true) } : yd),
              } : v)
            } : m)
          } : b));
        }}
        onRename={(i, name) => {
          const y = parseInt(name);
          if (isNaN(y) || sel.brandIdx === null || sel.modelIdx === null || sel.versionIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? {
              ...m, versions: m.versions.map((v, vi) => vi === sel.versionIdx ? {
                ...v,
                yearData: v.yearData.map((yd, yi) => yi === i ? { ...yd, year: y } : yd),
              } : v)
            } : m)
          } : b));
        }}
        onDelete={i => {
          if (sel.brandIdx === null || sel.modelIdx === null || sel.versionIdx === null) return;
          setData(prev => prev.map((b, bi) => bi === sel.brandIdx ? {
            ...b, models: b.models.map((m, mi) => mi === sel.modelIdx ? {
              ...m, versions: m.versions.map((v, vi) => vi === sel.versionIdx ? { ...v, yearData: v.yearData.filter((_, yi) => yi !== i) } : v)
            } : m)
          } : b));
          setSel(prev => ({ ...prev, yearIdx: null }));
        }}
      />
    </>
  );
};

export default BrandColumnManager;
