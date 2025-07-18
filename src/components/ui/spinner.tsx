// src/components/ui/spinner.tsx

import React from 'react';

export default function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}
