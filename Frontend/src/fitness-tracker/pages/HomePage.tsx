import { useAuthContext } from '../../hooks';

export const HomePage = () => {
	const { user } = useAuthContext();
	return (
		<div>
			<h1>HomePage</h1>
			{user && (
				<h1>
					User name:{user.username} -- User email:{user.email}
				</h1>
			)}
		</div>
	);
};
