import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatAbbrUSD } from '../utils/Market';
import { useTable, Column, useSortBy, Row, usePagination, useGlobalFilter } from 'react-table';
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
        <div style={{ width: 24, marginRight: 8, position: 'relative' }}>
          <Image
            src={`/images/tokens/${val.underlyingSymbol.toLowerCase()}.png`}
            layout="fill"
            objectFit="contain"
            alt={val.underlyingSymbol}
          />
        </div>
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
          <span className="text-body font-sans-light">{formatAbbrUSD(todayVal)}</span>
          <PercentChange yesterdayVal={yesterdayVal} todayVal={todayVal} />
        </>
      );
    case 'supplyAPY':
    case 'borrowAPY':
      return (
        <>
          <span className="text-body font-sans-light">{todayVal.toFixed(2)}%</span>
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
        Header: 'Supplied',
        accessor: 'supplied',
      },
      {
        Header: 'Supply APY',
        accessor: 'supplyAPY',
      },
      {
        Header: 'Borrowed',
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

  const nameOrSymbolFilter = (rows: any[], _id: any[], filterValue: string) => {
    return rows.filter((row) => {
      const rowName: string = row.values.asset.underlyingName.toLowerCase();
      const rowSymbol: string = row.values.asset.underlyingSymbol.toLowerCase();
      return (
        rowName.includes(filterValue.toLowerCase()) || rowSymbol.includes(filterValue.toLowerCase())
      );
    });
  };

  const PageTurner = () => (
    <>
      <button
        className="px-3 bg-border-primary rounded-l-full border border-white disabled:bg-border-secondary page-button"
        style={{ fontSize: 10 }}
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      >
        ◀
      </button>
      <span
        className="px-4 py-3 border-t border-b border-border-primary text-center text-body"
        style={{ minWidth: 110 }}
      >
        {pageIndex * pageSize + 1} - {Math.min(pageIndex * pageSize + 7, tableData.length)} of{' '}
        {tableData.length}
      </span>
      <button
        className="px-3 bg-bar-6 rounded-r-full border border-white page-button"
        style={{ fontSize: 10 }}
        onClick={() => nextPage()}
        disabled={!canNextPage}
      >
        ▶
      </button>
    </>
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // @ts-ignore
    page,
    prepareRow,
    // @ts-ignore
    canPreviousPage,
    // @ts-ignore
    canNextPage,
    // @ts-ignore
    nextPage,
    // @ts-ignore
    previousPage,
    // @ts-ignore
    state: { pageIndex, pageSize, globalFilter },
    // @ts-ignore
    setGlobalFilter,
  } = useTable<TableData>(
    {
      columns,
      data: tableData,
      initialState: {
        // @ts-ignore
        sortBy: [{ id: 'asset' }],
        pageSize: 7,
      },
      getRowId: (row) => row.id,
      globalFilter: nameOrSymbolFilter,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <>
      <div className="flex justify-between mt-10">
        <div className="flex w-full lg:w-52 border border-border-active rounded-full text-body py-1 px-6 mx-3 lg:mx-0">
          <input
            type="text"
            className="w-full"
            placeholder="Search for a token..."
            value={globalFilter}
            onChange={(val) => setGlobalFilter(val.target.value)}
          />
          <button type="submit" disabled={!globalFilter}>
            <Image
              src="/images/Search.png"
              alt="menu"
              width={23}
              height={23}
              onClick={() => setGlobalFilter(globalFilter)}
            />
          </button>
        </div>
        <div className="hidden lg:flex">
          <PageTurner />
        </div>
      </div>
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

                const getClassName = () => {
                  let res = 'w-fit whitespace-nowrap';
                  if (column.id === 'asset') {
                    res += ' shadow-tableAsset';
                  }
                  if (column.id === 'liquidity') {
                    res += ' hidden lg:table-cell';
                  }
                  return res;
                };

                return (
                  <th
                    // @ts-ignore - UseSortByColumnProps
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                    className={getClassName()}
                  >
                    {column.render('Header')}
                    <span
                      style={{
                        fontSize: 6,
                        marginLeft: 3,
                        width: 10,
                        height: 10,
                        display: 'inline-block',
                      }}
                    >
                      {/* @ts-ignore - UseSortByColumnProps */}
                      {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ' '}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row: any) => {
            prepareRow(row);
            return (
              <Link href={`market/${row.id}`} key={row.id} passHref>
                <tr {...row.getRowProps()} style={{ cursor: 'pointer' }}>
                  {row.cells.map((cell: any) => {
                    const getClassName = () => {
                      if (cell.column.id === 'asset') {
                        return 'shadow-tableAsset';
                      }
                      return cell.column.id === 'liquidity' ? 'hidden lg:table-cell' : '';
                    };
                    return (
                      <td
                        {...cell.getCellProps()}
                        className={getClassName()}
                        key={`${cell.row.id}-${cell.column.id}`}
                      >
                        {cell.render(<CustomCell colId={cell.column.id} val={cell.value} />)}
                      </td>
                    );
                  })}
                </tr>
              </Link>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-center mt-5 lg:hidden">
        <PageTurner />
      </div>
    </>
  );
}
