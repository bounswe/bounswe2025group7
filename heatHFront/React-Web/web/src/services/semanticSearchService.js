import apiClient from './apiClient';

const search = async (query, topK = 10) => {
    const resp = await apiClient.post('/search', { query, topK });
    return resp.data;
};

export default { search };