import React, { useMemo } from 'react';
import { formatAbbrUSD, Market } from '../../utils/Market';
import { useTable, Column } from 'react-table';

interface TableData {
  asset: [string, string]; // underlyingName, underlyingSymbol
  liquidity: [number, number]; // value, delta
  supplied: [number, number]; // value, delta
  supplyAPY: [number, number]; // value, delta
  borrowed: [number, number]; // value, delta
  borrowAPY: [number, number]; // value, delta
}

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

  switch (colId) {
    case 'supplied':
    case 'borrowed':
      return (
        <>
          {formatAbbrUSD(val[0])}
          {val[1].toFixed(2)}
        </>
      );
    case 'supplyAPY':
    case 'borrowAPY':
      return (
        <>
          {val[0].toFixed(2)}%{val[1].toFixed(2)}%
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
  const tableData: TableData[] = today.map((market) => {
    const marketYesterday = yesterday.find((yd) => yd.id === market.id);
    return marketYesterday
      ? {
          asset: [market.underlyingName, market.underlyingSymbol],
          liquidity: [
            market.totalSupplyUSD - market.totalBorrowsUSD,
            market.totalSupplyUSD -
              market.totalBorrowsUSD -
              (marketYesterday.totalSupplyUSD - marketYesterday.totalBorrowsUSD),
          ],
          supplied: [market.totalSupplyUSD, market.totalSupplyUSD - marketYesterday.totalSupplyUSD],
          supplyAPY: [market.supplyAPY, market.supplyAPY - marketYesterday.supplyAPY],
          borrowed: [
            market.totalBorrowsUSD,
            market.totalBorrowsUSD - marketYesterday.totalBorrowsUSD,
          ],
          borrowAPY: [market.borrowAPY, market.borrowAPY - marketYesterday.borrowAPY],
        }
      : ({} as TableData);
  });

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
