// SearchBar.tsx
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface SearchBarProps {
  onSearch: (search: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    onSearch(search);
  };

  return (
    <div className="flex">
      <TextField
        variant="outlined"
        placeholder="Search name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.375rem 0 0 0.375rem',
            '& fieldset': {
              borderColor: 'gray',
            },
            '&:hover fieldset': {
              borderColor: 'gray',
            },
          },
        }}
      />
      <Button
        onClick={handleSearch}
        variant="contained"
        color="primary"
        className="bg-blue-500 text-white"
        sx={{
          borderRadius: '0 0.375rem 0.375rem 0',
          width: '100px',
          height: '40px',
          minWidth: 'unset',
          padding: '8px 16px',
        }}
      >
        Search
      </Button>
    </div>
  );
};

export default SearchBar;
