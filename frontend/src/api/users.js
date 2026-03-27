import client from './client';

export const getUsers = () => client.get('/user/');
export const getUserById = (id) => client.get(`/user/${id}`);
export const createUser = (data) => client.post('/user/', data);
export const updateUser = (id, data) => client.patch(`/user/${id}`, data);
export const deleteUser = (id) => client.delete(`/user/${id}`);
