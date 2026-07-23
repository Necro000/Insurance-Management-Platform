import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for standard data fetching with data, loading, error, and refetch.
 * @param {Function} fetchFn - Async API function returning promise
 * @param {Array} dependencies - Dependency array for automatic refetch
 */
export function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      if (res && res.success !== false) {
        setData(res.data ?? res);
      } else {
        setError(res?.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export default useFetch;
