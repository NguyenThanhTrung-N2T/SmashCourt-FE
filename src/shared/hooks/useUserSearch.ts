import { useState, useCallback, useEffect } from 'react';
import { searchUsers } from '@/src/api/branch.api';
import type { PaginatedData } from '@/src/shared/types/api.types';
import type { UserSearchResultDto, UserSearchQuery } from '@/src/shared/types/branch.types';
import { handleApiError } from '@/src/modules/branch-management/utils/error-handling';

export function useUserSearch(initialQuery: UserSearchQuery = {}) {
  const [users, setUsers] = useState<PaginatedData<UserSearchResultDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<UserSearchQuery>({
    page: 1,
    pageSize: 10,
    ...initialQuery,
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(query.searchTerm || '');

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(query.searchTerm || '');
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query.searchTerm]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchUsers({
        ...query,
        searchTerm: debouncedSearchTerm,
      });
      setUsers(data);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [query, debouncedSearchTerm]);

  const updateQuery = useCallback((newQuery: Partial<UserSearchQuery>) => {
    setQuery(prev => ({ ...prev, ...newQuery }));
  }, []);

  const setSearchTerm = useCallback((searchTerm: string) => {
    setQuery(prev => ({ ...prev, searchTerm, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery(prev => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    query,
    updateQuery,
    setSearchTerm,
    setPage,
    loadUsers,
  };
}