import client from './client';

export const getBooks = () => client.get('/book/');
export const getBookById = (id) => client.get(`/book/${id}`);
export const createBook = (data) => client.post('/book/', data);
export const updateBook = (id, data) => client.patch(`/book/${id}`, data);
export const deleteBook = (id) => client.delete(`/book/${id}`);
