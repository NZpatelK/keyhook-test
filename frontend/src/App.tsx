// src/App.tsx
import React from 'react';
import EmployeeTable from './EmployeeTable';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-center my-4">Employee Directory</h1>
      <EmployeeTable />
    </div>
  );
};

export default App;
