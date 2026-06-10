import { useState, useEffect, useCallback } from 'react';
import { fetchBasicBranches } from '@/src/api/branch.api';
import { BranchBasicDto } from '@/src/features/branch/shared/types/branch.types';

export function useReportBranches() {
    const [branches, setBranches] = useState<BranchBasicDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBranches = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchBasicBranches(1, 50); // Get up to 50 branches
            setBranches(data.items);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    return { branches, loading, error };
}
