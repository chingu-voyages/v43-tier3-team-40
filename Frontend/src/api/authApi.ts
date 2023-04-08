import axios, { InternalAxiosRequestConfig } from 'axios';

export const authApi = axios.create({
	//Base URL just for development.
	baseURL: 'http://localhost:3000/users',
});

authApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	config.headers['x-token'] = localStorage.getItem('token');
	return config;
});
