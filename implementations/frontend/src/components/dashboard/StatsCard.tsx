import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'orange' | 'yellow' | 'green' | 'blue';
  description?: string;
}

const colorClasses = {
  orange: { bg: 'bg-orange-50', icon: 'bg-primary/10 text-primary', border: 'border-orange-100' },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-accent/10 text-accent-dark', border: 'border-yellow-100' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', border: 'border-green-100' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-100' },
};

export function StatsCard({ title, value, icon: Icon, color = 'orange', description }: StatsCardProps) {
  const colors = colorClasses[color];
  return (
    <div className={clsx('rounded-2xl p-5 border', colors.bg, colors.border)}>
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  );
}
