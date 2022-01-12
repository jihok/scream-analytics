interface Props {
  previousPage: () => void;
  canPreviousPage: boolean;
  pageIndex: number;
  pageSize: number;
  tableData: Array<any>;
  nextPage: () => void;
  canNextPage: boolean;
}

export default function PageTurner({
  previousPage,
  canPreviousPage,
  pageIndex,
  pageSize,
  tableData,
  nextPage,
  canNextPage,
}: Props) {
  return (
    <>
      <button
        className="px-3 bg-border-primary rounded-l-full border border-white disabled:bg-border-secondary page-button"
        style={{ fontSize: 10 }}
        onClick={previousPage}
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
        onClick={nextPage}
        disabled={!canNextPage}
      >
        ▶
      </button>
    </>
  );
}
