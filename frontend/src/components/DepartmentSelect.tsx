// src/components/DepartmentSelect.tsx

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface DepartmentSelectProps {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
  departmentOptions: string[];
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  selectedOption,
  setSelectedOption,
  departmentOptions,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <FormControl size="small" className="w-[300px]">
        <InputLabel id="department-select-label">Select Department</InputLabel>
        <Select
          labelId="department-select-label"
          id="department-select"
          value={selectedOption || ''}
          label="Select Department"
          onChange={(e) => setSelectedOption(e.target.value === 'All' ? '' : e.target.value)}
          className="border border-gray-300 rounded focus:outline-none"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.375rem', // Tailwind's rounded class equivalent
              '& fieldset': {
                borderColor: 'gray',
              },
              '&:hover fieldset': {
                borderColor: 'gray',
              },
            },
          }}
        >
          {departmentOptions.map((option, index) => (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default DepartmentSelect;
