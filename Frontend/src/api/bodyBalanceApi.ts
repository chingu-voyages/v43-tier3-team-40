import axios, { InternalAxiosRequestConfig } from 'axios';

export const bodyBalanceApi = axios.create({
	//Base URL just for development.
	baseURL: 'http://bodybalance-production.up.railway.app',
});

bodyBalanceApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	config.headers['x-token'] = localStorage.getItem('token');
	return config;
});
