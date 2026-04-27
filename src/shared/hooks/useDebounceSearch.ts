import { useState, useEffect } from 'react';

export function useDebounceSearch<T>(
  searchFn: (term: string) => Promise<{ items: T[] }>,
  delay = 300
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchFn(searchTerm);
        setResults(searchResults.items);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchFn, delay]);

  return { searchTerm, setSearchTerm, results, loading };
}