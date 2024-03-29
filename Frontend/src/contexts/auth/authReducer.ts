import { IUser } from '../../interfaces';
import { AuthState } from './';

type AuthActionType =
	| { type: '[Auth] - Login'; payload: IUser }
	| { type: '[Auth] - Checking credentials' }
	| { type: '[Auth] - Logout' };
	
export const authReducer = (state: AuthState, action: AuthActionType): AuthState => {
	switch (action.type) {
		case '[Auth] - Login':
			return {
				...state,
				user: action.payload,
				status: 'authenticated',
			};
		case '[Auth] - Checking credentials':
			return {
				...state,
				status: 'checking',
			};
		case '[Auth] - Logout':
			return {
				...state,
				status: 'not-authenticated',
				user: undefined,
			};

		default:
			return state;
	}
};
