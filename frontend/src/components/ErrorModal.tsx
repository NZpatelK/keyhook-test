import React from 'react';
import { Modal, Box, Typography } from '@mui/material';
import { AiOutlineWarning } from 'react-icons/ai';

interface ErrorModalProps {
  open: boolean;
  handleClose: () => void;
  message: string;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

const ErrorModal: React.FC<ErrorModalProps> = ({ open, handleClose, message }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
    >
      <Box sx={style} className="bg-white border border-red-600">
        <div className="flex items-center">
          <AiOutlineWarning className="text-red-600 text-3xl mr-2" />
          <Typography id="error-modal-title" variant="h6" component="h2" className="text-red-600">
            Error
          </Typography>
        </div>
        <Typography id="error-modal-description" sx={{ mt: 2 }}>
          {message}
        </Typography>
        <button
          onClick={handleClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
        >
          Close
        </button>
      </Box>
    </Modal>
  );
};

export default ErrorModal;
