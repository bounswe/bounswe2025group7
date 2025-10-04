import { useEffect, useState } from 'react';

export function usePaginatedList<T>(fetchPage: (page: number) => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPage(page).then((items) => setData((prev) => [...prev, ...items]));
  }, [page]);

  return { data, loadMore: () => setPage((p) => p + 1) };
}


