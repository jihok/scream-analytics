import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatAbbrUSD } from '../utils/Market';
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

  // for routing
  id: string;
}

interface CellParams {
  colId: keyof TableData;
  val: any; // { underlyingName: string, underlyingSymbol: string} | MutableData
}

const CustomCell = ({ colId, val }: CellParams) => {
  if (val.underlyingName) {
    return (
      <div className="flex">
        <Image
          src={`/img/tokens/${val.underlyingSymbol}.svg`}
          width={16}
          height={16}
          alt={val.underlyingSymbol}
        />
        <span className="ml-1 lg:ml-5">
          <p>{val.underlyingSymbol}</p>
          <p className="font-sans-semibold">{val.underlyingName}</p>
        </span>
      </div>
    );
  }

  const { yesterdayVal, todayVal } = val;

  switch (colId) {
    case 'liquidity':
    case 'supplied':
    case 'borrowed':
      return (
        <>
          <span className="text-title font-sans-light">{formatAbbrUSD(todayVal)}</span>
          <PercentChange yesterdayVal={yesterdayVal} todayVal={todayVal} />
        </>
      );
    case 'supplyAPY':
    case 'borrowAPY':
      return (
        <>
          <span className="text-title font-sans-light">{todayVal.toFixed(2)}%</span>
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
        // if there is no matching market yesterday, it's a newly added market
        const marketYesterday = yesterdayMarkets.find((yd) => yd.id === market.id) ?? {
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

          id: market.id,
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
      getRowId: (row) => row.id,
    },
    useSortBy
  );

  return (
    <table {...getTableProps()} className="mt-7 bg-darkGray rounded-md shadow-3xl">
      <thead className="caption-label">
        {headerGroups.map((headerGroup, i) => (
          <tr
            {...headerGroup.getHeaderGroupProps()}
            key={headerGroup.headers[i].id}
            className="border-border-primary border-b text-left"
          >
            {headerGroup.headers.map((column) => {
              // @ts-ignore - UseSortByColumnOptions
              column.sortType = (a: Row, b: Row, accessor: string) => {
                if (accessor === 'asset') {
                  return a.values[accessor].underlyingSymbol.toLowerCase() >
                    b.values[accessor].underlyingSymbol.toLowerCase()
                    ? 1
                    : -1;
                }
                return a.values[accessor].todayVal > b.values[accessor].todayVal ? 1 : -1;
              };
              return (
                <th
                  // @ts-ignore - UseSortByColumnProps
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={column.id}
                >
                  {column.render('Header')}

                  {/* @ts-ignore - UseSortByColumnProps */}
                  {column.isSorted && (
                    <span style={{ fontSize: 6, marginLeft: 3 }}>
                      {/* @ts-ignore - UseSortByColumnProps */}
                      {column.isSortedDesc ? ' ▼' : ' ▲'}
                    </span>
                  )}
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
              <tr
                {...row.getRowProps()}
                style={{ cursor: 'pointer' }}
                className="border-border-secondary border-b"
              >
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
