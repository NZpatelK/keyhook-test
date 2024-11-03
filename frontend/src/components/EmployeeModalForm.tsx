// EmployeeFormModal.tsx
import React, { useState } from 'react';
import { Modal, Box, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
}

interface EmployeeFormModalProps {
  onAddEmployee: (employee: Employee) => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ onAddEmployee }) => {
  const [open, setOpen] = useState(false);
  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    position: '',
    department: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setEmployee((prev) => ({ ...prev, department: e.target.value as string }));
  };

  const handleSubmit = () => {
    if (employee.firstName && employee.lastName && employee.position && employee.department) {
      const newEmployee = { id: Date.now(), ...employee };
      onAddEmployee(newEmployee);
      setEmployee({ firstName: '', lastName: '', position: '', department: '' });
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
              name="firstName"
              variant="outlined"
              fullWidth
              className="mb-4"
              value={employee.firstName}
              onChange={handleChange}
            />
            <TextField
              label="Last Name"
              name="lastName"
              variant="outlined"
              fullWidth
              className="mb-4"
              value={employee.lastName}
              onChange={handleChange}
            />
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
                value={employee.department}
                // onChange={handleSelectChange}
                label="Department"
              >
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Human Resources">Human Resources</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
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
