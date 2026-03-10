interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface ChartPlaceholderProps {
  title: string;
  data: BarData[];
}

export function ChartPlaceholder({ title, data }: ChartPlaceholderProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-700 text-sm mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map(({ label, value, color = 'bg-primary' }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-24 flex-shrink-0 truncate">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${color}`}
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-10 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
