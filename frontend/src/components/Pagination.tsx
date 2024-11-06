import React, { useState, useEffect } from "react";

interface PaginationProps {
  totalItems: number;
  onPageChange: (pageIndex: number, pageSize: number) => void;
  pageSize?: number;
  pageIndex?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  onPageChange,
  pageSize = 20,
  pageIndex = 1,
}) => {
  const [currentPage, setCurrentPage] = useState(pageIndex);

  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const visiblePages = 10; // Number of pages to display at once

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange(page, pageSize);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value);
    setCurrentPage(1); // Reset to the first page
    onPageChange(1, newSize);
  };

  // Calculate the page range to display based on the current page
  const renderPageNumbers = () => {
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    // Adjust if we're at the end of the page range
    if (endPage - startPage < visiblePages - 1) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg mx-1 ${
            i === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="relative w-full mt-6 flex items-center mb-[100px]">
      {/* Centered Pagination Controls */}
      <div className="flex items-center justify-center space-x-2 w-full">
        {/* Start Button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Start
        </button>

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>

        {/* End Button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          End
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
