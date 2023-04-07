import { useAuthContext } from '../../hooks';

export const HomePage = () => {
	const { user } = useAuthContext();
	return (
		<div>
			<h1>HomePage</h1>
			{user && (
				<h1>
					User name:{user.name} -- User email:{user.email}
				</h1>
			)}
		</div>
	);
};
