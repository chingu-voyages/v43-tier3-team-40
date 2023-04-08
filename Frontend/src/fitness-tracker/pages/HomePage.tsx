import { useAuthContext } from '../../hooks';

export const HomePage = () => {
	const { user, logout } = useAuthContext();
	return (
		<div>
			<h1>HomePage</h1>
			<button onClick={logout} className='border border-red-500 p-3'>
				Logout
			</button>
			{user && (
				<h1>
					User name:{user.username} -- User email:{user.email}
				</h1>
			)}
		</div>
	);
};
