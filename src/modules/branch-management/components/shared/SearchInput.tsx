"use client";

import { useState, useEffect } from 'react';
import { MagnifyingGlass, X, CircleNotch } from '@phosphor-icons/react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  delay?: number;
  loading?: boolean;
}

export function SearchInput({
  placeholder = 'Tìm kiếm...',
  onSearch,
  delay = 300,
  loading = false,
}: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {loading ? (
          <CircleNotch className="h-5 w-5 animate-spin" />
        ) : (
          <MagnifyingGlass className="h-5 w-5" />
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
