interface LicensePlatePreviewProps {
  plateType: string;
  plateNumber: string;
}

const plateStyles: Record<string, { bg: string; text: string; border: string }> = {
  white: { bg: 'bg-white', text: 'text-black', border: 'border-2 border-black' },
  yellow: { bg: 'bg-yellow-400', text: 'text-black', border: 'border-2 border-yellow-600' },
  blue: { bg: 'bg-blue-600', text: 'text-white', border: 'border-2 border-blue-800' },
  red: { bg: 'bg-red-600', text: 'text-white', border: 'border-2 border-red-800' },
};

const LicensePlatePreview = ({ plateType, plateNumber }: LicensePlatePreviewProps) => {
  if (!plateType || plateType === 'foreign' || plateType === 'none') return null;

  const style = plateStyles[plateType];
  if (!style) return null;

  return (
    <div className={`inline-flex items-center justify-center px-6 py-3 rounded-md ${style.bg} ${style.text} ${style.border} font-mono text-xl font-bold tracking-wider min-w-[200px] min-h-[52px]`}>
      {plateNumber || '00A-000.00'}
    </div>
  );
};

export default LicensePlatePreview;
