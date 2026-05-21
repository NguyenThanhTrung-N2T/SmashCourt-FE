import { useEffect, useState } from "react";

export function useDebounceSearch<T>(
  searchFn: (term: string) => Promise<T[]>,
  delay = 300
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (!trimmed) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);

        const searchResults = await searchFn(trimmed);

        setResults(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchFn, delay]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    clearResults: () => setResults([]),
  };
}