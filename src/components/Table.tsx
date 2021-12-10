import React, { useMemo } from 'react';
import Link from 'next/link';
import { formatAbbrUSD, Market } from '../utils/Market';
import { useTable, Column, useSortBy, Row } from 'react-table';
import { useMarketContext } from '../contexts/MarketContext';
import PercentChange, { MutableData } from './PercentChange';

interface TableData {
  asset: { underlyingName: string; underlyingSymbol: string };
  liquidity: MutableData;
  supplied: MutableData;
  supplyAPY: MutableData;
  borrowed: MutableData;
  borrowAPY: MutableData;

  // additional metadata for routing
  data: { id: string; todayIndex: number; yesterdayIndex: number };
}

interface CellParams {
  colId: keyof TableData;
  val: any; // { underlyingName: string, underlyingSymbol: string} | MutableData
}

const CustomCell = ({ colId, val }: CellParams) => {
  if (val.underlyingName) {
    return (
      <a>
        {val.underlyingName} {val.underlyingSymbol}
      </a>
    );
  }

  const { yesterdayVal, todayVal } = val;

  switch (colId) {
    case 'liquidity':
    case 'supplied':
    case 'borrowed':
      return (
        <>
          {formatAbbrUSD(todayVal)}
          <PercentChange yesterdayVal={yesterdayVal} todayVal={todayVal} />
        </>
      );
    case 'supplyAPY':
    case 'borrowAPY':
      return (
        <>
          {todayVal.toFixed(2)}%
          <PercentChange yesterdayVal={yesterdayVal} todayVal={todayVal} />
        </>
      );
    default:
      return <>--</>;
  }
};

export default function Table() {
  const { yesterdayMarkets, todayMarkets } = useMarketContext();
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

  const tableData: TableData[] = useMemo(
    () =>
      todayMarkets.map((market, i) => {
        const yesterdayIndex = yesterdayMarkets.findIndex((yd) => yd.id === market.id);
        // if there is no matching market yesterday, it's a newly added market
        const marketYesterday =
          yesterdayIndex > -1
            ? yesterdayMarkets[yesterdayIndex]
            : {
                ...market,
                totalSupplyUSD: 0,
                totalBorrowsUSD: 0,
                borrowAPY: 0,
                supplyAPY: 0,
              };

        return {
          asset: {
            underlyingName: market.underlyingName,
            underlyingSymbol: market.underlyingSymbol,
          },
          liquidity: {
            todayVal: market.totalSupplyUSD - market.totalBorrowsUSD,
            yesterdayVal: marketYesterday.totalSupplyUSD - marketYesterday.totalBorrowsUSD,
          },
          supplied: {
            todayVal: market.totalSupplyUSD,
            yesterdayVal: marketYesterday.totalSupplyUSD,
          },
          supplyAPY: {
            todayVal: market.supplyAPY,
            yesterdayVal: marketYesterday.supplyAPY,
          },
          borrowed: {
            todayVal: market.totalBorrowsUSD,
            yesterdayVal: marketYesterday.totalBorrowsUSD,
          },
          borrowAPY: {
            todayVal: market.borrowAPY,
            yesterdayVal: marketYesterday.borrowAPY,
          },
          data: {
            id: market.id,
            todayIndex: i,
            yesterdayIndex,
          },
        };
      }),
    [todayMarkets, yesterdayMarkets]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<TableData>(
    {
      columns,
      data: tableData,
      initialState: {
        // @ts-ignore
        sortBy: [{ id: 'liquidity' }],
      },
      getRowId: (row) => row.data.id,
    },
    useSortBy
  );

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup, i) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.headers[i].id}>
            {headerGroup.headers.map((column) => {
              // @ts-ignore - UseSortByColumnOptions
              column.sortType = (a: Row, b: Row, accessor: string) =>
                a.values[accessor][0] > b.values[accessor][0] ? 1 : -1;
              return (
                // @ts-ignore - UseSortByColumnProps
                <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                  {column.render('Header')}
                  {/* @ts-ignore - UseSortByColumnProps */}
                  <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <Link href={`market/${row.id}`} key={row.id} passHref>
              <tr {...row.getRowProps()} style={{ cursor: 'pointer' }}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} key={`${cell.row.id}-${cell.column.id}`}>
                    {
                      // @ts-ignore - type def should but doesn't include JSX.Element
                      cell.render(<CustomCell colId={cell.column.id} val={cell.value} />)
                    }
                  </td>
                ))}
              </tr>
            </Link>
          );
        })}
      </tbody>
    </table>
  );
}
