import { ResponsiveContainer, BarChart, YAxis, Tooltip, Bar } from 'recharts';
import { Buyback } from '../../utils';
import { SUPPLY_COLOR } from '../Market/UtilizationChart';

interface Props {
  data: Buyback[];
}

export default function BuybackChart({ data }: Props) {
  return (
    <div className="flex flex-col p-4 bg-darkGray shadow-3xl mb-6">
      <h3 className="pb-3 mb-3 border-b border-border-secondary">SCREAM Buybacks</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="amount" fill={SUPPLY_COLOR} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
