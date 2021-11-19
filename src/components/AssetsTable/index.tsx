import { Market } from '../../utils/Market';

interface Props {
  yesterday: Market[];
  today: Market[];
}

const formatDisplay = (value: number) =>
  Math.floor(value / 1_000_000) > 0
    ? `${(+(value / 1_000_000).toFixed(2)).toLocaleString()} M`
    : `${(value / 1_000).toFixed(2)} K`;

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
          <td>{formatDisplay(market.totalSupplyUSD)}</td>
          <td>{`${(+market.supplyAPY).toFixed(2)} %`}</td>
          <td>{formatDisplay(market.totalBorrowsUSD)}</td>
          <td>{`${(+market.borrowAPY).toFixed(2)} %`}</td>
        </tr>
      ))}
    </table>
  );
}
