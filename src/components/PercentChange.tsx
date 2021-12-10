interface Props {
  yesterdayVal: number;
  todayVal: number;
}

export default function PercentChange({ yesterdayVal, todayVal }: Props) {
  const percentChange = (() => {
    // avoid dividing by 0
    if (yesterdayVal === 0) {
      return yesterdayVal === todayVal ? 0 : 100;
    }

    return (100 * (todayVal - yesterdayVal)) / yesterdayVal;
  })();

  return (
    <div className={`metric ${percentChange < 0 ? 'text-negative' : 'text-positive'}`}>
      {percentChange < 0 ? '🔽' : '🔼'}
      {percentChange.toFixed(2)}%
    </div>
  );
}
