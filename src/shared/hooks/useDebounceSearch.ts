import { useEffect, useState } from "react";

/**
 * Generic debounce hook for debouncing any value.
 * Returns the debounced value and a pending state.
 */
export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (value === debouncedValue) {
      const timer = setTimeout(() => {
        setIsPending(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    setIsPending(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, debouncedValue]);

  return { debouncedValue, isPending };
}

/**
 * Specialized hook for asynchronous searching with debouncing.
 */
export function useDebounceSearch<T>(
  searchFn: (term: string) => Promise<T[]>,
  delay = 300
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const { debouncedValue, isPending: loading } = useDebounce(searchTerm, delay);

  useEffect(() => {
    const trimmed = debouncedValue?.trim();

    if (!trimmed) {
      const timer = setTimeout(() => {
        setResults([]);
      }, 0);
      return () => clearTimeout(timer);
    }

    const executeSearch = async () => {
      try {
        const searchResults = await searchFn(trimmed);
        setResults(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      }
    };

    executeSearch();
  }, [debouncedValue, searchFn]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    clearResults: () => setResults([]),
  };
}