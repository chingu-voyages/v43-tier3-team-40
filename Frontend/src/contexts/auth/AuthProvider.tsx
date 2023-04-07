import { PropsWithChildren, useReducer } from 'react';
import { AuthContext, authReducer } from '.';
import { IUser } from '../../interfaces';
export interface AuthState {
	status: 'authenticated' | 'not-authenticated' | 'checking';
	user?: IUser;
}

const Auth_INITIAL_STATE: AuthState = {
	status: 'not-authenticated',
	user: undefined,
};
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, Auth_INITIAL_STATE);

	// startLogin function should call the login endpoint and the backend should
	// return a user with just the email and name in case that the credentials are correct.
	// For the moment i'm using the password as the name just for testing
	const startLogin = (email: string, password: string) => {
		dispatch({ type: '[Auth] - Checking credentials' });

		//TODO:
		//! Make this function async
		//! Make a try/catch calling the login endpoint,
		//! Try the login and if everything is correct use the data coming from the backend to dispatch login.
		//! If credentials are bad or something is wrong from the backend, dispatch the logout.

		setTimeout(() => {
			dispatch({ type: '[Auth] - Login', payload: { email, name: password } });
			
		}, 2000);
	};

	//startRegister function is very similar to login, but in this case
	//it should call the createUser endpoint and make the login if everything is correct, or logout if something goes wrong
	const startRegister = (name: string, email: string, password: string) => {
		dispatch({ type: '[Auth] - Checking credentials' });
		setTimeout(() => {
			dispatch({ type: '[Auth] - Login', payload: { email, name } });
			
		}, 2000);
	};

	const logout = () => dispatch({ type: '[Auth] - Logout' });
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
