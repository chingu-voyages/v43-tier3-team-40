import { PropsWithChildren, useCallback, useEffect, useReducer } from 'react';
import { authApi } from '../../api';
import { IUser } from '../../interfaces';
import { AuthContext, authReducer } from './';
export interface AuthState {
	status: 'authenticated' | 'not-authenticated' | 'checking';
	user?: IUser;
}
interface AuthResponse extends IUser {
	token: string;
}

const Auth_INITIAL_STATE: AuthState = {
	status: 'not-authenticated',
	user: undefined,
};
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, Auth_INITIAL_STATE);

	const startLogin = async (username: string, password: string): Promise<void> => {
		dispatch({ type: '[Auth] - Checking credentials' });
		try {
			const { data } = await authApi.post<AuthResponse>('/login', { username, password });
			const { token } = data;
			localStorage.setItem('token', token);
			dispatch({ type: '[Auth] - Login', payload: { email:data.email, username } });
		} catch (error) {
			console.error(error);
			//We should create a modal or a popover to provide the user information if something goes wrong.
			dispatch({ type: '[Auth] - Logout' });
		}
	};

	const startRegister = async (username: string, email: string, password: string): Promise<void> => {
		dispatch({ type: '[Auth] - Checking credentials' });
		try {
			const { data } = await authApi.post<AuthResponse>('/createUser', { username, email, password });
			const { token } = data;
			localStorage.setItem('token', token);
			dispatch({ type: '[Auth] - Login', payload: { email, username } });
		} catch (error) {
			console.error(error);
			//We should create a modal or a popover to provide the user information if something goes wrong.
			dispatch({ type: '[Auth] - Logout' });
		}
	};

	const checkAuthToken = useCallback(async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			dispatch({ type: '[Auth] - Logout' });
			return;
		}
		try {
			const { data } = await authApi.get('/renew');
			const { username, email } = data;
			localStorage.setItem('token', data.token);
			dispatch({ type: '[Auth] - Login', payload: { email, username } });
		} catch (error) {
			console.error(error);
			dispatch({ type: '[Auth] - Logout' });
		}
	}, []);

	const logout = () => {
		localStorage.clear();
		dispatch({ type: '[Auth] - Logout' });
	};

	useEffect(() => {
		checkAuthToken();
	}, []);
	return (
		<AuthContext.Provider
			value={{
				//* Properties
				...state,
				//* Methods
				startLogin,
				startRegister,
				logout,
			}}>
			{children}
		</AuthContext.Provider>
	);
};
