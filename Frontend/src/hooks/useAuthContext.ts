import { useContext } from 'react';
import { AuthContext } from '../contexts';
//This hook returns the AuthContext so there's no need to import useContext and AuthContext everywhere we need it
//and just import this hook.
export const useAuthContext = () => useContext(AuthContext);
