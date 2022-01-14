export interface MutableData {
  yesterdayVal: number;
  todayVal: number;
}

export default function PercentChange({ yesterdayVal, todayVal }: MutableData) {
  const percentChange = (() => {
    // avoid dividing by 0
    if (yesterdayVal === 0) {
      return yesterdayVal === todayVal ? 0 : 100;
    }

    return (100 * (todayVal - yesterdayVal)) / yesterdayVal;
  })();

  return (
    <div className={`text-captionColored ${percentChange < 0 ? 'text-negative' : 'text-positive'}`}>
      <span style={{ fontSize: 6, marginRight: 3 }}>{percentChange < 0 ? '▼' : '▲'}</span>
      <span className="label-body">{percentChange.toFixed(2)}%</span>
    </div>
  );
}
