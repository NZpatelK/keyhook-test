import React, { useState } from 'react';
import { Modal, Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';

interface Employee {
  first_name: string;
  last_name: string;
  age: number; // Age should be a number
  position: string;
  department_name: string;
}

interface EmployeeFormModalProps {
  onAddEmployee: (employee: Employee) => void;
  departmentOptions: string[];
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ onAddEmployee, departmentOptions }) => {
  const [open, setOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee>({
    first_name: '',
    last_name: '',
    age: 0, // Initialize age as a number
    position: '',
    department_name: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
      setEmployee((prev) => ({ ...prev, [name]: Number(value) })); // Convert age to a number
    } else {
      setEmployee((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setEmployee((prev) => ({ ...prev, department_name: e.target.value as string }));
  };

  const handleSubmit = () => {
    if (employee.first_name && employee.last_name && employee.age > 0 && employee.position && employee.department_name) {
      const newEmployee = employee;
      onAddEmployee(newEmployee);
      setEmployee({ first_name: '', last_name: '', age: 0, position: '', department_name: '' }); // Reset age to 0
      handleClose();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Employee
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          className="bg-white p-8 rounded-lg shadow-lg mx-auto mt-20"
          sx={{ width: 400, outline: 'none' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Add New Employee</h2>

          <div className="space-y-5">
            <TextField
              label="First Name"
              name="first_name"
              variant="outlined"
              fullWidth
              className="mb-4"
              value={employee.first_name}
              onChange={handleChange}
            />
            <div className="flex gap-2">
              <TextField
                label="Last Name"
                name="last_name"
                variant="outlined"
                fullWidth
                className="mb-4"
                value={employee.last_name}
                onChange={handleChange}
              />
              <TextField
                label="Age"
                name="age"
                variant="outlined"
                type="number"
                inputProps={{ min: 0 }} // Set a minimum age of 0
                className="mb-4"
                value={employee.age}
                onChange={handleChange}
              />
            </div>
            <TextField
              label="Position"
              name="position"
              variant="outlined"
              fullWidth
              className="mb-4"
              value={employee.position}
              onChange={handleChange}
            />
            <FormControl fullWidth className="mb-4">
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={employee.department_name}
                onChange={handleSelectChange}
                label="Department"
              >
                {departmentOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              className="px-6 py-2"
            >
              Add
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EmployeeFormModal;
