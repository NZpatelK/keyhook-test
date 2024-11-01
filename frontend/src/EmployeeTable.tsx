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
  const [sorting, setSorting] = useState<{ columnId: string; direction: string }[]>([
    { columnId: 'first_name', direction: '' },
    { columnId: 'last_name', direction: '' },
    { columnId: 'age', direction: '' },
    { columnId: 'position', direction: '' },
  ]);

  const [search, setSearch] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Fetch data from API with sorting, pagination, and search filters
  const fetchData = async () => {

    const directionsString = sorting
      .filter((item) => item.direction)
      .map((item) => item.direction)
      .join(', ');

    const response = await axios.get(`https://4567-idx-keyhook-test-1730175332904.cluster-bec2e4635ng44w7ed22sa22hes.cloudworkstations.dev/api/v1/employees`, {
      params: { 'page[number]': pageIndex, 'page[size]': pageSize, 'filter[name]': search, sort: directionsString, 'filter[department_name]' : selectedOption ? selectedOption : '' },
    });
    setData(response.data.data.data);
    setPageIndex(response.data.meta.current_page);
    setTotalItems(response.data.meta.total_count);

    const departmentResponse = await axios.get('https://4567-idx-keyhook-test-1730175332904.cluster-bec2e4635ng44w7ed22sa22hes.cloudworkstations.dev/api/v1/departments');
    const departmnetNames = departmentResponse.data.data.map((department: any) => department.attributes.name);
    setDepartmentOptions(['All', ...departmnetNames]);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, sorting, selectedOption]);

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
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const handlePageChange = (pageIndex: number, pageSize: number) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };

  const handleSortingChange = (headerId: string) => {
    console.log("click")

    setSorting((prevSorting) => {
      const currentSort = prevSorting.find((sort) => sort.columnId === headerId);

      // Determine the new direction based on the current direction
      const newDirection = currentSort?.direction === headerId
        ? `-${headerId}` // Ascending to Descending
        : currentSort?.direction === `-${headerId}`
          ? ''              // Descending to Unsorted
          : headerId;       // Unsorted to Ascending

      // Map through sorting to apply the change for the clicked headerId
      return prevSorting.map((sort) =>
        sort.columnId === headerId
          ? { ...sort, direction: newDirection }
          : { ...sort, direction: '' } // Reset direction for other columns
      );
    });
  };

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    fetchData()
  }


  return (
    <div className="table-container">
      <div className="flex justify-end items-center space-x-8 mr-4 mb-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-l-md focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="p-2 bg-blue-500 text-white rounded-r-md"
          >
            Search
          </button>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="department-select" className="mr-2">
            Department Name:
          </label>
          <select
            id="department-select"
            className="border border-gray-300 p-2 rounded focus:outline-none"
            value={selectedOption ? selectedOption : ''}
            onChange={(e) => setSelectedOption(e.target.value === 'All' ? '' : e.target.value)}
          >
            <option value="" disabled selected>
              Select Department
            </option>
            {departmentOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 border" onClick={() => handleSortingChange(header.id)}>
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
      <Pagination totalItems={totalItems} onPageChange={handlePageChange} pageIndex={pageIndex} pageSize={pageSize} />
    </div>
  );
};

export default EmployeeTable;
