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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
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
        className="w-full rounded-xl border border-border bg-surface-2 pl-11 pr-11 py-3 text-sm text-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20 placeholder:text-muted"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
