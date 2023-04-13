import { useAuthContext } from '../../hooks';

export const DashboardPage = () => {
	const { user } = useAuthContext();
	return (
		<div>
			<h1>DashboardPage</h1>
			{user && (
				<h1>
					User name:{user.username} -- User email:{user.email}
				</h1>
			)}
		</div>
	);
};
