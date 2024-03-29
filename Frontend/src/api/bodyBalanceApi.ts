import axios, { InternalAxiosRequestConfig } from 'axios';

export const bodyBalanceApi = axios.create({
	//Base URL just for development.
	baseURL: 'http://localhost:3000',
});

bodyBalanceApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	config.headers['x-token'] = localStorage.getItem('token');
	return config;
});
