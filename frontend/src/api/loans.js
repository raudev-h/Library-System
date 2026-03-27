import client from './client';

export const getLoans = (params) => client.get('/loan/', { params });
export const getLoanById = (id) => client.get(`/loan/${id}`);
export const createLoan = (data) => client.post('/loan/', data);
export const returnLoan = (id) => client.post(`/loan/${id}/return`);
export const updateLoan = (id, data) => client.patch(`/loan/${id}`, data);
