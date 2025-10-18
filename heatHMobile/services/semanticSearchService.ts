import { apiClient } from './apiClient';

export const semanticSearchService = {
  search: (query: string, topK: number = 10) => 
    apiClient.post<any>('/search', { query, topK }).then((r: any) => r.data),
};

