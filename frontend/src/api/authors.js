import client from './client';

export const getAuthors = () => client.get('/author/');
export const getAuthorById = (id) => client.get(`/author/${id}`);
export const createAuthor = (data) => client.post('/author/', data);
export const updateAuthor = (id, data) => client.patch(`/author/${id}`, data);
