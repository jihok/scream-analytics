import { formatAbbrUSD } from '../utils/Market';
import PercentChange from './PercentChange';

interface Props {
  label: string;
  type?: 'dollars' | 'percent';
  value: string | number;
  yesterdayValue?: number;
  className?: string;
}

export default function ValueWithLabel({ label, type, value, yesterdayValue, className }: Props) {
  const formatValue = () => {
    if (typeof value === 'number') {
      switch (type) {
        case 'dollars':
          return formatAbbrUSD(value);
        case 'percent':
          return `${value.toFixed(2)}%`;
        default:
      }
    }
    return value;
  };

  return (
    <div className={className}>
      <div className="text-body font-sans-semibold pb-1">{label}</div>
      <h2 className="py-1">{formatValue()}</h2>
      {yesterdayValue && <PercentChange yesterdayVal={yesterdayValue} todayVal={+value} />}
    </div>
  );
}
