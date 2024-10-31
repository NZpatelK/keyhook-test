import React, { useEffect, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import Pagination from './components/Pagination';

// Define types for employee data
type Employee = {
  first_name: string;
  last_name: string;
  age: number;
  position: string;
  department_name: string;
};

// Column helper for defining columns
const columnHelper = createColumnHelper<Employee>();

const EmployeeTable = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [sorting, setSorting] = useState([]);
  const [search, setSearch] = useState('');

  // Fetch data from API with sorting, pagination, and search filters
  const fetchData = async () => {
    const response = await axios.get(`https://4567-idx-keyhook-test-1730175332904.cluster-bec2e4635ng44w7ed22sa22hes.cloudworkstations.dev/api/v1/employees?`, {
      params: { 'page[number]': pageIndex, 'page[size]': pageSize, 'filter[name]': search },
    });
    setData(response.data.data.data);
    setPageIndex(response.data.meta.current_page);
    setTotalItems(response.data.meta.total_count);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, search]);

  // Define table columns
  const columns = [
    columnHelper.accessor('first_name', {
      header: 'First Name',
      sortingFn: 'text',
    }),
    columnHelper.accessor('last_name', {
      header: 'Last Name',
      sortingFn: 'text',
    }),
    columnHelper.accessor('age', {
      header: 'Age',
      sortingFn: 'basic',
    }),
    columnHelper.accessor('position', {
      header: 'Position',
      sortingFn: 'text',
    }),
    columnHelper.accessor('department_name', {
      header: 'Department Name',
    }),
  ];

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    // onPaginationChange: ({ pageIndex, pageSize }) => {
    //   setPageIndex(pageIndex);
    //   setPageSize(pageSize);
    // },
    // onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const handlePageChange = (pageIndex: number, pageSize: number) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };

  return (
    <div className="table-container">
      <input
        className="border p-2 mb-4"
        type="text"
        placeholder="Search name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="min-w-full bg-white">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 border">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination totalItems={totalItems} onPageChange={handlePageChange} pageIndex={pageIndex} pageSize={pageSize}/>
    </div>
  );
};

export default EmployeeTable;
