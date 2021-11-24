import React, { useMemo } from 'react';
import { formatAbbrUSD, Market } from '../../utils/Market';
import { useTable, Column } from 'react-table';

interface TableData {
  // [underlyingName, underlyingSymbol]
  asset: [string, string];

  // [value, percentChange]
  liquidity: [number, number];
  supplied: [number, number];
  supplyAPY: [number, number];
  borrowed: [number, number];
  borrowAPY: [number, number];
}

const getPercentChange = (yesterdayVal: number, todayVal: number) => {
  // avoid dividing by 0
  if (yesterdayVal === 0) {
    return yesterdayVal === todayVal ? 0 : 100;
  }

  return (100 * (todayVal - yesterdayVal)) / yesterdayVal;
};

interface CellParams {
  colId: keyof TableData;
  val: [string, string] | [number, number];
}

const CustomCell = ({ colId, val }: CellParams) => {
  // only 'asset' is a string tuple
  if (typeof val[0] === 'string' || typeof val[1] === 'string') {
    return (
      <>
        {val[0]} {val[1]}
      </>
    );
  }

  const [value, percentChange] = val;

  switch (colId) {
    case 'supplied':
    case 'borrowed':
      return (
        <>
          {formatAbbrUSD(value)}
          {percentChange.toFixed(2)}%
        </>
      );
    case 'supplyAPY':
    case 'borrowAPY':
      return (
        <>
          {value.toFixed(2)}%{percentChange.toFixed(2)}%
        </>
      );
    default:
      return <>--</>;
  }
};

interface Props {
  yesterday: Market[];
  today: Market[];
}

export default function Table({ yesterday, today }: Props) {
  const columns = useMemo<Column<TableData>[]>(
    () => [
      {
        Header: 'Asset',
        accessor: 'asset',
      },
      {
        Header: 'Liquidity',
        accessor: 'liquidity',
      },
      {
        Header: 'Total Supply',
        accessor: 'supplied',
      },
      {
        Header: 'Supply APY',
        accessor: 'supplyAPY',
      },
      {
        Header: 'Total Borrows',
        accessor: 'borrowed',
      },
      {
        Header: 'Borrow APY',
        accessor: 'borrowAPY',
      },
    ],
    []
  );

  console.log(yesterday, today);
  const tableData: TableData[] = today.map((market) => {
    // if there is no matching market yesterday, it's a newly added market
    const marketYesterday = yesterday.find((yd) => yd.id === market.id) ?? {
      ...market,
      totalSupplyUSD: 0,
      totalBorrowsUSD: 0,
      borrowAPY: 0,
      supplyAPY: 0,
    };

    return {
      asset: [market.underlyingName, market.underlyingSymbol],
      liquidity: [
        market.totalSupplyUSD - market.totalBorrowsUSD,
        getPercentChange(
          marketYesterday.totalSupplyUSD - marketYesterday.totalBorrowsUSD,
          market.totalSupplyUSD - market.totalBorrowsUSD
        ),
      ],
      supplied: [
        market.totalSupplyUSD,
        getPercentChange(marketYesterday.totalSupplyUSD, market.totalSupplyUSD),
      ],
      supplyAPY: [market.supplyAPY, getPercentChange(marketYesterday.supplyAPY, market.supplyAPY)],
      borrowed: [
        market.totalBorrowsUSD,
        getPercentChange(marketYesterday.totalBorrowsUSD, market.totalBorrowsUSD),
      ],
      borrowAPY: [market.borrowAPY, getPercentChange(marketYesterday.borrowAPY, market.borrowAPY)],
    };
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<TableData>({
    columns,
    data: tableData,
  });

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup, i) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.headers[i].id}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} key={column.id}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()} key={`${cell.row.id}-${cell.column.id}`}>
                  {
                    // @ts-ignore - type def should but doesn't include JSX element
                    cell.render(<CustomCell colId={cell.column.id} val={cell.value} />)
                  }
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
