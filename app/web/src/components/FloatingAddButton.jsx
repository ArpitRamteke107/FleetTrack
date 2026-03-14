import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

const FloatingAddButton = ({ onClick, disabled = false }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg shadow-amber-700/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-amber-700/40 z-40 p-0"
      aria-label="Add new item"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
};

export default FloatingAddButton;
