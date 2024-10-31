import React, { useState } from "react";

interface PaginationProps {
  totalItems: number;
  onPageChange: (pageIndex: number, pageSize: number) => void;
  pageSize?: number;
  pageIndex?: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, onPageChange, pageSize = 20, pageIndex = 1 }) => {
//   const [pageIndex, setPageIndex] = useState<number>(1);
//   const [pageSize, setPageSize] = useState<number>(20);
  const [pageGroup, setPageGroup] = useState<number>(0); // Tracks groups of 10 pages

  // Calculate the total pages based on the current page size
  const totalPages = Math.ceil(totalItems / pageSize);

  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value);
    // setPageSize(newSize);
    // setPageIndex(1); // Reset to the first page
    setPageGroup(0); // Reset to the first page group
    onPageChange(1, newSize); // Call the onPageChange callback with the new page index and page size
  };

  // Render page numbers for the current group (e.g., 1-10, 11-20, etc.)
  const renderPageNumbers = () => {
    const startPage = pageGroup * 10 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    const pageNumbers = [];

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i, pageSize)}
          className={`px-3 py-1 rounded-lg mx-1 ${
            i === pageIndex ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // Handle previous and next group of pages
  const handlePreviousGroup = () => {
    if (pageGroup > 0) setPageGroup(pageGroup - 1);
  };

  const handleNextGroup = () => {
    if ((pageGroup + 1) * 10 < totalPages) setPageGroup(pageGroup + 1);
  };

  return (
    <div className="relative w-full mt-6 flex items-center mb-[100px]">
      {/* Centered Pagination Controls */}
      <div className="flex items-center justify-center space-x-2 w-full">
        <button
          onClick={() => (onPageChange(pageIndex - 1, pageSize))}
          disabled={pageIndex === 1}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={handlePreviousGroup}
          disabled={pageGroup === 0}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          &laquo;
        </button>

        {renderPageNumbers()}

        <button
          onClick={handleNextGroup}
          disabled={(pageGroup + 1) * 10 >= totalPages}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          &raquo;
        </button>

        <button
          onClick={() => {
            onPageChange(pageIndex + 1, pageSize);
          }}
          disabled={pageIndex === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Page Size Selector Positioned to the Right */}
      <select
        value={pageSize}
        onChange={handlePageSizeChange}
        className="absolute right-0 p-2 border rounded-md text-gray-700"
      >
        {[20, 40, 60, 80, 100].map((size) => (
          <option key={size} value={size}>
            {size} per page
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pagination;
