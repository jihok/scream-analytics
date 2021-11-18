import { Market } from '../../queries';

interface Props {
  yesterday: Market[];
  today: Market[];
}

const displayAsMillions = (value: string) =>
  Math.floor(+value / 1_000_000) > 0
    ? `${(+(+value / 1_000_000).toFixed(2)).toLocaleString()} M`
    : `${(+value / 1_000).toFixed(2)} K`;
export default function AssetsTable({ yesterday, today }: Props) {
  return (
    <table>
      <tr>
        <th>Asset</th>
        <th>Total Supply</th>
        <th>Supply APY</th>
        <th>Total Borrow</th>
        <th>Borrow APY</th>
      </tr>
      {today.map((market) => (
        <tr key={market.underlyingSymbol}>
          <td>
            <div>{market.underlyingSymbol}</div>
            {market.underlyingName}
          </td>
          <td>{displayAsMillions(market.totalSupply)}</td>
          <td>{`${(+market.supplyRate).toFixed(2)} %`}</td>
          <td>{displayAsMillions(market.totalBorrows)}</td>
          <td>{`${(+market.borrowRate).toFixed(2)} %`}</td>
        </tr>
      ))}
    </table>
  );
}
