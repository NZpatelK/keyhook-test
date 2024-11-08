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
import EmployeeFormModal from './components/EmployeeModalForm';
import SearchBar from './components/SearchBar';
import DepartmentSelect from './components/DepartmentSelect';
import toast, { Toaster } from 'react-hot-toast';
import ErrorModal from './components/ErrorModal';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';


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
  const [search, setSearch] = useState<String>('');
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [sorting, setSorting] = useState<{ columnId: string; direction: string }[]>([
    { columnId: 'first_name', direction: '' },
    { columnId: 'last_name', direction: '' },
    { columnId: 'age', direction: '' },
    { columnId: 'position', direction: '' },
  ]);


  // Fetch data from API with sorting, pagination, and search filters
  const fetchData = async () => {

    const directionsString = sorting
      .filter((item) => item.direction)
      .map((item) => item.direction)
      .join(', ');

    const response = await axios.get(`https://localhost:4567/api/v1/employees`, {
      params: { 'page[number]': pageIndex, 'page[size]': pageSize, 'filter[name]': search, sort: directionsString, 'filter[department_name]': selectedOption ? selectedOption : '' },
    });
    setData(response.data.data.data);
    setPageIndex(response.data.meta.current_page);
    setTotalItems(response.data.meta.total_count);

    const departmentResponse = await axios.get('https://localhost:4567/api/v1/departments');
    const departmnetNames = departmentResponse.data.data.map((department: any) => department.attributes.name);
    setDepartmentOptions(departmnetNames);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, sorting, selectedOption, search]);

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

  const getSortingIcon = (headerId: any) => {
    const currentSort = sorting.find((sort) => sort.columnId === headerId);

    if (currentSort?.direction === headerId) return <ArrowUpwardIcon fontSize="small" />;
    if (currentSort?.direction === `-${headerId}`) return <ArrowDownwardIcon fontSize="small" />;
    return <UnfoldMoreIcon fontSize="small" />;
  };


  const handleErrorClose = () => {
    setErrorModalOpen(false);
    setErrorMessage('');
  };



  const handleAddEmployee = async (employee: any) => {
    try {
      const headers = {
        'Content-Type': 'application/vnd.api+json', // Set the content type
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Example for an authorization header (if needed)
      };

      const response = await axios.post('https://localhost:4567/api/v1/employees', {
        data: {
          type: "employees",
          attributes: employee,
        },
      }, { headers });

      // Handle successful response
      console.log('Employee created:', response.data);
      toast.success('Successful Add Employee')
      // Optionally reset the form or show success message
    } catch (error: any) {
      console.log(error)
      if (axios.isAxiosError(error)) {
        toast.error('Error creating employee')
        setErrorMessage(error.response?.data.errors);
        setErrorModalOpen(true);
      } else {
        // Handle unexpected errors
        toast.error('Error creating employee')
        setErrorMessage(error);
        setErrorModalOpen(true);
      }
    }
  }

  return (
    <div className="table-container">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <ErrorModal open={errorModalOpen} handleClose={handleErrorClose} message={errorMessage} />
      <div className="flex justify-between items-center my-8 px-4">

        <div className="flex items-center space-x-8">
          <SearchBar onSearch={search => { setSearch(search) }} />

          <DepartmentSelect selectedOption={selectedOption || ''} setSelectedOption={function (value: string): void {
            setSelectedOption(value === 'All' ? '' : value);
          }} departmentOptions={['All', ...departmentOptions]} />
        </div>
        <EmployeeFormModal onAddEmployee={handleAddEmployee} departmentOptions={departmentOptions} />
      </div>
      <table className="min-w-full bg-white">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 border cursor-pointer"
                  onClick={() => handleSortingChange(header.id)}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="ml-2">{getSortingIcon(header.id)}</span>
                    </>
                  )}
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
