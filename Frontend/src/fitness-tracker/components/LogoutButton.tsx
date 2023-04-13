import { useAuthContext } from '../../hooks';

export const LogoutButton = () => {
	const { logout } = useAuthContext();
	return (
		<button className='text-red-600 font-medium text-lg lg:text-xl xl:text-2xl' onClick={logout}>
			Logout
		</button>
	);
};
