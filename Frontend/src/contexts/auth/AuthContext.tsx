import { createContext } from 'react';
import { IUser } from '../../interfaces';

interface ContextProps {
	//* Properties
	status: 'authenticated' | 'not-authenticated' | 'checking';
	user?: IUser;

	//* Methods
	startLogin: (email: string, password: string) => void;
	startRegister: (name: string, email: string, password: string) => void;
	logout: () => void;
}

export const AuthContext = createContext({} as ContextProps);
